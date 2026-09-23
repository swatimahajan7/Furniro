from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, UtcDateTime, utc_now

if TYPE_CHECKING:
    from app.models.catalog import Product


class WishlistItem(Base):
    """A product a user has liked. One row per (user, product)."""

    __tablename__ = "wishlist_items"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), primary_key=True
    )
    created_at: Mapped[datetime] = mapped_column(UtcDateTime, default=utc_now)

    product: Mapped["Product"] = relationship()
