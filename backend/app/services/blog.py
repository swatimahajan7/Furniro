"""Blog posts and categories (FR-BLOG-01). Newest first everywhere; ties broken by id."""

from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session

from app.core.errors import BLOG_POST_NOT_FOUND, NotFoundError
from app.core.pagination import offset_for
from app.models import BlogCategory, BlogPost
from app.schemas.blog import BlogCategoryRead

NEWEST_FIRST = (BlogPost.published_at.desc(), BlogPost.id.desc())


def _filtered(
    stmt: Select[tuple[BlogPost]], *, category: str | None, q: str | None
) -> Select[tuple[BlogPost]]:
    if category:
        stmt = stmt.join(BlogPost.category).where(BlogCategory.slug == category)
    if q:
        stmt = stmt.where(
            or_(
                BlogPost.title.icontains(q, autoescape=True),
                BlogPost.excerpt.icontains(q, autoescape=True),
            )
        )
    return stmt


def list_posts(
    session: Session, *, category: str | None, q: str | None, page: int, page_size: int
) -> tuple[list[BlogPost], int]:
    """Unknown categories simply match nothing, like product filters."""
    stmt = _filtered(select(BlogPost), category=category, q=q)
    total = session.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    items = session.scalars(
        stmt.order_by(*NEWEST_FIRST).offset(offset_for(page, page_size)).limit(page_size)
    ).all()
    return list(items), total


def recent_posts(session: Session, *, limit: int) -> list[BlogPost]:
    return list(session.scalars(select(BlogPost).order_by(*NEWEST_FIRST).limit(limit)).all())


def get_post(session: Session, slug: str) -> BlogPost:
    post = session.scalar(select(BlogPost).where(BlogPost.slug == slug))
    if post is None:
        raise NotFoundError(f"Blog post '{slug}' not found", code=BLOG_POST_NOT_FOUND)
    return post


def list_categories(session: Session) -> list[BlogCategoryRead]:
    """Every category in sidebar order, with its post count (0 included)."""
    rows = session.execute(
        select(BlogCategory.slug, BlogCategory.name, func.count(BlogPost.id))
        .outerjoin(BlogPost, BlogPost.category_id == BlogCategory.id)
        .group_by(BlogCategory.id, BlogCategory.slug, BlogCategory.name, BlogCategory.position)
        .order_by(BlogCategory.position, BlogCategory.id)
    ).all()
    return [BlogCategoryRead(slug=slug, name=name, post_count=count) for slug, name, count in rows]
