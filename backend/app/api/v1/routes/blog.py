from typing import Annotated

from fastapi import APIRouter, Path, Query, status

from app.api.deps import DbSession
from app.core.errors import ErrorResponse
from app.core.pagination import Page
from app.schemas.blog import BlogCategoryRead, BlogPostRead, BlogPostSummary
from app.services import blog as blog_service

router = APIRouter(prefix="/blog", tags=["blog"])

DEFAULT_BLOG_PAGE_SIZE = 3


@router.get("/posts", response_model=Page[BlogPostSummary], summary="List blog posts, newest first")
def list_posts(
    db: DbSession,
    page: Annotated[int, Query(ge=1, description="1-based page number")] = 1,
    page_size: Annotated[int, Query(ge=1, le=12, description="Posts per page")] = (
        DEFAULT_BLOG_PAGE_SIZE
    ),
    category: Annotated[
        str | None, Query(max_length=60, description="Category slug, e.g. wood")
    ] = None,
    q: Annotated[
        str | None, Query(max_length=100, description="Case-insensitive match on title and excerpt")
    ] = None,
) -> Page[BlogPostSummary]:
    posts, total = blog_service.list_posts(
        db, category=category, q=q, page=page, page_size=page_size
    )
    return Page.build(
        [BlogPostSummary.model_validate(p) for p in posts],
        page=page,
        page_size=page_size,
        total=total,
    )


# Declared before /posts/{slug} so "recent" is not read as a slug.
@router.get(
    "/posts/recent", response_model=list[BlogPostSummary], summary="The newest posts (sidebar)"
)
def recent_posts(
    db: DbSession, limit: Annotated[int, Query(ge=1, le=10)] = 5
) -> list[BlogPostSummary]:
    return [BlogPostSummary.model_validate(p) for p in blog_service.recent_posts(db, limit=limit)]


@router.get(
    "/posts/{slug}",
    response_model=BlogPostRead,
    summary="One blog post with its content",
    responses={
        status.HTTP_404_NOT_FOUND: {"model": ErrorResponse, "description": "BLOG_POST_NOT_FOUND"}
    },
)
def get_post(
    db: DbSession, slug: Annotated[str, Path(max_length=120, examples=["modern-home-in-milan"])]
) -> BlogPostRead:
    return BlogPostRead.model_validate(blog_service.get_post(db, slug))


@router.get(
    "/categories", response_model=list[BlogCategoryRead], summary="Categories with post counts"
)
def list_categories(db: DbSession) -> list[BlogCategoryRead]:
    return blog_service.list_categories(db)
