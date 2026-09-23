"""The error envelope (docs/API_CONTRACT.md §1.3) must hold for every failure type."""

from collections.abc import Iterator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.errors import ConflictError, ErrorDetail, NotFoundError


@pytest.fixture
def probe_client(app: FastAPI) -> Iterator[TestClient]:
    @app.get("/probe/not-found")
    def raise_not_found() -> None:
        raise NotFoundError("Product not found", code="PRODUCT_NOT_FOUND")

    @app.get("/probe/conflict")
    def raise_conflict() -> None:
        raise ConflictError(
            "Already subscribed",
            code="ALREADY_SUBSCRIBED",
            details=[ErrorDetail(field="email", message="duplicate")],
        )

    @app.get("/probe/validate")
    def validate(page: int) -> dict[str, int]:
        return {"page": page}

    @app.get("/probe/crash")
    def crash() -> None:
        raise RuntimeError("boom: secret internals")

    with TestClient(app, raise_server_exceptions=False) as client:
        yield client


def test_app_error_uses_its_status_and_code(probe_client: TestClient) -> None:
    response = probe_client.get("/probe/not-found")

    assert response.status_code == 404
    error = response.json()["error"]
    assert error["code"] == "PRODUCT_NOT_FOUND"
    assert error["message"] == "Product not found"
    assert error["request_id"] == response.headers["X-Request-Id"]


def test_app_error_includes_details(probe_client: TestClient) -> None:
    response = probe_client.get("/probe/conflict")

    assert response.status_code == 409
    assert response.json()["error"]["details"] == [{"field": "email", "message": "duplicate"}]


def test_validation_error_maps_fields(probe_client: TestClient) -> None:
    response = probe_client.get("/probe/validate", params={"page": "abc"})

    assert response.status_code == 422
    error = response.json()["error"]
    assert error["code"] == "VALIDATION_ERROR"
    assert error["details"][0]["field"] == "page"


def test_unknown_route_returns_not_found_envelope(probe_client: TestClient) -> None:
    response = probe_client.get("/api/v1/nope")

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "NOT_FOUND"


def test_wrong_method_returns_method_not_allowed(probe_client: TestClient) -> None:
    response = probe_client.delete("/api/v1/health")

    assert response.status_code == 405
    assert response.json()["error"]["code"] == "METHOD_NOT_ALLOWED"


def test_unhandled_exception_returns_500_without_internals(probe_client: TestClient) -> None:
    response = probe_client.get("/probe/crash", headers={"X-Request-Id": "req-500"})

    assert response.status_code == 500
    error = response.json()["error"]
    assert error["code"] == "INTERNAL_ERROR"
    assert "secret" not in response.text
    assert error["request_id"] == "req-500"
    assert response.headers["X-Request-Id"] == "req-500"
