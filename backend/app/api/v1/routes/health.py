from fastapi import APIRouter, Response, status

from app import __version__
from app.api.deps import DbSession
from app.db.session import ping
from app.schemas.health import HealthRead

router = APIRouter(tags=["meta"])


@router.get(
    "/health",
    response_model=HealthRead,
    summary="Service and database health",
    responses={status.HTTP_503_SERVICE_UNAVAILABLE: {"model": HealthRead}},
)
def get_health(db: DbSession, response: Response) -> HealthRead:
    db_ok = ping(db)
    if not db_ok:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return HealthRead(
        status="ok" if db_ok else "degraded",
        version=__version__,
        db="ok" if db_ok else "error",
    )
