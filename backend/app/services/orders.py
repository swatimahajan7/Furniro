"""Placing and reading orders (docs/API_CONTRACT.md §2.6)."""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.errors import (
    CART_EMPTY,
    INSUFFICIENT_STOCK,
    ORDER_NOT_FOUND,
    BadRequestError,
    ConflictError,
    ErrorDetail,
    NotFoundError,
    UnprocessableError,
)
from app.models import Order, OrderItem, Product
from app.models.order import order_number_for
from app.schemas.order import BillingIn, OrderRead, PaymentMethod
from app.services import cart as cart_service
from app.services.meta import get_locations


def _check_location(billing: BillingIn) -> None:
    """Country and province must be one of the /meta/locations pairs (FR-CHK-02)."""
    country = next((c for c in get_locations() if c.code == billing.country), None)
    if country is None:
        raise UnprocessableError(
            f"Unknown country '{billing.country}'",
            details=[
                ErrorDetail(field="billing.country", message="Choose a country from the list")
            ],
        )
    if not any(p.code == billing.province for p in country.provinces):
        raise UnprocessableError(
            f"Unknown province '{billing.province}' for {country.name}",
            details=[
                ErrorDetail(field="billing.province", message="Choose a province from the list")
            ],
        )


def place_order(
    session: Session, cart_id: uuid.UUID, *, billing: BillingIn, payment_method: PaymentMethod
) -> Order:
    cart = cart_service.get_cart(session, cart_id)
    if not cart.items:
        raise BadRequestError("Your cart is empty", code=CART_EMPTY)
    _check_location(billing)

    # Lock the products (PostgreSQL; a no-op on SQLite) so two checkouts cannot oversell.
    product_ids = [item.product_id for item in cart.items]
    products = {
        p.id: p
        for p in session.scalars(
            select(Product).where(Product.id.in_(product_ids)).with_for_update()
        )
    }
    short = [
        ErrorDetail(field=f"items.{index}", message=f"Only {product.stock} of {product.name} left")
        for index, item in enumerate(cart.items)
        if item.quantity > (product := products[item.product_id]).stock
    ]
    if short:
        raise ConflictError(
            "Some items are no longer available in the quantity you chose",
            code=INSUFFICIENT_STOCK,
            details=short,
        )

    order = Order(
        email=billing.email.lower(),
        payment_method=payment_method.value,
        billing=billing.model_dump(mode="json"),
        subtotal_minor=0,
        total_minor=0,
    )
    for item in cart.items:
        product = products[item.product_id]
        line_total = product.price_minor * item.quantity
        order.items.append(
            OrderItem(
                product_id=product.id,
                product_slug=product.slug,
                product_name=product.name,
                image_url=product.image_url,
                size=item.size,
                color=item.color,
                quantity=item.quantity,
                unit_price_minor=product.price_minor,
                line_total_minor=line_total,
            )
        )
        order.subtotal_minor += line_total
        product.stock -= item.quantity
    order.total_minor = order.subtotal_minor  # free shipping, no tax (PLAN.md §2.2)

    session.add(order)
    session.flush()
    order.order_number = order_number_for(order.id)
    cart.items.clear()
    session.commit()
    return order


def get_order(session: Session, order_number: str, *, email: str) -> Order:
    """Guests look an order up with the email used at checkout. A wrong email is a 404 too,
    so order numbers cannot be probed."""
    order = session.scalar(
        select(Order)
        .where(Order.order_number == order_number.upper())
        .options(selectinload(Order.items))
    )
    if order is None or order.email != email.strip().lower():
        raise NotFoundError(f"Order {order_number} not found", code=ORDER_NOT_FOUND)
    return order


def to_read(order: Order) -> OrderRead:
    if order.order_number is None:  # set in the same transaction that inserts the order
        raise RuntimeError(f"Order {order.id} has no order number")
    # model_validate coerces the stored strings/JSON into the enums and BillingRead.
    return OrderRead.model_validate(
        {
            "order_number": order.order_number,
            "status": order.status,
            "payment_method": order.payment_method,
            "billing": order.billing,
            "items": [
                {
                    "product_slug": item.product_slug,
                    "product_name": item.product_name,
                    "image_url": item.image_url,
                    "size": item.size or None,
                    "color": item.color or None,
                    "quantity": item.quantity,
                    "unit_price_minor": item.unit_price_minor,
                    "line_total_minor": item.line_total_minor,
                }
                for item in order.items
            ],
            "subtotal_minor": order.subtotal_minor,
            "total_minor": order.total_minor,
            "created_at": order.created_at,
        }
    )
