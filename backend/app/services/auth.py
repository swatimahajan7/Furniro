"""Registration, login and resolving the current user from a bearer token."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import (
    EMAIL_ALREADY_REGISTERED,
    INVALID_CREDENTIALS,
    UNAUTHENTICATED,
    ConflictError,
    UnauthorizedError,
)
from app.core.security import decode_access_token, hash_password, verify_password
from app.models import User

# Verifying against a real hash keeps login timing the same whether or not the email exists.
_DUMMY_HASH = hash_password("timing-equaliser-not-a-password-1")


def register(
    session: Session, *, email: str, password: str, first_name: str, last_name: str
) -> User:
    email = email.strip().lower()
    if session.scalar(select(User.id).where(User.email == email)) is not None:
        raise ConflictError(
            "An account with this email already exists", code=EMAIL_ALREADY_REGISTERED
        )
    user = User(
        email=email,
        password_hash=hash_password(password),
        first_name=first_name,
        last_name=last_name,
    )
    session.add(user)
    session.commit()
    return user


def login(session: Session, *, email: str, password: str) -> User:
    """Same error for an unknown email and a wrong password, so accounts can't be discovered."""
    user = session.scalar(select(User).where(User.email == email.strip().lower()))
    if not verify_password(password, user.password_hash if user else _DUMMY_HASH) or user is None:
        raise UnauthorizedError("Incorrect email or password", code=INVALID_CREDENTIALS)
    return user


def user_from_token(session: Session, token: str) -> User:
    user = session.get(User, decode_access_token(token))
    if user is None:  # deleted after the token was issued
        raise UnauthorizedError("Invalid access token", code=UNAUTHENTICATED)
    return user
