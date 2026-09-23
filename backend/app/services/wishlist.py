"""Liked products (FR-WISH-01). Adding and removing are idempotent."""

from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload

from app.core.errors import PRODUCT_NOT_FOUND, NotFoundError
from app.models import Product, User, WishlistItem


def list_products(session: Session, user: User) -> list[Product]:
    """Most recently liked first."""
    items = session.scalars(
        select(WishlistItem)
        .where(WishlistItem.user_id == user.id)
        .order_by(WishlistItem.created_at.desc(), WishlistItem.product_id.desc())
        .options(selectinload(WishlistItem.product).selectinload(Product.images))
    ).all()
    return [item.product for item in items]


def add(session: Session, user: User, product_id: int) -> None:
    if session.get(Product, product_id) is None:
        raise NotFoundError(f"Product {product_id} not found", code=PRODUCT_NOT_FOUND)
    if session.get(WishlistItem, (user.id, product_id)) is None:
        session.add(WishlistItem(user_id=user.id, product_id=product_id))
        session.commit()


def remove(session: Session, user: User, product_id: int) -> None:
    session.execute(
        delete(WishlistItem).where(
            WishlistItem.user_id == user.id, WishlistItem.product_id == product_id
        )
    )
    session.commit()
