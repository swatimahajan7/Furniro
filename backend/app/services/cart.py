"""Server-side carts (docs/API_CONTRACT.md §2.5). Totals always use current product prices.

Guests use the cart named by `X-Cart-Id`; a logged-in user always uses their own cart.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.errors import (
    CART_ITEM_NOT_FOUND,
    CART_NOT_FOUND,
    INSUFFICIENT_STOCK,
    PRODUCT_NOT_FOUND,
    ConflictError,
    ErrorDetail,
    NotFoundError,
    UnprocessableError,
)
from app.models import Cart, CartItem, Product, User
from app.models.cart import MAX_LINE_QUANTITY
from app.schemas.cart import CartItemRead, CartRead
from app.schemas.catalog import ProductSummary


def parse_cart_id(raw: str | None) -> uuid.UUID:
    """The `X-Cart-Id` header. Missing or malformed IDs are simply carts that don't exist."""
    try:
        return uuid.UUID(raw or "")
    except ValueError:
        raise NotFoundError("Cart not found", code=CART_NOT_FOUND) from None


def create_cart(session: Session, user: User | None = None) -> Cart:
    """A new guest cart, or (when logged in) the user's cart, created on first use."""
    if user is not None:
        return get_cart(session, user_cart_id(session, user))
    cart = Cart()
    session.add(cart)
    session.commit()
    return get_cart(session, cart.id)


def user_cart_id(session: Session, user: User) -> uuid.UUID:
    cart_id = session.scalar(select(Cart.id).where(Cart.user_id == user.id))
    if cart_id is not None:
        return cart_id
    cart = Cart(user_id=user.id)
    session.add(cart)
    session.commit()
    return cart.id


def resolve_cart_id(session: Session, user: User | None, header: str | None) -> uuid.UUID:
    """Which cart a request acts on: the user's own when logged in, else the X-Cart-Id one."""
    if user is not None:
        return user_cart_id(session, user)
    cart_id = parse_cart_id(header)
    # A user's cart is reachable only with their token, never by its ID alone (e.g. after logout).
    if session.scalar(select(Cart.user_id).where(Cart.id == cart_id)) is not None:
        raise NotFoundError("Cart not found", code=CART_NOT_FOUND)
    return cart_id


def merge_guest_cart(session: Session, user: User, header: str | None) -> Cart:
    """Move the guest cart's lines into the user's cart (on login), then delete the guest cart.

    Matching lines add up but are clamped to min(10, stock) instead of failing, because a login
    should never error over quantities. An unknown or missing guest cart is simply ignored.
    """
    target = get_cart(session, user_cart_id(session, user))
    try:
        guest = get_cart(session, parse_cart_id(header))
    except NotFoundError:
        return target
    if guest.id == target.id or guest.user_id is not None:
        return target

    for item in list(guest.items):
        line = next(
            (
                existing
                for existing in target.items
                if existing.product_id == item.product_id
                and existing.size == item.size
                and existing.color == item.color
            ),
            None,
        )
        cap = line_cap(item.product)
        if line:
            line.quantity = min(line.quantity + item.quantity, max(cap, line.quantity))
        elif cap > 0:
            target.items.append(
                CartItem(
                    product_id=item.product_id,
                    quantity=min(item.quantity, cap),
                    size=item.size,
                    color=item.color,
                )
            )
    session.delete(guest)
    session.commit()
    return get_cart(session, target.id)


def get_cart(session: Session, cart_id: uuid.UUID) -> Cart:
    cart = session.scalar(
        select(Cart)
        .where(Cart.id == cart_id)
        .options(
            selectinload(Cart.items).selectinload(CartItem.product).selectinload(Product.images)
        )
        .execution_options(populate_existing=True)
    )
    if cart is None:
        raise NotFoundError("Cart not found", code=CART_NOT_FOUND)
    return cart


def line_cap(product: Product) -> int:
    """Most units of one product a single cart line may hold."""
    return min(MAX_LINE_QUANTITY, product.stock)


