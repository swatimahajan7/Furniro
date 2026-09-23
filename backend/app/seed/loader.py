"""Deterministic seed loader: validates app/seed/data/*.json and inserts it with fixed IDs."""

import json
import logging
from datetime import UTC, datetime
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, TypeAdapter
from sqlalchemy import Integer, func, select, text
from sqlalchemy.orm import Session

from app.db.base import Base
from app.models import (
    BlogCategory,
    BlogPost,
    Category,
    Inspiration,
    Order,
    OrderItem,
    Product,
    ProductImage,
    ProductSpec,
    Review,
    Room,
    Tag,
    User,
    WishlistItem,
)
from app.models.order import order_number_for
from app.schemas.order import BillingIn, PaymentMethod

# Bump whenever anything under app/seed/data changes (backend/GUIDELINES.md §8).
SEED_VERSION = "2026.09.23-3"

DATA_DIR = Path(__file__).parent / "data"
BASE_TIMESTAMP = datetime(2026, 1, 1, tzinfo=UTC)

logger = logging.getLogger(__name__)


class _Strict(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)


class SeedCategory(_Strict):
    id: int
    slug: str
    name: str
    position: int


class SeedRoom(SeedCategory):
    image_url: str


class SeedTaxonomy(_Strict):
    categories: list[SeedCategory]
    rooms: list[SeedRoom]


class SeedImage(_Strict):
    url: str
    alt: str
    kind: Literal["gallery", "description"]


class SeedColor(_Strict):
    name: str
    hex: str = Field(pattern=r"^#[0-9A-Fa-f]{6}$")


class SeedSpec(_Strict):
    group: Literal["General", "Product", "Dimensions", "Warranty"]
    label: str
    value: str


class SeedProduct(_Strict):
    id: int
    slug: str
    sku: str
    name: str
    subtitle: str
    short_description: str
    description: list[str]
    price_minor: int = Field(ge=0)
    compare_at_price_minor: int | None
    is_new: bool
    is_featured: bool
    position: int
    stock: int = Field(ge=0)
    sizes: list[str]
    colors: list[SeedColor]
    category: str
    room: str | None
    tags: list[str]
    images: list[SeedImage] = Field(min_length=1)
    specs: list[SeedSpec]
    created_at: datetime


class SeedReview(_Strict):
    id: int
    product: str
    author_name: str
    rating: int = Field(ge=1, le=5)
    comment: str
    created_at: datetime


class SeedInspiration(_Strict):
    id: int
    index_label: str
    room: str
    title: str
    image_url: str
    link: str
    position: int


class SeedUser(_Strict):
    id: int
    email: str
    password_hash: str  # precomputed bcrypt hash, so the seed stays byte-for-byte deterministic
    first_name: str
    last_name: str
    created_at: datetime


class SeedOrderItem(_Strict):
    product: str
    size: str | None
    color: str | None
    quantity: int = Field(ge=1, le=10)


class SeedOrder(_Strict):
    id: int
    user_id: int
    payment_method: PaymentMethod
    billing: BillingIn
    items: list[SeedOrderItem] = Field(min_length=1)
    created_at: datetime


class SeedWishlistItem(_Strict):
    user_id: int
    product: str
    created_at: datetime


class SeedAccounts(_Strict):
    users: list[SeedUser]
    orders: list[SeedOrder]
    wishlist: list[SeedWishlistItem]


class SeedBlogPost(_Strict):
    id: int
    slug: str
    title: str
    excerpt: str = Field(max_length=500)
    content: str
    cover_url: str
    author: str
    category: str
    published_at: datetime


class SeedBlog(_Strict):
    categories: list[SeedCategory]
    posts: list[SeedBlogPost]


def _load[T](name: str, schema: type[T]) -> T:
    raw = json.loads((DATA_DIR / name).read_text(encoding="utf-8"))
    return TypeAdapter(schema).validate_python(raw)


def is_seeded(session: Session) -> bool:
    return (session.scalar(select(func.count()).select_from(Product)) or 0) > 0


def clear_all(session: Session) -> None:
    """Delete every row from every table, children first."""
    for table in reversed(Base.metadata.sorted_tables):
        session.execute(table.delete())


