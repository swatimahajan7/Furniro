from fastapi import APIRouter

from app.api.deps import AppSettings
from app.schemas.meta import CountryRead, MetaConfigRead
from app.services import meta as meta_service

router = APIRouter(prefix="/meta", tags=["meta"])


@router.get("/config", response_model=MetaConfigRead, summary="Store configuration")
def get_config(settings: AppSettings) -> MetaConfigRead:
    return meta_service.get_config(settings)


@router.get(
    "/locations",
    response_model=list[CountryRead],
    summary="Countries and their provinces for the checkout form",
)
def get_locations() -> list[CountryRead]:
    return list(meta_service.get_locations())
