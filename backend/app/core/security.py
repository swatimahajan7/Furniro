"""Password hashing (bcrypt) and access tokens (JWT, HS256). See docs/API_CONTRACT.md §2.2."""

from datetime import UTC, datetime, timedelta

import bcrypt
import jwt

from app.core.config import get_settings
from app.core.errors import TOKEN_EXPIRED, UNAUTHENTICATED, UnauthorizedError

BCRYPT_ROUNDS = 12
JWT_ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=BCRYPT_ROUNDS)).decode()


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), password_hash.encode())
    except ValueError:  # malformed stored hash
        return False


def create_access_token(user_id: int) -> str:
    settings = get_settings()
    now = datetime.now(UTC)
    claims = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + timedelta(minutes=settings.jwt_expires_minutes),
    }
    return jwt.encode(claims, settings.jwt_secret, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> int:
    """Returns the user id, or raises 401 TOKEN_EXPIRED / UNAUTHENTICATED."""
    try:
        claims = jwt.decode(
            token,
            get_settings().jwt_secret,
            algorithms=[JWT_ALGORITHM],
            options={"require": ["sub", "exp"]},
        )
        return int(claims["sub"])
    except jwt.ExpiredSignatureError:
        raise UnauthorizedError(
            "Your session has expired; log in again", code=TOKEN_EXPIRED
        ) from None
    except (jwt.InvalidTokenError, ValueError):
        raise UnauthorizedError("Invalid access token", code=UNAUTHENTICATED) from None
