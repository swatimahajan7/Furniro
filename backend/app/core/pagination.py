from math import ceil
from typing import Annotated

from fastapi import Query
from pydantic import AfterValidator, BaseModel

# Allowed page sizes for product listings (docs/API_CONTRACT.md §1.2); the Shop "Show" select.
PRODUCT_PAGE_SIZES: tuple[int, ...] = (8, 16, 24, 32)
DEFAULT_PRODUCT_PAGE_SIZE = 16


def _allowed_page_size(value: int) -> int:
    if value not in PRODUCT_PAGE_SIZES:
        allowed = ", ".join(str(size) for size in PRODUCT_PAGE_SIZES)
        raise ValueError(f"page_size must be one of {allowed}")
    return value


# A plain int that is checked against the allowed set. (A Literal type would reject "16"
# because query-string values arrive as text.)
ProductPageSize = Annotated[
    int,
    Query(json_schema_extra={"enum": list(PRODUCT_PAGE_SIZES)}, description="Items per page"),
    AfterValidator(_allowed_page_size),
]


class Page[T](BaseModel):
    items: list[T]
    page: int
    page_size: int
    total: int
    total_pages: int

    @classmethod
    def build(cls, items: list[T], *, page: int, page_size: int, total: int) -> "Page[T]":
        return cls(
            items=items,
            page=page,
            page_size=page_size,
            total=total,
            total_pages=ceil(total / page_size) if total else 0,
        )


def offset_for(page: int, page_size: int) -> int:
    return (page - 1) * page_size
