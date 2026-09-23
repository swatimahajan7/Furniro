from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.errors import UnauthorizedError
from app.db.session import get_db
from app.models import User
from app.services import auth as auth_service

DbSession = Annotated[Session, Depends(get_db)]
AppSettings = Annotated[Settings, Depends(get_settings)]

_bearer = HTTPBearer(auto_error=False, description="Access token from POST /auth/login")


def get_optional_user(
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> User | None:
    """No Authorization header → guest. A header with a bad or expired token is still a 401,
    so clients learn to drop it instead of silently acting as a guest."""
    if credentials is None:
        return None
    return auth_service.user_from_token(db, credentials.credentials)


OptionalUser = Annotated[User | None, Depends(get_optional_user)]


def get_current_user(user: OptionalUser) -> User:
    if user is None:
        raise UnauthorizedError("Log in to continue")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
