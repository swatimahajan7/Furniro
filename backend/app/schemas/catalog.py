from datetime import datetime
from enum import StrEnum
from typing import Literal

from pydantic import Field, field_validator

from app.schemas.base import Schema


class ProductSort(StrEnum):
    default = "default"
    price_asc = "price_asc"
    price_desc = "price_desc"
    newest = "newest"
    name_asc = "name_asc"


class CategoryRef(Schema):
    slug: str
    name: str


class CategoryRead(CategoryRef):
    product_count: int


class RoomRef(Schema):
    slug: str
    name: str


class RoomRead(RoomRef):
    image_url: str


class ProductSummary(Schema):
    id: int
    slug: str
    name: str
    subtitle: str
    price_minor: int = Field(description="Price in US cents")
    compare_at_price_minor: int | None = Field(
        description="Original price in US cents when the product is on sale"
    )
    discount_percent: int | None = Field(description="Whole-number discount, rounded half up")
    is_new: bool
    image_url: str | None
    rating_avg: float
    review_count: int
    in_stock: bool
    sizes: list[str] = Field(description="Size options; the first is the default. Empty if none")
    colors: list["ColorRead"] = Field(description="Colour options; the first is the default")


class ProductImageRead(Schema):
    url: str
    alt: str
    kind: Literal["gallery", "description"]


class ColorRead(Schema):
    name: str
    hex: str


class SpecRead(Schema):
    group: str
    label: str
    value: str


class ProductDetail(ProductSummary):
    sku: str
    short_description: str
    description: list[str]
    images: list[ProductImageRead]
    stock: int
    category: CategoryRef
    room: RoomRef | None
    tags: list[str]
    specs: list[SpecRead]

    @field_validator("tags", mode="before")
    @classmethod
    def _tag_names(cls, value: object) -> object:
        # ORM products carry Tag objects; the API exposes just their names.
        if isinstance(value, list):
            return [getattr(tag, "name", tag) for tag in value]
        return value


class RelatedProducts(Schema):
    items: list[ProductSummary]
    has_more: bool


class CompareRow(Schema):
    label: str
    values: list[str | None] = Field(description="One value per product, in request order")


class CompareGroup(Schema):
    name: str
    rows: list[CompareRow]


class CompareResponse(Schema):
    products: list[ProductSummary]
    groups: list[CompareGroup]


class ReviewRead(Schema):
    id: int
    author_name: str
    rating: int
    comment: str
    created_at: datetime


class InspirationRead(Schema):
    id: int
    index: str = Field(validation_alias="index_label", examples=["01"])
    room: str
    title: str
    image_url: str
    link: str
