from fastapi import APIRouter, status

from app.api.deps import DbSession
from app.core.errors import ErrorResponse
from app.schemas.forms import (
    ContactCreate,
    ContactReceipt,
    NewsletterSubscribe,
    NewsletterSubscription,
)
from app.services import forms as forms_service

router = APIRouter(tags=["forms"])


@router.post(
    "/contact",
    response_model=ContactReceipt,
    status_code=status.HTTP_201_CREATED,
    summary="Send a message from the contact form",
)
def send_contact_message(db: DbSession, body: ContactCreate) -> ContactReceipt:
    message = forms_service.create_contact_message(db, body)
    return ContactReceipt(id=message.id, received_at=message.created_at)


@router.post(
    "/newsletter/subscribe",
    response_model=NewsletterSubscription,
    status_code=status.HTTP_201_CREATED,
    summary="Subscribe an email to the newsletter",
    responses={
        status.HTTP_409_CONFLICT: {"model": ErrorResponse, "description": "ALREADY_SUBSCRIBED"}
    },
)
def subscribe(db: DbSession, body: NewsletterSubscribe) -> NewsletterSubscription:
    subscriber = forms_service.subscribe(db, body.email)
    return NewsletterSubscription(email=subscriber.email, subscribed_at=subscriber.created_at)
