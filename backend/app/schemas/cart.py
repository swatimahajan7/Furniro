import uuid

from pydantic import Field

from app.models.cart import MAX_LINE_QUANTITY
from app.schemas.base import Schema
from app.schemas.catalog import ProductSummary


class CartItemAdd(Schema):
    product_id: int = Field(ge=1)
    quantity: int = Field(default=1, ge=1, le=MAX_LINE_QUANTITY)
    size: str | None = Field(
        default=None, max_length=20, description="Required if the product has sizes"
    )
    color: str | None = Field(
        default=None, max_length=40, description="Required if the product has colours"
    )


class CartItemUpdate(Schema):
    quantity: int = Field(ge=1, le=MAX_LINE_QUANTITY)


class CartItemRead(Schema):
    id: int
    product: ProductSummary
    quantity: int
    size: str | None
    color: str | None
    unit_price_minor: int = Field(description="Current product price, in cents")
    line_total_minor: int


class CartRead(Schema):
    id: uuid.UUID
    items: list[CartItemRead]
    item_count: int = Field(description="Total units across all lines (the header badge)")
    subtotal_minor: int
    total_minor: int = Field(description="Equals the subtotal: shipping is free, no tax")
