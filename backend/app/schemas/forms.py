from datetime import datetime

from pydantic import EmailStr, Field, field_validator

from app.schemas.base import Schema


class ContactCreate(Schema):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    subject: str | None = Field(default=None, max_length=120)
    message: str = Field(min_length=10, max_length=2000)

    @field_validator("subject")
    @classmethod
    def _blank_is_none(cls, value: str | None) -> str | None:
        return value or None


class ContactReceipt(Schema):
    id: int
    received_at: datetime


class NewsletterSubscribe(Schema):
    email: EmailStr


class NewsletterSubscription(Schema):
    email: str
    subscribed_at: datetime
