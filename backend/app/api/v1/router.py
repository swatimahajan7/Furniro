from fastapi import APIRouter, status

from app.api.v1.routes import cart, catalog, health, meta, orders
from app.core.errors import ErrorResponse

API_V1_PREFIX = "/api/v1"

# Declaring 422 here replaces FastAPI's default HTTPValidationError schema with our envelope.
api_router = APIRouter(
    prefix=API_V1_PREFIX,
    responses={
        status.HTTP_422_UNPROCESSABLE_CONTENT: {
            "model": ErrorResponse,
            "description": "Validation error (code VALIDATION_ERROR)",
        }
    },
)
api_router.include_router(health.router)
api_router.include_router(meta.router)
api_router.include_router(catalog.router)
api_router.include_router(cart.router)
api_router.include_router(orders.router)