def _stock_error(product: Product, requested: int) -> ConflictError:
    cap = line_cap(product)
    message = (
        f"{product.name} is out of stock"
        if cap == 0
        else f"Only {cap} of {product.name} can be added (requested {requested})"
    )
    return ConflictError(message, code=INSUFFICIENT_STOCK)


def _check_option(name: str, value: str | None, allowed: list[str]) -> str:
    """Returns the stored value ("" when the product has no such option)."""
    if allowed:
        if not value:
            raise UnprocessableError(
                f"Choose a {name}",
                details=[
                    ErrorDetail(field=name, message=f"Required; one of: {', '.join(allowed)}")
                ],
            )
        if value not in allowed:
            raise UnprocessableError(
                f"Unknown {name} '{value}'",
                details=[ErrorDetail(field=name, message=f"Must be one of: {', '.join(allowed)}")],
            )
        return value
    if value:
        raise UnprocessableError(
            f"This product has no {name} options",
            details=[ErrorDetail(field=name, message="Must be empty for this product")],
        )
    return ""


def add_item(
    session: Session,
    cart_id: uuid.UUID,
    *,
    product_id: int,
    quantity: int,
    size: str | None,
    color: str | None,
) -> Cart:
    cart = get_cart(session, cart_id)
    product = session.get(Product, product_id)
    if product is None:
        raise NotFoundError(f"Product {product_id} not found", code=PRODUCT_NOT_FOUND)
    size_value = _check_option("size", size, product.sizes)
    color_value = _check_option("color", color, [c["name"] for c in product.colors])

    # Same product + size + colour merges into one line (FR-CART-02).
    line = next(
        (
            item
            for item in cart.items
            if item.product_id == product.id
            and item.size == size_value
            and item.color == color_value
        ),
        None,
    )
    new_quantity = quantity + (line.quantity if line else 0)
    if new_quantity > line_cap(product):
        raise _stock_error(product, new_quantity)

    if line:
        line.quantity = new_quantity
    else:
        cart.items.append(
            CartItem(product_id=product.id, quantity=quantity, size=size_value, color=color_value)
        )
    session.commit()
    return get_cart(session, cart_id)


def _find_line(cart: Cart, item_id: int) -> CartItem:
    line = next((item for item in cart.items if item.id == item_id), None)
    if line is None:
        raise NotFoundError(f"Cart item {item_id} not found", code=CART_ITEM_NOT_FOUND)
    return line


def update_item(session: Session, cart_id: uuid.UUID, item_id: int, *, quantity: int) -> Cart:
    cart = get_cart(session, cart_id)
    line = _find_line(cart, item_id)
    if quantity > line_cap(line.product):
        raise _stock_error(line.product, quantity)
    line.quantity = quantity
    session.commit()
    return get_cart(session, cart_id)


def remove_item(session: Session, cart_id: uuid.UUID, item_id: int) -> Cart:
    cart = get_cart(session, cart_id)
    cart.items.remove(_find_line(cart, item_id))
    session.commit()
    return get_cart(session, cart_id)


def clear_cart(session: Session, cart_id: uuid.UUID) -> Cart:
    cart = get_cart(session, cart_id)
    cart.items.clear()
    session.commit()
    return get_cart(session, cart_id)


def to_read(cart: Cart) -> CartRead:
    items = [
        CartItemRead(
            id=item.id,
            product=ProductSummary.model_validate(item.product),
            quantity=item.quantity,
            size=item.size or None,
            color=item.color or None,
            unit_price_minor=item.product.price_minor,
            line_total_minor=item.product.price_minor * item.quantity,
        )
        for item in cart.items
    ]
    subtotal = sum(item.line_total_minor for item in items)
    return CartRead(
        id=cart.id,
        items=items,
        item_count=sum(item.quantity for item in items),
        subtotal_minor=subtotal,
        # Free shipping and no tax (PLAN.md §2.2), so the total is the subtotal.
        total_minor=subtotal,
    )
