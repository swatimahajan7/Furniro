"""Catalog reads: products, related, comparison, categories, rooms, inspirations, reviews."""

from collections.abc import Sequence
from dataclasses import dataclass, field
from typing import Any

from sqlalchemy import ColumnElement, Select, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.core.errors import (
    COMPARE_LIMIT_EXCEEDED,
    INVALID_PRICE_RANGE,
    PRODUCT_NOT_FOUND,
    BadRequestError,
    NotFoundError,
)
from app.core.pagination import offset_for
from app.models import Category, Inspiration, Product, Review, Room
from app.schemas.catalog import (
    CompareGroup,
    CompareResponse,
    CompareRow,
    ProductSort,
    ProductSummary,
)

COMPARE_LIMIT = 3
SPEC_GROUP_ORDER = ("General", "Product", "Dimensions", "Warranty")


@dataclass(frozen=True)
class ProductFilters:
    q: str | None = None
    categories: Sequence[str] = field(default_factory=tuple)
    rooms: Sequence[str] = field(default_factory=tuple)
    min_price: int | None = None
    max_price: int | None = None
    on_sale: bool | None = None
    is_new: bool | None = None
    featured: bool | None = None


def _filtered(filters: ProductFilters) -> Select[tuple[Product]]:
    if (
        filters.min_price is not None
        and filters.max_price is not None
        and filters.min_price > filters.max_price
    ):
        raise BadRequestError(
            "min_price must be less than or equal to max_price", code=INVALID_PRICE_RANGE
        )

    stmt = select(Product)
    if filters.q:
        stmt = stmt.where(
            or_(
                Product.name.icontains(filters.q, autoescape=True),
                Product.subtitle.icontains(filters.q, autoescape=True),
            )
        )
    if filters.categories:
        stmt = stmt.join(Product.category).where(Category.slug.in_(filters.categories))
    if filters.rooms:
        stmt = stmt.join(Product.room).where(Room.slug.in_(filters.rooms))
    if filters.min_price is not None:
        stmt = stmt.where(Product.price_minor >= filters.min_price)
    if filters.max_price is not None:
        stmt = stmt.where(Product.price_minor <= filters.max_price)
    if filters.on_sale is not None:
        on_sale = Product.compare_at_price_minor.is_not(None)
        stmt = stmt.where(on_sale if filters.on_sale else ~on_sale)
    if filters.is_new is not None:
        stmt = stmt.where(Product.is_new.is_(filters.is_new))
    if filters.featured is not None:
        stmt = stmt.where(Product.is_featured.is_(filters.featured))
    return stmt


# Any: the ORDER BY expressions mix int, datetime and str columns.
def _ordering(sort: ProductSort) -> tuple[ColumnElement[Any], ...]:
    # Every ordering ends with the id so pages never overlap or skip items.
    match sort:
        case ProductSort.price_asc:
            return (Product.price_minor.asc(), Product.id.asc())
        case ProductSort.price_desc:
            return (Product.price_minor.desc(), Product.id.asc())
        case ProductSort.newest:
            return (Product.created_at.desc(), Product.id.desc())
        case ProductSort.name_asc:
            return (func.lower(Product.name).asc(), Product.id.asc())
        case _:
            return (Product.position.asc(), Product.id.asc())


def _count(session: Session, stmt: Select[tuple[Product]]) -> int:
    return session.scalar(select(func.count()).select_from(stmt.order_by(None).subquery())) or 0


def list_products(
    session: Session,
    filters: ProductFilters,
    *,
    sort: ProductSort,
    page: int,
    page_size: int,
) -> tuple[list[Product], int]:
    stmt = _filtered(filters)
    total = _count(session, stmt)
    items = session.scalars(
        stmt.order_by(*_ordering(sort))
        .offset(offset_for(page, page_size))
        .limit(page_size)
        .options(selectinload(Product.images))
    ).all()
    return list(items), total


def get_product(session: Session, slug: str) -> Product:
    product = session.scalar(
        select(Product)
        .where(Product.slug == slug)
        .options(
            selectinload(Product.images),
            selectinload(Product.specs),
            selectinload(Product.tags),
            selectinload(Product.category),
            selectinload(Product.room),
        )
    )
    if product is None:
        raise NotFoundError(f"Product '{slug}' not found", code=PRODUCT_NOT_FOUND)
    return product


def list_related(
    session: Session, slug: str, *, limit: int, offset: int
) -> tuple[list[Product], bool]:
    product = get_product(session, slug)
    stmt = select(Product).where(
        Product.category_id == product.category_id, Product.id != product.id
    )
    total = _count(session, stmt)
    items = session.scalars(
        stmt.order_by(Product.position, Product.id)
        .offset(offset)
        .limit(limit)
        .options(selectinload(Product.images))
    ).all()
    return list(items), offset + len(items) < total


def compare_products(session: Session, ids: Sequence[int]) -> CompareResponse:
    unique_ids = list(dict.fromkeys(ids))  # keep request order, drop duplicates
    if len(unique_ids) > COMPARE_LIMIT:
        raise BadRequestError(
            f"You can compare at most {COMPARE_LIMIT} products", code=COMPARE_LIMIT_EXCEEDED
        )
    found = {
        p.id: p
        for p in session.scalars(
            select(Product)
            .where(Product.id.in_(unique_ids))
            .options(selectinload(Product.images), selectinload(Product.specs))
        )
    }
    missing = [str(i) for i in unique_ids if i not in found]
    if missing:
        raise NotFoundError(f"Product(s) not found: {', '.join(missing)}", code=PRODUCT_NOT_FOUND)
    products = [found[i] for i in unique_ids]

    # Rows keep the order in which labels first appear across the compared products.
    labels: dict[str, list[str]] = {group: [] for group in SPEC_GROUP_ORDER}
    values: dict[tuple[str, str], dict[int, str]] = {}
    for product in products:
        for spec in product.specs:
            group_labels = labels.setdefault(spec.group, [])
            if spec.label not in group_labels:
                group_labels.append(spec.label)
            values.setdefault((spec.group, spec.label), {})[product.id] = spec.value

    groups = [
        CompareGroup(
            name=group,
            rows=[
                CompareRow(
                    label=label,
                    values=[values[(group, label)].get(p.id) for p in products],
                )
                for label in group_labels
            ],
        )
        for group, group_labels in labels.items()
        if group_labels
    ]
    return CompareResponse(
        products=[ProductSummary.model_validate(p) for p in products], groups=groups
    )


def list_categories(session: Session) -> list[tuple[Category, int]]:
    rows = session.execute(
        select(Category, func.count(Product.id))
        .outerjoin(Product, Product.category_id == Category.id)
        .group_by(Category.id)
        .order_by(Category.position)
    ).all()
    return [(category, count) for category, count in rows]


def list_rooms(session: Session) -> list[Room]:
    return list(session.scalars(select(Room).order_by(Room.position)))


def list_inspirations(session: Session) -> list[Inspiration]:
    return list(session.scalars(select(Inspiration).order_by(Inspiration.position)))


def list_reviews(
    session: Session, slug: str, *, page: int, page_size: int
) -> tuple[list[Review], int]:
    product = get_product(session, slug)
    stmt = select(Review).where(Review.product_id == product.id)
    total = (
        session.scalar(
            select(func.count()).select_from(Review).where(Review.product_id == product.id)
        )
        or 0
    )
    items = session.scalars(
        stmt.order_by(Review.created_at.desc(), Review.id.desc())
        .offset(offset_for(page, page_size))
        .limit(page_size)
    ).all()
    return list(items), total
