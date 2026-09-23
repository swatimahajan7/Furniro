"""Deterministic seed loader: validates app/seed/data/*.json and inserts it with fixed IDs."""

import json
import logging
from datetime import UTC, datetime
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, TypeAdapter
from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from app.db.base import Base
from app.models import (
    Category,
    Inspiration,
    Product,
    ProductImage,
    ProductSpec,
    Review,
    Room,
    Tag,
)

# Bump whenever anything under app/seed/data changes (backend/GUIDELINES.md §8).
SEED_VERSION = "2026.09.23-1"

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
    session.flush()
    _sync_sequences(session)


def _sync_sequences(session: Session) -> None:
    """PostgreSQL only: move id sequences past the explicit seed IDs so inserts don't clash."""
    if session.get_bind().dialect.name != "postgresql":
        return
    for table in Base.metadata.sorted_tables:
        if "id" not in table.columns:
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
