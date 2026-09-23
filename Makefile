# Furniro developer shortcuts. Run `make help` for the list.
.DEFAULT_GOAL := help
SHELL := /bin/bash

BACKEND  := backend
FRONTEND := frontend
UV       := cd $(BACKEND) && uv run
NPM      := cd $(FRONTEND) && npm run

API_PORT ?= 8100
WEB_PORT ?= 5180

.PHONY: help install dev dev-backend dev-frontend lint format typecheck build check openapi \
        contract assets assets-extract assets-build up down clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[33m%-16s\033[0m %s\n", $$1, $$2}'

# ------------------------------------------------------------------ setup & run
install: ## Install backend (uv) and frontend (npm) dependencies
	cd $(BACKEND) && uv sync
	cd $(FRONTEND) && npm ci

dev: ## Run backend (:8100) and frontend (:5180) together; Ctrl+C stops both
	@$(MAKE) -j2 --no-print-directory dev-backend dev-frontend

dev-backend: ## Run the API with auto-reload (default :8100, Swagger at /docs)
	$(UV) uvicorn app.main:app --reload --host 127.0.0.1 --port $(API_PORT)

dev-frontend: ## Run the Vite dev server (default :5180; proxies /api and /media)
	cd $(FRONTEND) && WEB_PORT=$(WEB_PORT) VITE_API_PROXY_TARGET=http://localhost:$(API_PORT) npm run dev

# ------------------------------------------------------------------ quality
lint: ## Lint + format-check both sides
	$(UV) ruff check .
	$(UV) ruff format --check .
	$(NPM) lint
	$(NPM) format:check

format: ## Auto-format both sides
	$(UV) ruff format .
	$(UV) ruff check --fix .
	$(NPM) format

typecheck: ## mypy (strict) + tsc
	$(UV) mypy
	$(NPM) typecheck

build: ## Production build of the frontend (includes tsc)
	$(NPM) build

check: lint typecheck build contract ## Everything CI runs

# ------------------------------------------------------------------ API contract
openapi: ## Re-export backend/openapi.json and regenerate frontend API types
	$(UV) python -m app.scripts.export_openapi > openapi.json
	$(NPM) gen:api

contract: openapi ## Fail if the committed OpenAPI spec or FE types are out of date
	@git diff --exit-code -- $(BACKEND)/openapi.json $(FRONTEND)/src/api/schema.d.ts \
		|| (echo "API contract drift: commit the regenerated files above." && exit 1)

# ------------------------------------------------------------------ design assets
assets: assets-extract assets-build ## Extract images from the design PDF into backend/media (~5 min)

assets-extract: ## Step 1: pull unique images + contact sheets into .design-extract/
	uv run scripts/extract_design_assets.py extract

assets-build: ## Step 2: convert mapped images to WebP in backend/media/
	uv run scripts/extract_design_assets.py build

# ------------------------------------------------------------------ containers
up: ## Production-like stack (PostgreSQL) → http://localhost:8080
	docker compose up --build

down: ## Stop the stack (keeps the database volume)
	docker compose down

clean: ## Remove caches and build output (keeps dependencies)
	rm -rf $(BACKEND)/.mypy_cache $(BACKEND)/.ruff_cache
	rm -rf $(FRONTEND)/dist
	find $(BACKEND) -name __pycache__ -type d -prune -exec rm -rf {} +
