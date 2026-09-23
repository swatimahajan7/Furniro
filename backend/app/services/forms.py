"""Contact form and newsletter (FR-CON-01, FR-NEWS-01). Stored and logged; no email is sent."""

import logging

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.errors import ALREADY_SUBSCRIBED, ConflictError
from app.models import ContactMessage, NewsletterSubscriber
from app.schemas.forms import ContactCreate

logger = logging.getLogger(__name__)


def create_contact_message(session: Session, body: ContactCreate) -> ContactMessage:
    message = ContactMessage(
        name=body.name, email=body.email.lower(), subject=body.subject, message=body.message
    )
    session.add(message)
    session.commit()
    # Log the id only; the message itself stays in the database.
    logger.info("contact message %s received", message.id)
    return message


def subscribe(session: Session, email: str) -> NewsletterSubscriber:
    email = email.lower()
    duplicate = ConflictError("This email is already subscribed", code=ALREADY_SUBSCRIBED)
    if session.scalar(select(NewsletterSubscriber.id).where(NewsletterSubscriber.email == email)):
        raise duplicate
    subscriber = NewsletterSubscriber(email=email)
    session.add(subscriber)
    try:
        session.commit()
    except IntegrityError:  # two sign-ups with the same email at once
        session.rollback()
        raise duplicate from None
    logger.info("newsletter subscription %s created", subscriber.id)
    return subscriber
