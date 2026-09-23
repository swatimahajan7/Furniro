from datetime import datetime
from enum import StrEnum

from pydantic import EmailStr, Field

from app.schemas.base import Schema


class PaymentMethod(StrEnum):
    bank_transfer = "bank_transfer"
    cod = "cod"


class OrderStatus(StrEnum):
    pending = "pending"


class BillingIn(Schema):
    """Checkout billing details (FR-CHK-01). Country/province must exist in /meta/locations."""

    first_name: str = Field(min_length=1, max_length=50)
    last_name: str = Field(min_length=1, max_length=50)
    company: str | None = Field(default=None, max_length=100)
    country: str = Field(min_length=2, max_length=2, examples=["LK"])
    street: str = Field(min_length=1, max_length=200)
    city: str = Field(min_length=1, max_length=80)
    province: str = Field(min_length=1, max_length=10, examples=["WP"])
    zip: str = Field(pattern=r"^[A-Za-z0-9][A-Za-z0-9 -]{1,8}[A-Za-z0-9]$", examples=["10100"])
    phone: str = Field(pattern=r"^\+?[0-9][0-9 ()-]{5,18}[0-9]$", examples=["+94 77 123 4567"])
    email: EmailStr
    notes: str | None = Field(default=None, max_length=500)


class BillingRead(Schema):
    first_name: str
    last_name: str
    company: str | None
    country: str
    street: str
    city: str
    province: str
    zip: str
    phone: str
    email: str
    notes: str | None


class OrderCreate(Schema):
    billing: BillingIn
    payment_method: PaymentMethod


class OrderItemRead(Schema):
    product_slug: str
    product_name: str
    image_url: str | None
    size: str | None
    color: str | None
    quantity: int
    unit_price_minor: int
    line_total_minor: int


class OrderRead(Schema):
    order_number: str
    status: OrderStatus
    payment_method: PaymentMethod
    billing: BillingRead
    items: list[OrderItemRead]
    subtotal_minor: int
    total_minor: int
    created_at: datetime
