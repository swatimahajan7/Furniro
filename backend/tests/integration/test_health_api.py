from fastapi import FastAPI
from fastapi.testclient import TestClient

from app import __version__
from app.db.session import get_db


def test_health_db_reachable_returns_ok(client: TestClient) -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "version": __version__, "db": "ok"}


def test_health_db_unreachable_returns_503_degraded(app: FastAPI) -> None:
    class BrokenSession:
        def execute(self, *_: object) -> None:
            raise RuntimeError("db down")

    app.dependency_overrides[get_db] = lambda: BrokenSession()
    with TestClient(app) as client:
        response = client.get("/api/v1/health")

    assert response.status_code == 503
    assert response.json()["status"] == "degraded"
    assert response.json()["db"] == "error"


def test_request_id_generated_when_absent(client: TestClient) -> None:
    response = client.get("/api/v1/health")

    assert len(response.headers["X-Request-Id"]) == 32


def test_request_id_echoed_when_provided(client: TestClient) -> None:
    response = client.get("/api/v1/health", headers={"X-Request-Id": "abc-123"})

    assert response.headers["X-Request-Id"] == "abc-123"


def test_media_mount_serves_webp_with_image_content_type(client: TestClient) -> None:
    response = client.get("/media/products/asgaard-sofa-1.webp")

    assert response.status_code == 200
    assert response.headers["content-type"] == "image/webp"


def test_media_mount_missing_file_returns_not_found_envelope(client: TestClient) -> None:
    response = client.get("/media/does-not-exist.webp")

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "NOT_FOUND"
