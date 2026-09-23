"""Contract guard: the served OpenAPI spec must match the committed backend/openapi.json.

After an intentional API change run `make openapi` (or pytest --update-snapshot),
then regenerate the frontend types. See docs/API_CONTRACT.md.
"""

import json
from pathlib import Path

import pytest
from fastapi import FastAPI

SNAPSHOT = Path(__file__).resolve().parents[1] / "openapi.json"


def test_openapi_matches_committed_snapshot(app: FastAPI, request: pytest.FixtureRequest) -> None:
    current = json.dumps(app.openapi(), indent=2, sort_keys=True) + "\n"

    if request.config.getoption("--update-snapshot"):
        SNAPSHOT.write_text(current)

    assert SNAPSHOT.exists(), "backend/openapi.json missing: run `make openapi`"
    assert SNAPSHOT.read_text() == current, (
        "OpenAPI spec changed: run `make openapi`, update docs/API_CONTRACT.md, and commit"
    )
