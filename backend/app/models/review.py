from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.catalog import Product


class Review(TimestampMixin, Base):
    """A product review. `user_id` and the one-review-per-user rule arrive with auth (Phase 5)."""

    __tablename__ = "reviews"
    __table_args__ = (CheckConstraint("rating BETWEEN 1 AND 5", name="rating_range"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), index=True
    )
    author_name: Mapped[str] = mapped_column(String(80))
    rating: Mapped[int]
    comment: Mapped[str] = mapped_column(Text)

    product: Mapped["Product"] = relationship(back_populates="reviews")
