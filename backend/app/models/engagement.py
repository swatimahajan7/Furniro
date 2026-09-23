from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class Inspiration(TimestampMixin, Base):
    """A slide in the home page "50+ Beautiful rooms inspiration" carousel."""

    __tablename__ = "inspirations"

    id: Mapped[int] = mapped_column(primary_key=True)
    index_label: Mapped[str] = mapped_column(String(4))  # "01"
    room: Mapped[str] = mapped_column(String(60))  # "Bed Room"
    title: Mapped[str] = mapped_column(String(80))  # "Inner Peace"
    image_url: Mapped[str] = mapped_column(String(255))
    link: Mapped[str] = mapped_column(String(255))
    position: Mapped[int]


class ContactMessage(TimestampMixin, Base):
    """A message from the contact form. Stored and logged; no email is sent (PLAN.md §1)."""

    __tablename__ = "contact_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80))
    email: Mapped[str] = mapped_column(String(254))
    subject: Mapped[str | None] = mapped_column(String(120))
    message: Mapped[str] = mapped_column(Text)


class NewsletterSubscriber(TimestampMixin, Base):
    """A footer newsletter sign-up. Emails are stored lowercased, so uniqueness ignores case."""

    __tablename__ = "newsletter_subscribers"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True)
