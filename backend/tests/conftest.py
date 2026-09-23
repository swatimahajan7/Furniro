import os

# Configure the environment before any `app` module reads settings.
os.environ["APP_ENV"] = "test"
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ["SEED_ON_STARTUP"] = "false"

from collections.abc import Iterator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.main import create_app


def pytest_addoption(parser: pytest.Parser) -> None:
    parser.addoption(
        "--update-snapshot",
        action="store_true",
        default=False,
        help="Rewrite backend/openapi.json from the current app instead of comparing.",
    )


@pytest.fixture
def app() -> FastAPI:
    return create_app()


@pytest.fixture
def client(app: FastAPI) -> Iterator[TestClient]:
    with TestClient(app) as test_client:
        yield test_client
