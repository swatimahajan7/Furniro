import uuid
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, String, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.catalog import Product

MAX_LINE_QUANTITY = 10


class Cart(TimestampMixin, Base):
    """A server-side cart. Guests address it with the `X-Cart-Id` header (UUID); a logged-in
    user has at most one cart, found through `user_id` (guest carts merge into it on login).
    """

    __tablename__ = "carts"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True
    )

    items: Mapped[list["CartItem"]] = relationship(
        back_populates="cart", cascade="all, delete-orphan", order_by="CartItem.id"
    )


class CartItem(TimestampMixin, Base):
    """One line in a cart. The same product + size + colour is always a single line.

    Size and colour are stored as "" (never NULL) when the product has no such option, so the
    unique constraint below also covers option-less products (NULLs never compare equal in SQL).
    """

    __tablename__ = "cart_items"
    __table_args__ = (
        UniqueConstraint("cart_id", "product_id", "size", "color", name="uq_cart_items_line"),
        CheckConstraint(f"quantity BETWEEN 1 AND {MAX_LINE_QUANTITY}", name="quantity_range"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    cart_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("carts.id", ondelete="CASCADE"), index=True
    )
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    quantity: Mapped[int]
    size: Mapped[str] = mapped_column(String(20), default="")
    color: Mapped[str] = mapped_column(String(40), default="")

    cart: Mapped[Cart] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship()
