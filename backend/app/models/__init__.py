"""Every ORM model, imported here so Alembic autogenerate and the seed loader see them all."""

from app.models.blog import BlogCategory, BlogPost
from app.models.cart import Cart, CartItem
from app.models.catalog import Category, Product, ProductImage, ProductSpec, Room, Tag, product_tags
from app.models.engagement import ContactMessage, Inspiration, NewsletterSubscriber
from app.models.order import Order, OrderItem
from app.models.review import Review
from app.models.user import User
from app.models.wishlist import WishlistItem

__all__ = [
    "BlogCategory",
    "BlogPost",
    "Cart",
    "CartItem",
    "Category",
    "ContactMessage",
    "Inspiration",
    "NewsletterSubscriber",
    "Order",
    "OrderItem",
    "Product",
    "ProductImage",
    "ProductSpec",
    "Review",
    "Room",
    "Tag",
    "User",
    "WishlistItem",
    "product_tags",
]
