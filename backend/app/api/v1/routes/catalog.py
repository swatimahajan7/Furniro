from typing import Annotated, Any

from fastapi import APIRouter, Path, Query, status

from app.api.deps import DbSession
from app.core.errors import ErrorResponse
from app.core.pagination import DEFAULT_PRODUCT_PAGE_SIZE, Page, ProductPageSize
from app.schemas.catalog import (
    CategoryRead,
    CompareResponse,
    InspirationRead,
    ProductDetail,
    ProductSort,
    ProductSummary,
    RelatedProducts,
    ReviewRead,
    RoomRead,
)
from app.services import catalog as catalog_service

router = APIRouter(tags=["catalog"])

# Any: FastAPI types OpenAPI response metadata as dict[int | str, dict[str, Any]].
Responses = dict[int | str, dict[str, Any]]
NOT_FOUND: Responses = {
    status.HTTP_404_NOT_FOUND: {"model": ErrorResponse, "description": "Not found"}
}
BAD_REQUEST: Responses = {
    status.HTTP_400_BAD_REQUEST: {"model": ErrorResponse, "description": "Bad request"}
}

Slug = Annotated[str, Path(max_length=120, examples=["asgaard-sofa"])]
PageNumber = Annotated[int, Query(ge=1, description="1-based page number")]


@router.get(
    "/products",
    response_model=Page[ProductSummary],
    summary="List products with filters, sorting and pagination",
    responses=BAD_REQUEST,
)
def list_products(
    db: DbSession,
    q: Annotated[
        str | None,
        Query(max_length=100, description="Case-insensitive match on name and subtitle"),
    ] = None,
    category: Annotated[
        list[str], Query(description="Category slug; repeat for several, e.g. ?category=sofas")
    ] = [],  # noqa: B006 - FastAPI copies query defaults per request
    room: Annotated[
        list[str], Query(description="Room slug (dining, living, bedroom); repeatable")
    ] = [],  # noqa: B006
    min_price: Annotated[int | None, Query(ge=0, description="Inclusive, in US cents")] = None,
    max_price: Annotated[int | None, Query(ge=0, description="Inclusive, in US cents")] = None,
    on_sale: Annotated[bool | None, Query(description="Only products with a discount")] = None,
    is_new: Annotated[bool | None, Query(description="Only products marked New")] = None,
    featured: Annotated[bool | None, Query(description="Only home-page products")] = None,
    sort: ProductSort = ProductSort.default,
    page: PageNumber = 1,
    page_size: ProductPageSize = DEFAULT_PRODUCT_PAGE_SIZE,
) -> Page[ProductSummary]:
    filters = catalog_service.ProductFilters(
        q=q,
        categories=category,
        rooms=room,
        min_price=min_price,
        max_price=max_price,
        on_sale=on_sale,
        is_new=is_new,
        featured=featured,
    )
    items, total = catalog_service.list_products(
        db, filters, sort=sort, page=page, page_size=page_size
    )
    return Page.build(
        [ProductSummary.model_validate(p) for p in items],
        page=page,
        page_size=page_size,
        total=total,
    )


# Declared before /products/{slug} so "compare" is not captured as a slug.
@router.get(
    "/products/compare",
    response_model=CompareResponse,
    summary="Compare up to 3 products side by side",
    responses={**BAD_REQUEST, **NOT_FOUND},
)
def compare_products(
    db: DbSession,
    ids: Annotated[
        str,
        Query(
            pattern=r"^\d+(,\d+)*$",
            description="Comma-separated product IDs, at most 3",
            examples=["9,10"],
        ),
    ],
) -> CompareResponse:
    return catalog_service.compare_products(db, [int(i) for i in ids.split(",")])


@router.get(
    "/products/{slug}",
    response_model=ProductDetail,
    summary="Product detail",
    responses=NOT_FOUND,
)
def get_product(db: DbSession, slug: Slug) -> ProductDetail:
    return ProductDetail.model_validate(catalog_service.get_product(db, slug))


@router.get(
    "/products/{slug}/related",
    response_model=RelatedProducts,
    summary="Products in the same category",
    responses=NOT_FOUND,
)
def list_related(
    db: DbSession,
    slug: Slug,
    limit: Annotated[int, Query(ge=1, le=16)] = 4,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> RelatedProducts:
    items, has_more = catalog_service.list_related(db, slug, limit=limit, offset=offset)
    return RelatedProducts(
        items=[ProductSummary.model_validate(p) for p in items], has_more=has_more
    )


@router.get(
    "/products/{slug}/reviews",
    response_model=Page[ReviewRead],
    summary="Product reviews, newest first",
    responses=NOT_FOUND,
)
def list_reviews(
    db: DbSession,
    slug: Slug,
    page: PageNumber = 1,
    page_size: Annotated[int, Query(ge=1, le=50)] = 10,
) -> Page[ReviewRead]:
    items, total = catalog_service.list_reviews(db, slug, page=page, page_size=page_size)
    return Page.build(
        [ReviewRead.model_validate(r) for r in items],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.get(
    "/categories", response_model=list[CategoryRead], summary="Categories with product counts"
)
def list_categories(db: DbSession) -> list[CategoryRead]:
    return [
        CategoryRead(slug=category.slug, name=category.name, product_count=count)
        for category, count in catalog_service.list_categories(db)
    ]


@router.get("/rooms", response_model=list[RoomRead], summary="Rooms (Browse The Range)")
def list_rooms(db: DbSession) -> list[RoomRead]:
    return [RoomRead.model_validate(r) for r in catalog_service.list_rooms(db)]


@router.get(
    "/inspirations",
    response_model=list[InspirationRead],
    summary="Home page room-inspiration slides",
)
def list_inspirations(db: DbSession) -> list[InspirationRead]:
    return [InspirationRead.model_validate(i) for i in catalog_service.list_inspirations(db)]
