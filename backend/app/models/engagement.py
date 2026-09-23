from sqlalchemy import String
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
