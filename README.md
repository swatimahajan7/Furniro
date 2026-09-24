# Furniro

A full-stack furniture e-commerce demo app (React + FastAPI) built from the Furniro Figma UI kit.
Scope is the app itself: no automated tests are included, but every UI element carries a stable
`data-testid` so tests can be added later.

> **Status:** all phases (0–7) are complete. You can browse and filter the catalog, compare products, check out
> as a guest or logged in, register, like products, review them, see your orders, read the blog, and use the
> contact form and newsletter. Every screen works from 360 px to 1440 px, has loading, error and empty states, and
> meets the Lighthouse targets (≥ 90 for Performance, Accessibility and Best Practices, mobile and desktop).

## Documentation map
| Doc | What it covers |
|---|---|
| [PLAN.md](PLAN.md) | Scope, features (FR-IDs), architecture, data model, phases, testability (test IDs), DoD, decisions |
| [docs/DESIGN_SPEC.md](docs/DESIGN_SPEC.md) | Design tokens, components, screen-by-screen notes, asset naming |
| [docs/API_CONTRACT.md](docs/API_CONTRACT.md) | REST endpoints, payloads, error codes |
| [backend/GUIDELINES.md](backend/GUIDELINES.md) | Backend structure, layering, coding and error rules, DB, seed, OpenAPI contract |
| [frontend/GUIDELINES.md](frontend/GUIDELINES.md) | Frontend structure, state, styling, `data-testid` convention, accessibility, performance |
| [docs/design/screens/](docs/design/screens/) | Renders of the 9 designed screens |

## Prerequisites
- [uv](https://docs.astral.sh/uv/) ≥ 0.12. It installs Python 3.12 for the backend automatically.
- Node.js 24 (22.22+ works) with npm.
- `make`.
- Optional: Docker with Compose, for the production-like stack.
- Optional: `poppler-utils` (`pdfimages`), only needed to re-extract design assets from the PDF.

## Quickstart
```bash
make install    # uv sync + npm ci
make dev        # API on http://localhost:8100 (Swagger: /docs), web on http://localhost:5180
                # (the API migrates and seeds an empty SQLite database on startup)
```
Open http://localhost:5180 and log in with a demo account, or shop as a guest.

Ports 8000 and 5173 are left free for other local projects. Override with `make dev API_PORT=8200 WEB_PORT=5190`.

## Demo accounts
| Email | Password | What it has |
|---|---|---|
| `demo@furniro.test` | `Demo@1234` | 2 past orders (`FUR-000001`, `FUR-000002`) and 3 liked products |
| `empty@furniro.test` | `Demo@1234` | Nothing yet: no orders, empty wishlist |

The seed is deterministic. Placing orders really decrements stock, so run `make seed-reset` to get back to the
baseline (both accounts, 32 products, 80 reviews, 24 blog posts).

## Everyday commands
```bash
make seed-reset   # wipe the database and reload the deterministic seed
make check        # everything CI runs: lint, typecheck, frontend build, API-contract drift
make openapi      # after an API change: re-export backend/openapi.json and regenerate the FE types
make format       # auto-format both sides
make help         # every target
```
A production build of the frontend can be previewed with `cd frontend && npm run build && npm run preview`
(http://localhost:4180; it proxies `/api` and `/media` to the API on :8100, like the dev server).

## Production-like stack
```bash
make up     # PostgreSQL 16 + API + nginx-served SPA → http://localhost:8080 (API on :8100)
make down   # stop it (the database volume is kept)
```
The API migrates and seeds PostgreSQL on first start. Host ports can be moved with `FURNIRO_WEB_PORT` and
`FURNIRO_API_PORT`, for example to run beside `make dev`. `make up COMPOSE="…"` runs another Compose tool.

`podman-compose` 1.5 with Podman 3.4 cannot run this file: it gives the containers no service-name DNS and ignores
`depends_on: condition: service_healthy`. On such a machine, the two images (`make up` builds them) run fine in a
Podman pod; the Phase 7 notes in PLAN.md show how they were verified that way.

## Design assets
`backend/media/` is committed: 48 WebP images plus 240/480/640/960 px copies of each for responsive `srcset`s.
You only need these commands after changing the image name map or the originals:
```bash
make assets            # ~5 min: PDF → .design-extract/ (contact sheets) → backend/media/*.webp + variants
make assets-variants   # regenerate only the responsive copies (no PDF needed)
```
The design PDF (`Furniro_Web_Design_UI_KIT.pdf`, 158 MB) is **not in git**, because it is over GitHub's 100 MB limit.
Keep a copy in the repo root.

## Network note
`frontend/.npmrc` uses `registry.yarnpkg.com`, a public mirror of the npm registry, because `registry.npmjs.org`
is unreachable on the primary dev network. Packages and checksums are identical.