def load_baseline(session: Session) -> None:
    taxonomy = _load("taxonomy.json", SeedTaxonomy)
    products = _load("products.json", list[SeedProduct])
    reviews = _load("reviews.json", list[SeedReview])
    inspirations = _load("inspirations.json", list[SeedInspiration])

    def stamped(created: datetime = BASE_TIMESTAMP) -> dict[str, datetime]:
        return {"created_at": created, "updated_at": created}

    categories = {
        c.slug: Category(id=c.id, slug=c.slug, name=c.name, position=c.position, **stamped())
        for c in taxonomy.categories
    }
    rooms = {
        r.slug: Room(
            id=r.id,
            slug=r.slug,
            name=r.name,
            image_url=r.image_url,
            position=r.position,
            **stamped(),
        )
        for r in taxonomy.rooms
    }
    tag_names = sorted({tag for p in products for tag in p.tags})
    tags = {name: Tag(id=i, name=name, **stamped()) for i, name in enumerate(tag_names, 1)}
    session.add_all([*categories.values(), *rooms.values(), *tags.values()])

    ratings: dict[str, list[int]] = {}
    for review in reviews:
        ratings.setdefault(review.product, []).append(review.rating)

    by_slug: dict[str, Product] = {}
    for p in products:
        product_ratings = ratings.get(p.slug, [])
        product = Product(
            id=p.id,
            slug=p.slug,
            sku=p.sku,
            name=p.name,
            subtitle=p.subtitle,
            short_description=p.short_description,
            description=list(p.description),
            price_minor=p.price_minor,
            compare_at_price_minor=p.compare_at_price_minor,
            is_new=p.is_new,
            is_featured=p.is_featured,
            position=p.position,
            stock=p.stock,
            sizes=list(p.sizes),
            colors=[c.model_dump() for c in p.colors],
            category=categories[p.category],
            room=rooms[p.room] if p.room else None,
            tags=[tags[name] for name in p.tags],
            rating_avg=round(sum(product_ratings) / len(product_ratings), 1)
            if product_ratings
            else 0.0,
            review_count=len(product_ratings),
            images=[
                ProductImage(url=i.url, alt=i.alt, kind=i.kind, position=n, **stamped(p.created_at))
                for n, i in enumerate(p.images, 1)
            ],
            specs=[
                ProductSpec(
                    group=s.group,
                    label=s.label,
                    value=s.value,
                    position=n,
                    **stamped(p.created_at),
                )
                for n, s in enumerate(p.specs, 1)
            ],
            **stamped(p.created_at),
        )
        by_slug[p.slug] = product
        session.add(product)

    session.add_all(
        Review(
            id=r.id,
            product=by_slug[r.product],
            author_name=r.author_name,
            rating=r.rating,
            comment=r.comment,
            **stamped(r.created_at),
        )
        for r in reviews
    )
    session.add_all(Inspiration(**i.model_dump(), **stamped()) for i in inspirations)
    _load_accounts(session, by_slug)
    _load_blog(session)
    session.flush()
    _sync_sequences(session)


def _load_accounts(session: Session, products: dict[str, Product]) -> None:
    """Demo users with past orders and a wishlist. Past orders do not touch product stock."""
    accounts = _load("users.json", SeedAccounts)
    # Orders and wishlist rows point at users/products by plain FK (no relationship), so the
    # unit of work cannot order the INSERTs for us; flush the parents first.
    session.flush()
    session.add_all(
        User(
            **u.model_dump(exclude={"created_at"}), created_at=u.created_at, updated_at=u.created_at
        )
        for u in accounts.users
    )
    session.flush()
    for o in accounts.orders:
        items = [
            OrderItem(
                product_id=products[i.product].id,
                product_slug=i.product,
                product_name=products[i.product].name,
                image_url=products[i.product].images[0].url,
                size=i.size or "",
                color=i.color or "",
                quantity=i.quantity,
                unit_price_minor=products[i.product].price_minor,
                line_total_minor=products[i.product].price_minor * i.quantity,
                created_at=o.created_at,
                updated_at=o.created_at,
            )
            for i in o.items
        ]
        subtotal = sum(i.line_total_minor for i in items)
        session.add(
            Order(
                id=o.id,
                order_number=order_number_for(o.id),
                user_id=o.user_id,
                email=o.billing.email.lower(),
                payment_method=o.payment_method.value,
                billing=o.billing.model_dump(mode="json"),
                subtotal_minor=subtotal,
                total_minor=subtotal,
                items=items,
                created_at=o.created_at,
                updated_at=o.created_at,
            )
        )
    session.add_all(
        WishlistItem(user_id=w.user_id, product_id=products[w.product].id, created_at=w.created_at)
        for w in accounts.wishlist
    )


def _load_blog(session: Session) -> None:
    blog = _load("blog.json", SeedBlog)
    categories = {
        c.slug: BlogCategory(**c.model_dump(), created_at=BASE_TIMESTAMP, updated_at=BASE_TIMESTAMP)
        for c in blog.categories
    }
    session.add_all(categories.values())
    session.add_all(
        BlogPost(
            **p.model_dump(exclude={"category"}),
            category=categories[p.category],
            created_at=p.published_at,
            updated_at=p.published_at,
        )
        for p in blog.posts
    )


def _sync_sequences(session: Session) -> None:
    """PostgreSQL only: move id sequences past the explicit seed IDs so inserts don't clash."""
    if session.get_bind().dialect.name != "postgresql":
        return
    for table in Base.metadata.sorted_tables:
        # Only integer keys have sequences (carts use UUIDs; wishlist_items has a composite key).
        if "id" not in table.columns or not isinstance(table.columns["id"].type, Integer):
            continue
        session.execute(
            text(
                f"SELECT setval(pg_get_serial_sequence('{table.name}', 'id'), "  # noqa: S608
                f"COALESCE((SELECT MAX(id) FROM {table.name}), 0) + 1, false)"
            )
        )


def run_seed(session: Session, *, reset: bool) -> bool:
    """Load the baseline. Returns True if data was written, False if it was already there."""
    if reset:
        clear_all(session)
    elif is_seeded(session):
        logger.info("seed skipped: database already has data (seed %s)", SEED_VERSION)
        return False
    load_baseline(session)
    session.commit()
    logger.info("seed loaded: baseline %s", SEED_VERSION)
    return True
