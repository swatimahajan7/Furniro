from typing import TYPE_CHECKING

from sqlalchemy import JSON, CheckConstraint, Column, ForeignKey, Index, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.review import Review

product_tags = Table(
    "product_tags",
    Base.metadata,
    Column("product_id", ForeignKey("products.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Category(TimestampMixin, Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(60), unique=True)
    name: Mapped[str] = mapped_column(String(80))
    position: Mapped[int]

    products: Mapped[list["Product"]] = relationship(back_populates="category")


class Room(TimestampMixin, Base):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(60), unique=True)
    name: Mapped[str] = mapped_column(String(80))
    image_url: Mapped[str] = mapped_column(String(255))
    position: Mapped[int]


class Tag(TimestampMixin, Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(60), unique=True)


class Product(TimestampMixin, Base):
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint("price_minor >= 0", name="price_non_negative"),
        CheckConstraint(
            "compare_at_price_minor IS NULL OR compare_at_price_minor > price_minor",
            name="compare_above_price",
        ),
        CheckConstraint("stock >= 0", name="stock_non_negative"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True)
    sku: Mapped[str] = mapped_column(String(40), unique=True)
    name: Mapped[str] = mapped_column(String(120))
    subtitle: Mapped[str] = mapped_column(String(160))
    short_description: Mapped[str] = mapped_column(Text)
    description: Mapped[list[str]] = mapped_column(JSON)
    price_minor: Mapped[int]
    compare_at_price_minor: Mapped[int | None]
    is_new: Mapped[bool] = mapped_column(default=False)
    is_featured: Mapped[bool] = mapped_column(default=False)
    position: Mapped[int]
    stock: Mapped[int]
    sizes: Mapped[list[str]] = mapped_column(JSON, default=list)
    colors: Mapped[list[dict[str, str]]] = mapped_column(JSON, default=list)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), index=True)
    room_id: Mapped[int | None] = mapped_column(ForeignKey("rooms.id"), index=True)
    # Denormalised from reviews so list queries stay cheap (backend/GUIDELINES.md §6).
    rating_avg: Mapped[float] = mapped_column(default=0.0)
    review_count: Mapped[int] = mapped_column(default=0)

    category: Mapped[Category] = relationship(back_populates="products")
    room: Mapped[Room | None] = relationship()
    tags: Mapped[list[Tag]] = relationship(secondary=product_tags, order_by=Tag.name)
    images: Mapped[list["ProductImage"]] = relationship(
        order_by="ProductImage.position", cascade="all, delete-orphan"
    )
    specs: Mapped[list["ProductSpec"]] = relationship(
        order_by="ProductSpec.position", cascade="all, delete-orphan"
    )
    reviews: Mapped[list["Review"]] = relationship(
        back_populates="product", cascade="all, delete-orphan"
    )

    @property
    def discount_percent(self) -> int | None:
        """Whole-number discount, rounded half up. None when the product is not on sale."""
        if self.compare_at_price_minor is None:
            return None
        saved = self.compare_at_price_minor - self.price_minor
        return (saved * 200 + self.compare_at_price_minor) // (2 * self.compare_at_price_minor)

    @property
    def in_stock(self) -> bool:
        return self.stock > 0

    @property
    def image_url(self) -> str | None:
        gallery = [image for image in self.images if image.kind == "gallery"]
        return gallery[0].url if gallery else None


class ProductImage(TimestampMixin, Base):
    __tablename__ = "product_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), index=True
    )
    url: Mapped[str] = mapped_column(String(255))
    alt: Mapped[str] = mapped_column(String(200))
    kind: Mapped[str] = mapped_column(String(20))  # "gallery" | "description"
    position: Mapped[int]


class ProductSpec(TimestampMixin, Base):
    __tablename__ = "product_specs"
    __table_args__ = (Index("ix_product_specs_product_id_group", "product_id", "group"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    group: Mapped[str] = mapped_column(String(40))
    label: Mapped[str] = mapped_column(String(80))
    value: Mapped[str] = mapped_column(String(400))
    position: Mapped[int]
