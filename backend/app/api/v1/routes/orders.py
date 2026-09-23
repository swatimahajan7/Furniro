from typing import Annotated, Any

from fastapi import APIRouter, Header, Path, Query, status
from pydantic import EmailStr

from app.api.deps import CurrentUser, DbSession, OptionalUser
from app.core.errors import ErrorResponse
from app.core.pagination import Page
from app.schemas.order import OrderCreate, OrderRead, OrderSummary
from app.services import cart as cart_service
from app.services import orders as order_service

router = APIRouter(prefix="/orders", tags=["orders"])

# Any: FastAPI types OpenAPI response metadata as dict[int | str, dict[str, Any]].
PLACE_ERRORS: dict[int | str, dict[str, Any]] = {
    status.HTTP_400_BAD_REQUEST: {"model": ErrorResponse, "description": "CART_EMPTY"},
    status.HTTP_404_NOT_FOUND: {"model": ErrorResponse, "description": "CART_NOT_FOUND"},
    status.HTTP_409_CONFLICT: {"model": ErrorResponse, "description": "INSUFFICIENT_STOCK"},
}


@router.post(
    "",
    response_model=OrderRead,
    status_code=status.HTTP_201_CREATED,
    summary="Place an order from the cart (guest or logged in)",
    responses=PLACE_ERRORS,
)
def place_order(
    db: DbSession,
    user: OptionalUser,
    body: OrderCreate,
    x_cart_id: Annotated[str | None, Header(alias="X-Cart-Id")] = None,
) -> OrderRead:
    order = order_service.place_order(
        db,
        cart_service.resolve_cart_id(db, user, x_cart_id),
        billing=body.billing,
        payment_method=body.payment_method,
        user=user,
    )
    return order_service.to_read(order)


@router.get(
    "/{order_number}",
    response_model=OrderRead,
    summary="An order: yours when logged in, otherwise with the checkout email",
    responses={
        status.HTTP_404_NOT_FOUND: {"model": ErrorResponse, "description": "ORDER_NOT_FOUND"}
    },
)
def get_order(
    db: DbSession,
    user: OptionalUser,
    order_number: Annotated[str, Path(max_length=20, examples=["FUR-000001"])],
    email: Annotated[
        EmailStr | None,
        Query(description="The billing email; not needed for your own orders when logged in"),
    ] = None,
) -> OrderRead:
    return order_service.to_read(order_service.get_order(db, order_number, email=email, user=user))


@router.get(
    "",
    response_model=Page[OrderSummary],
    summary="My orders, newest first",
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse, "description": "Not logged in"}
    },
)
def list_orders(
    db: DbSession,
    user: CurrentUser,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=50)] = 10,
) -> Page[OrderSummary]:
    items, total = order_service.list_orders(db, user, page=page, page_size=page_size)
    return Page.build(items, page=page, page_size=page_size, total=total)
