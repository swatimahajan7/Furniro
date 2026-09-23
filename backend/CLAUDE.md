# Backend (FastAPI) — instructions

Follow @GUIDELINES.md for every change in `backend/`.

Quick reminders:
- The layering is routes → services → models. Services never import FastAPI, and they raise `AppError` subclasses.
- Every schema change needs an Alembic migration that works on both SQLite and PostgreSQL.
- Before finishing, run `uv run ruff check . && uv run mypy app && uv run pytest -q`.
