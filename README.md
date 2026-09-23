# Furniro

A full-stack furniture e-commerce demo app (React + FastAPI) built from the Furniro Figma UI kit.
Scope is the app itself: no automated tests are included, but every UI element carries a stable
`data-testid` so tests can be added later.

> **Status:** Phases 0–5 are complete: browse the catalog, add to the cart, check out (as a guest or logged in),
> register and log in, like products, compare up to 3 products, review products, see your orders, read the blog,
> send a contact message and subscribe to the newsletter. Phase 7 (hardening) is next. Placing orders decrements
> stock; run `make seed-reset` to restore the baseline.

## Documentation map
| Doc | What it covers |
|---|---|
| [PLAN.md](PLAN.md) | Scope, features (FR-IDs), architecture, data model, phases, testability (test IDs), DoD, resolved decisions |
| [docs/DESIGN_SPEC.md](docs/DESIGN_SPEC.md) | Design tokens, components, screen-by-screen notes, asset naming |
| [docs/API_CONTRACT.md](docs/API_CONTRACT.md) | REST endpoints, payloads, error codes |
| [backend/GUIDELINES.md](backend/GUIDELINES.md) | Backend structure, layering, coding and error rules, DB, seed, OpenAPI contract |
| [frontend/GUIDELINES.md](frontend/GUIDELINES.md) | Frontend structure, state strategy, styling, `data-testid` convention, a11y |
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
                # (the API migrates and seeds an empty database on startup)
make seed-reset # wipe the database and reload the deterministic seed
make check      # everything CI runs: lint, typecheck, frontend build, API-contract drift
make help       # all targets
```
Ports 8000 and 5173 are left free for other local projects. Override with `make dev API_PORT=8200 WEB_PORT=5190`.

### Production-like stack (Docker)
```bash
make up            # PostgreSQL + API + nginx SPA → http://localhost:8080 (API on :8100)
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

Demo accounts: `demo@furniro.test` / `Demo@1234` (2 past orders, 3 liked products) and `empty@furniro.test` /
`Demo@1234` (no orders). `make seed-reset` restores both.
