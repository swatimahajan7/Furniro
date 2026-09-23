# Furniro

A full-stack furniture e-commerce demo app (React + FastAPI) built from the Furniro Figma UI kit,
for use as a target for manual and automated testing.

> **Status:** Phase 0 (foundation) is complete. The app currently serves a placeholder page with live API health.
> See [PLAN.md](PLAN.md) §7 for the phased roadmap.

## Documentation map
| Doc | What it covers |
|---|---|
| [PLAN.md](PLAN.md) | Scope, features (FR-IDs), architecture, data model, phases, testing strategy, DoD, resolved decisions, bug toggles |
| [docs/DESIGN_SPEC.md](docs/DESIGN_SPEC.md) | Design tokens, components, screen-by-screen notes, asset naming |
| [docs/API_CONTRACT.md](docs/API_CONTRACT.md) | REST endpoints, payloads, error codes, test-support and bug-toggle endpoints |
| [docs/BUG_CATALOGUE.md](docs/BUG_CATALOGUE.md) | Trainer-only answer key for the switchable deliberate defects |
| [backend/GUIDELINES.md](backend/GUIDELINES.md) | Backend structure, layering, coding and error rules, DB, seed, testing |
| [frontend/GUIDELINES.md](frontend/GUIDELINES.md) | Frontend structure, state strategy, styling, testids, a11y, testing |
| [docs/design/screens/](docs/design/screens/) | Renders of the 9 designed screens |

## Prerequisites
- [uv](https://docs.astral.sh/uv/) ≥ 0.12. It installs Python 3.12 for the backend automatically.
- Node.js 24 (22.13+ works) with npm.
- `make`.
- Optional: `poppler-utils` (`pdfimages`), only needed to re-extract design assets.
- Optional: Docker with Compose, for the production-like stack.

## Quickstart
```bash
make install    # uv sync + npm ci
make dev        # API on http://localhost:8100 (Swagger: /docs), web on http://localhost:5180
make check      # everything CI runs: lint, typecheck, tests (with coverage gates), API-contract drift
make help       # all targets
```
Ports 8000 and 5173 are left free for other local projects. Override with `make dev API_PORT=8200 WEB_PORT=5190`.

### Production-like stack (Docker)
```bash
make up            # PostgreSQL + API + nginx SPA → http://localhost:8080 (API on :8100)
make up-training   # same, with APP_ENV=test and bug toggles available (all off by default)
make down
```

### Design assets
`backend/media/` (48 WebP files) is committed, so you only need this after changing the name map:
```bash
make assets        # ~5 min: PDF → .design-extract/ (contact sheets) → backend/media/*.webp
```
The design PDF (`Furniro_Web_Design_UI_KIT.pdf`, 158 MB) is **not in git**, because it is over GitHub's 100 MB limit.
Keep a copy in the repo root.

### Network note
`frontend/.npmrc` uses `registry.yarnpkg.com`, a public mirror of the npm registry, because `registry.npmjs.org`
is unreachable on the primary dev network. Packages and checksums are identical.

Planned test accounts (Phase 5): `demo@furniro.test` / `Demo@1234` and `empty@furniro.test` / `Demo@1234`.
