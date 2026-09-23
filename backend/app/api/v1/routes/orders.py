from typing import Annotated, Any

from fastapi import APIRouter, Header, Path, Query, status
from pydantic import EmailStr

from app.api.deps import DbSession
from app.core.errors import ErrorResponse
from app.schemas.order import OrderCreate, OrderRead
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
    summary="Place an order from the cart (guest checkout)",
    responses=PLACE_ERRORS,
)
def place_order(
    db: DbSession,
    body: OrderCreate,
    x_cart_id: Annotated[str | None, Header(alias="X-Cart-Id")] = None,
) -> OrderRead:
    order = order_service.place_order(
        db,
        cart_service.parse_cart_id(x_cart_id),
        billing=body.billing,
        payment_method=body.payment_method,
    )
    return order_service.to_read(order)


@router.get(
    "/{order_number}",
    response_model=OrderRead,
    summary="Look up an order with the email used at checkout",
    responses={
        status.HTTP_404_NOT_FOUND: {"model": ErrorResponse, "description": "ORDER_NOT_FOUND"}
    },
)
def get_order(
    db: DbSession,
    order_number: Annotated[str, Path(max_length=20, examples=["FUR-000001"])],
    email: Annotated[EmailStr, Query(description="The billing email of the order")],
) -> OrderRead:
    return order_service.to_read(order_service.get_order(db, order_number, email=email))
