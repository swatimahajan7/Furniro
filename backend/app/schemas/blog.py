from datetime import datetime

from app.schemas.base import Schema


class BlogCategoryRef(Schema):
    slug: str
    name: str


class BlogCategoryRead(BlogCategoryRef):
    post_count: int


class BlogPostSummary(Schema):
    slug: str
    title: str
    excerpt: str
    cover_url: str
    author: str
    category: BlogCategoryRef
    published_at: datetime


class BlogPostRead(BlogPostSummary):
    content: str
