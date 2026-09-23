from typing import Annotated

from fastapi import APIRouter, Path, Response, status

from app.api.deps import CurrentUser, DbSession
from app.core.errors import ErrorResponse
from app.schemas.catalog import ProductSummary
from app.services import wishlist as wishlist_service

router = APIRouter(
    prefix="/wishlist",
    tags=["wishlist"],
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse, "description": "Not logged in"}
    },
)

ProductId = Annotated[int, Path(ge=1)]


@router.get("", response_model=list[ProductSummary], summary="My liked products, newest first")
def list_wishlist(db: DbSession, user: CurrentUser) -> list[ProductSummary]:
    return [ProductSummary.model_validate(p) for p in wishlist_service.list_products(db, user)]


@router.put(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Like a product (idempotent)",
    responses={
        status.HTTP_404_NOT_FOUND: {"model": ErrorResponse, "description": "PRODUCT_NOT_FOUND"}
    },
)
def add_to_wishlist(db: DbSession, user: CurrentUser, product_id: ProductId) -> Response:
    wishlist_service.add(db, user, product_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Unlike a product (idempotent)",
)
def remove_from_wishlist(db: DbSession, user: CurrentUser, product_id: ProductId) -> Response:
    wishlist_service.remove(db, user, product_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
