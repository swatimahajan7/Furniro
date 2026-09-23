from datetime import datetime

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UtcDateTime


class BlogCategory(TimestampMixin, Base):
    """A blog sidebar category (Crafts, Design, …). Counts are computed, not stored."""

    __tablename__ = "blog_categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(60), unique=True)
    name: Mapped[str] = mapped_column(String(60))
    position: Mapped[int]


class BlogPost(TimestampMixin, Base):
    """An article. `content` is the small Markdown subset in docs/API_CONTRACT.md §2.8."""

    __tablename__ = "blog_posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True)
    title: Mapped[str] = mapped_column(String(160))
    excerpt: Mapped[str] = mapped_column(String(500))
    content: Mapped[str] = mapped_column(Text)
    cover_url: Mapped[str] = mapped_column(String(255))
    author: Mapped[str] = mapped_column(String(80))
    category_id: Mapped[int] = mapped_column(ForeignKey("blog_categories.id"), index=True)
    published_at: Mapped[datetime] = mapped_column(UtcDateTime, index=True)

    category: Mapped[BlogCategory] = relationship(lazy="joined")
