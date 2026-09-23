"""Every ORM model, imported here so Alembic autogenerate and the seed loader see them all."""

from app.models.catalog import Category, Product, ProductImage, ProductSpec, Room, Tag, product_tags
from app.models.engagement import Inspiration
from app.models.review import Review

__all__ = [
    "Category",
    "Inspiration",
    "Product",
    "ProductImage",
    "ProductSpec",
    "Review",
    "Room",
    "Tag",
    "product_tags",
]
