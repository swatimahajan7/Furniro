"""Domain errors and the handlers that turn every failure into the standard error envelope.

See docs/API_CONTRACT.md §1.3. Clients should branch on `code`, never on `message`.
"""

import logging
from collections.abc import Mapping
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging import REQUEST_ID_HEADER, get_request_id

logger = logging.getLogger(__name__)

# Error codes: UPPER_SNAKE, part of the public contract.
BAD_REQUEST = "BAD_REQUEST"
UNAUTHENTICATED = "UNAUTHENTICATED"
FORBIDDEN = "FORBIDDEN"
NOT_FOUND = "NOT_FOUND"
METHOD_NOT_ALLOWED = "METHOD_NOT_ALLOWED"
CONFLICT = "CONFLICT"
VALIDATION_ERROR = "VALIDATION_ERROR"
INTERNAL_ERROR = "INTERNAL_ERROR"
PRODUCT_NOT_FOUND = "PRODUCT_NOT_FOUND"
COMPARE_LIMIT_EXCEEDED = "COMPARE_LIMIT_EXCEEDED"
INVALID_PRICE_RANGE = "INVALID_PRICE_RANGE"
CART_NOT_FOUND = "CART_NOT_FOUND"
CART_ITEM_NOT_FOUND = "CART_ITEM_NOT_FOUND"
CART_EMPTY = "CART_EMPTY"
INSUFFICIENT_STOCK = "INSUFFICIENT_STOCK"
ORDER_NOT_FOUND = "ORDER_NOT_FOUND"
TOKEN_EXPIRED = "TOKEN_EXPIRED"  # noqa: S105 - an error code, not a secret
INVALID_CREDENTIALS = "INVALID_CREDENTIALS"
EMAIL_ALREADY_REGISTERED = "EMAIL_ALREADY_REGISTERED"
ALREADY_REVIEWED = "ALREADY_REVIEWED"
BLOG_POST_NOT_FOUND = "BLOG_POST_NOT_FOUND"
ALREADY_SUBSCRIBED = "ALREADY_SUBSCRIBED"

_STATUS_CODES = {
    status.HTTP_400_BAD_REQUEST: BAD_REQUEST,
    status.HTTP_401_UNAUTHORIZED: UNAUTHENTICATED,
    status.HTTP_403_FORBIDDEN: FORBIDDEN,
    status.HTTP_404_NOT_FOUND: NOT_FOUND,
    status.HTTP_405_METHOD_NOT_ALLOWED: METHOD_NOT_ALLOWED,
    status.HTTP_409_CONFLICT: CONFLICT,
}


class ErrorDetail(BaseModel):
    field: str | None = None
    message: str


class ErrorBody(BaseModel):
    code: str
    message: str
    details: list[ErrorDetail] | None = None
    request_id: str | None = None


class ErrorResponse(BaseModel):
    error: ErrorBody


class AppError(Exception):
    status_code: int = status.HTTP_400_BAD_REQUEST
    code: str = BAD_REQUEST

    def __init__(
        self,
        message: str,
        *,
        code: str | None = None,
        details: list[ErrorDetail] | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.details = details
        if code is not None:
            self.code = code


class BadRequestError(AppError):
    pass


class UnauthorizedError(AppError):
    status_code = status.HTTP_401_UNAUTHORIZED
    code = UNAUTHENTICATED


class ForbiddenError(AppError):
    status_code = status.HTTP_403_FORBIDDEN
    code = FORBIDDEN


class NotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND
    code = NOT_FOUND


class ConflictError(AppError):
    status_code = status.HTTP_409_CONFLICT
    code = CONFLICT


class UnprocessableError(AppError):
    """Business-rule validation that Pydantic cannot express (e.g. a size the product lacks)."""

    status_code = status.HTTP_422_UNPROCESSABLE_CONTENT
    code = VALIDATION_ERROR


def error_response(
    status_code: int,
    code: str,
    message: str,
    details: list[ErrorDetail] | None = None,
    headers: Mapping[str, str] | None = None,
) -> JSONResponse:
    request_id = get_request_id()
    body = ErrorResponse(
        error=ErrorBody(code=code, message=message, details=details, request_id=request_id)
    )
    all_headers = dict(headers or {})
    if request_id:
        all_headers[REQUEST_ID_HEADER] = request_id
    return JSONResponse(
        status_code=status_code,
        content=body.model_dump(exclude_none=True),
        headers=all_headers,
    )


def _field_path(loc: tuple[Any, ...]) -> str:
    # Drop the location prefix ("body", "query", "path", "header") for readability.
    parts = [str(p) for p in loc[1:]] if len(loc) > 1 else [str(p) for p in loc]
    return ".".join(parts)


async def _handle_app_error(_: Request, exc: Exception) -> JSONResponse:
    if not isinstance(exc, AppError):  # pragma: no cover - registered for AppError only
        raise exc
    logger.warning("app_error code=%s message=%s", exc.code, exc.message)
    return error_response(exc.status_code, exc.code, exc.message, exc.details)


async def _handle_validation_error(_: Request, exc: Exception) -> JSONResponse:
    if not isinstance(
        exc, RequestValidationError
    ):  # pragma: no cover - registered for RequestValidationError only
        raise exc
    details = [
        ErrorDetail(field=_field_path(tuple(err.get("loc", ()))), message=str(err.get("msg", "")))
        for err in exc.errors()
    ]
    return error_response(
        status.HTTP_422_UNPROCESSABLE_CONTENT,
        VALIDATION_ERROR,
        "Request validation failed",
        details,
    )


async def _handle_http_error(_: Request, exc: Exception) -> JSONResponse:
    if not isinstance(
        exc, StarletteHTTPException
    ):  # pragma: no cover - registered for StarletteHTTPException only
        raise exc
    code = _STATUS_CODES.get(
        exc.status_code, BAD_REQUEST if exc.status_code < 500 else INTERNAL_ERROR
    )
    message = exc.detail if isinstance(exc.detail, str) else "Request failed"
    return error_response(exc.status_code, code, message, headers=exc.headers)


async def _handle_unexpected_error(_: Request, exc: Exception) -> JSONResponse:
    logger.exception("unhandled_error", exc_info=exc)
    return error_response(
        status.HTTP_500_INTERNAL_SERVER_ERROR, INTERNAL_ERROR, "An unexpected error occurred"
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppError, _handle_app_error)
    app.add_exception_handler(RequestValidationError, _handle_validation_error)
    app.add_exception_handler(StarletteHTTPException, _handle_http_error)
    app.add_exception_handler(Exception, _handle_unexpected_error)
