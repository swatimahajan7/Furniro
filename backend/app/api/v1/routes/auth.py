from typing import Any

from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DbSession
from app.core.errors import ErrorResponse
from app.core.security import create_access_token
from app.schemas.auth import LoginIn, RegisterIn, TokenRead, UserRead
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])

# Any: FastAPI types OpenAPI response metadata as dict[int | str, dict[str, Any]].
UNAUTHORIZED: dict[int | str, dict[str, Any]] = {
    status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse, "description": "Not logged in"},
}


def _token_for(user_id: int, user: UserRead) -> TokenRead:
    return TokenRead(access_token=create_access_token(user_id), user=user)


@router.post(
    "/register",
    response_model=TokenRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create an account and log in",
    responses={
        status.HTTP_409_CONFLICT: {
            "model": ErrorResponse,
            "description": "EMAIL_ALREADY_REGISTERED",
        }
    },
)
def register(db: DbSession, body: RegisterIn) -> TokenRead:
    user = auth_service.register(
        db,
        email=body.email,
        password=body.password,
        first_name=body.first_name,
        last_name=body.last_name,
    )
    return _token_for(user.id, UserRead.model_validate(user))


@router.post(
    "/login",
    response_model=TokenRead,
    summary="Log in with email and password",
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse, "description": "INVALID_CREDENTIALS"}
    },
)
def login(db: DbSession, body: LoginIn) -> TokenRead:
    user = auth_service.login(db, email=body.email, password=body.password)
    return _token_for(user.id, UserRead.model_validate(user))


@router.get("/me", response_model=UserRead, summary="The logged-in user", responses=UNAUTHORIZED)
def me(user: CurrentUser) -> UserRead:
    return UserRead.model_validate(user)
