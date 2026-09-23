from typing import Any

from sqlalchemy import JSON, CheckConstraint, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


def order_number_for(order_id: int) -> str:
    """FUR-000123: derived from the primary key, so it is unique and never reused."""
    return f"FUR-{order_id:06d}"


class Order(TimestampMixin, Base):
    """A placed order. `user_id` is set when a logged-in customer checks out."""

    __tablename__ = "orders"
    __table_args__ = (
        CheckConstraint("subtotal_minor >= 0", name="subtotal_non_negative"),
        CheckConstraint("total_minor >= 0", name="total_non_negative"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    # Nullable only between INSERT and the flush that assigns it from the id.
    order_number: Mapped[str | None] = mapped_column(String(20), unique=True)
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), index=True
    )
    email: Mapped[str] = mapped_column(String(254), index=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    payment_method: Mapped[str] = mapped_column(String(20))
    # Any: the billing snapshot is a free-form JSON object validated by BillingIn on the way in.
    billing: Mapped[dict[str, Any]] = mapped_column(JSON)
    subtotal_minor: Mapped[int]
    total_minor: Mapped[int]

    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan", order_by="OrderItem.id"
    )


class OrderItem(TimestampMixin, Base):
    """A snapshot of a cart line at purchase time. Never joined to products for prices."""

    __tablename__ = "order_items"
    __table_args__ = (CheckConstraint("quantity >= 1", name="quantity_positive"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id", ondelete="SET NULL"))
    product_slug: Mapped[str] = mapped_column(String(120))
    product_name: Mapped[str] = mapped_column(String(120))
    image_url: Mapped[str | None] = mapped_column(String(255))
    size: Mapped[str] = mapped_column(String(20), default="")
    color: Mapped[str] = mapped_column(String(40), default="")
    quantity: Mapped[int]
    unit_price_minor: Mapped[int]
    line_total_minor: Mapped[int]

    order: Mapped[Order] = relationship(back_populates="items")
