from typing import Annotated, Any

from fastapi import APIRouter, Header, Path, status

from app.api.deps import CurrentUser, DbSession, OptionalUser
from app.core.errors import ErrorResponse
from app.schemas.cart import CartItemAdd, CartItemUpdate, CartRead
from app.services import cart as cart_service

router = APIRouter(prefix="/cart", tags=["cart"])

CartIdHeader = Annotated[
    str | None,
    Header(alias="X-Cart-Id", description="Cart UUID returned by POST /cart"),
]
ItemId = Annotated[int, Path(ge=1)]

# Any: FastAPI types OpenAPI response metadata as dict[int | str, dict[str, Any]].
CART_ERRORS: dict[int | str, dict[str, Any]] = {
    status.HTTP_404_NOT_FOUND: {"model": ErrorResponse, "description": "Cart (or item) not found"},
}
STOCK_ERRORS: dict[int | str, dict[str, Any]] = {
    **CART_ERRORS,
    status.HTTP_409_CONFLICT: {"model": ErrorResponse, "description": "INSUFFICIENT_STOCK"},
}


@router.post(
    "",
    response_model=CartRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a guest cart (logged in: returns your cart)",
)
def create_cart(db: DbSession, user: OptionalUser) -> CartRead:
    return cart_service.to_read(cart_service.create_cart(db, user))


@router.get(
    "", response_model=CartRead, summary="The cart named by X-Cart-Id", responses=CART_ERRORS
)
def get_cart(db: DbSession, user: OptionalUser, x_cart_id: CartIdHeader = None) -> CartRead:
    cart = cart_service.get_cart(db, cart_service.resolve_cart_id(db, user, x_cart_id))
    return cart_service.to_read(cart)


@router.post(
    "/items",
    response_model=CartRead,
    summary="Add a product (merges with an identical line)",
    responses=STOCK_ERRORS,
)
def add_item(
    db: DbSession, user: OptionalUser, body: CartItemAdd, x_cart_id: CartIdHeader = None
) -> CartRead:
    cart = cart_service.add_item(
        db,
        cart_service.resolve_cart_id(db, user, x_cart_id),
        product_id=body.product_id,
        quantity=body.quantity,
        size=body.size,
        color=body.color,
    )
    return cart_service.to_read(cart)


@router.patch(
    "/items/{item_id}",
    response_model=CartRead,
    summary="Change a line's quantity",
    responses=STOCK_ERRORS,
)
def update_item(
    db: DbSession,
    user: OptionalUser,
    item_id: ItemId,
    body: CartItemUpdate,
    x_cart_id: CartIdHeader = None,
) -> CartRead:
    cart = cart_service.update_item(
        db, cart_service.resolve_cart_id(db, user, x_cart_id), item_id, quantity=body.quantity
    )
    return cart_service.to_read(cart)


@router.delete(
    "/items/{item_id}", response_model=CartRead, summary="Remove a line", responses=CART_ERRORS
)
def remove_item(
    db: DbSession, user: OptionalUser, item_id: ItemId, x_cart_id: CartIdHeader = None
) -> CartRead:
    cart = cart_service.remove_item(db, cart_service.resolve_cart_id(db, user, x_cart_id), item_id)
    return cart_service.to_read(cart)


@router.delete("", response_model=CartRead, summary="Empty the cart", responses=CART_ERRORS)
def clear_cart(db: DbSession, user: OptionalUser, x_cart_id: CartIdHeader = None) -> CartRead:
    cart = cart_service.clear_cart(db, cart_service.resolve_cart_id(db, user, x_cart_id))
    return cart_service.to_read(cart)


@router.post(
    "/merge",
    response_model=CartRead,
    summary="After login: move the X-Cart-Id guest cart into your cart",
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse, "description": "Not logged in"}
    },
)
def merge_cart(db: DbSession, user: CurrentUser, x_cart_id: CartIdHeader = None) -> CartRead:
    return cart_service.to_read(cart_service.merge_guest_cart(db, user, x_cart_id))
