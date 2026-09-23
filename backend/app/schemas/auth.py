from datetime import datetime
from typing import Literal

from pydantic import EmailStr, Field, field_validator

from app.schemas.base import Schema


class UserRead(Schema):
    id: int
    email: str
    first_name: str
    last_name: str
    created_at: datetime


class RegisterIn(Schema):
    email: EmailStr
    password: str = Field(
        min_length=8,
        max_length=72,  # bcrypt ignores bytes beyond 72
        description="At least 8 characters with at least one letter and one digit",
    )
    first_name: str = Field(min_length=1, max_length=50)
    last_name: str = Field(min_length=1, max_length=50)

    @field_validator("password")
    @classmethod
    def _letter_and_digit(cls, value: str) -> str:
        if not any(c.isalpha() for c in value) or not any(c.isdigit() for c in value):
            raise ValueError("Password needs at least one letter and one digit")
        return value


class LoginIn(Schema):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class TokenRead(Schema):
    access_token: str
    token_type: Literal["bearer"] = "bearer"  # noqa: S105 - the OAuth token type, not a secret
    user: UserRead
