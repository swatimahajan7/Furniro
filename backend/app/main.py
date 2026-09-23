import logging
import mimetypes
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app import __version__
from app.api.v1.router import API_V1_PREFIX, api_router
from app.core.config import Settings, get_settings
from app.core.errors import register_exception_handlers
from app.core.logging import REQUEST_ID_HEADER, RequestContextMiddleware, configure_logging
from app.db.migrate import upgrade_to_head
from app.db.session import get_sessionmaker
from app.seed.loader import run_seed

# Some OS mime tables lack WebP, which makes StaticFiles serve application/octet-stream.
mimetypes.add_type("image/webp", ".webp")

logger = logging.getLogger(__name__)


def _prepare_database() -> None:
    """SEED_ON_STARTUP: apply migrations, then load the baseline seed if the database is empty."""
    upgrade_to_head()
    with get_sessionmaker()() as session:
        run_seed(session, reset=False)


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings.log_level, json_output=settings.app_env == "prod")
    seed_on_startup = settings.seed_on_startup

    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        if seed_on_startup:
            _prepare_database()
        yield

    app = FastAPI(
        lifespan=lifespan,
        title=settings.app_name,
        version=__version__,
        openapi_url=f"{API_V1_PREFIX}/openapi.json",
        docs_url="/docs",
        redoc_url=None,
    )

    # TODO(phase-7+): rate limiting is out of scope; add a limiter middleware here if needed.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=[REQUEST_ID_HEADER],
    )
    # Added last so it is the outermost middleware and sees every request.
    app.add_middleware(RequestContextMiddleware)

    register_exception_handlers(app)
    app.include_router(api_router)

    settings.media_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/media", StaticFiles(directory=settings.media_dir), name="media")

    return app


app = create_app()
