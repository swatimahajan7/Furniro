# Backend Guidelines — Furniro API

These are the rules, structure and strategies for `backend/`. Read them before writing code.
If a rule blocks you, change the rule here in the same PR and explain why. Do not quietly break it.

Stack: **Python 3.12 · FastAPI · SQLAlchemy 2.0 (sync) · Alembic · Pydantic v2 · pydantic-settings ·
PyJWT · bcrypt · pytest · ruff · mypy · uv**

---

## 1. Directory structure

```
backend/
├── pyproject.toml            # deps + ruff/mypy/pytest config (single source)
├── openapi.json              # committed OpenAPI export: contract snapshot + FE type source
├── uv.lock
├── alembic.ini
├── .env.example              # every setting, with safe defaults
├── Dockerfile
├── media/                    # static images served at /media (seeded assets)
├── migrations/               # Alembic env + versions/
├── app/
│   ├── main.py               # create_app(): middleware, routers, handlers, /media mount
│   ├── core/
│   │   ├── config.py         # Settings (pydantic-settings), get_settings() cached
│   │   ├── security.py       # hash/verify password, create/decode JWT
│   │   ├── errors.py         # AppError hierarchy + exception handlers
│   │   ├── logging.py        # structured logging + request-id middleware
│   │   └── pagination.py     # PageParams dependency, Page[T] schema, paginate()
│   ├── db/
│   │   ├── base.py           # DeclarativeBase, naming convention, TimestampMixin
│   │   └── session.py        # engine, SessionLocal, get_db() dependency
│   ├── models/               # ORM models, one module per aggregate
│   │   ├── __init__.py       # re-exports every model (Alembic autogenerate needs this)
│   │   ├── catalog.py        # Category, Room, Tag, Product, ProductImage, ProductSpec
│   │   ├── review.py
│   │   ├── user.py
│   │   ├── cart.py           # Cart, CartItem
│   │   ├── order.py          # Order, OrderItem
│   │   ├── wishlist.py
│   │   ├── blog.py           # BlogCategory, BlogPost
│   │   └── engagement.py     # Inspiration, ContactMessage, NewsletterSubscriber
│   ├── schemas/              # Pydantic request/response models, mirroring models/
│   ├── services/             # business logic, one module per domain, no FastAPI imports
│   ├── bugs/                 # deliberate defect toggles (PLAN §13, docs/BUG_CATALOGUE.md)
│   │   ├── registry.py       # BugId StrEnum + metadata (layer, title)
│   │   └── state.py          # global in-memory state + per-request override (contextvar), is_active()
│   ├── scripts/              # export_openapi.py (dev tooling, excluded from coverage)
│   ├── api/
│   │   ├── deps.py           # get_db, get_current_user, get_optional_user, get_cart_id
│   │   └── v1/
│   │       ├── router.py     # includes every route module under /api/v1
│   │       └── routes/       # products.py, cart.py, orders.py, auth.py, …, test_support.py, bugs.py
│   └── seed/
│       ├── __main__.py       # `python -m app.seed [--reset]`
│       ├── loader.py
│       ├── scenarios.py      # named test scenarios
│       └── data/             # products.json, blog.json, locations.json, users.json …
└── tests/
    ├── conftest.py           # app, db (transaction rollback), client, auth helpers
    ├── factories.py          # small builder functions (make_product(...))
    ├── unit/                 # services & pure functions, no HTTP
    └── integration/          # one file per router: test_products_api.py …
```

## 2. Layering rules (strict)

```
routes (api/v1/routes)  →  services  →  models / Session
     ↑ schemas in/out          ↑ raise AppError         ↑ SQLAlchemy only
```

1. **Routes are thin.** They parse input into schemas, resolve dependencies, call one service function, and return a schema. They contain no queries and no business rules.
2. **Services own the business logic.** They take a `Session` and plain arguments or schemas, and return ORM objects or dataclasses. They **never** import `fastapi` or raise `HTTPException`. They raise `AppError` subclasses.
3. **Models are persistence only.** No business methods beyond trivial computed properties (for example `discount_percent`).
4. **Schemas are the only thing that crosses the HTTP boundary.** Routes declare `response_model`, and ORM objects are never returned raw. Use `model_config = ConfigDict(from_attributes=True)`.
5. There is no repository layer (a deliberate choice to reduce ceremony). If a query is reused by 2 or more services, move it into a private helper in `services/_queries.py`.
6. Imports go downward only: `api → services → models`, and `core` may be imported by anyone. Circular imports are a design smell. Fix the design, not the import order.

## 3. Coding rules

### 3.1 Style and typing
- `ruff format` plus `ruff check` with rule sets `E,F,I,B,UP,SIM,N,S,RUF` enabled. Line length is 100.
- `mypy --strict` on `app/`. `Any` is allowed only with a comment explaining why.
- Every function signature has type hints. Use `X | None`, not `Optional[X]`.
- Names:
  - modules and functions: `snake_case`
  - classes: `PascalCase`
  - constants: `UPPER_SNAKE`
  - services: verb-first (`add_item_to_cart`, `list_products`)
  - schemas: `<Thing>Create`, `<Thing>Update`, `<Thing>Read`, `<Thing>Summary`
- No wildcard imports. There are no relative imports beyond the current package; prefer absolute `app.…` imports.
- Docstrings are needed for public service functions only when behaviour is not obvious from the name and types.

### 3.2 API design
- Every route is under `/api/v1`. URLs are plural nouns in kebab-case, and resources are addressed by **slug** where one exists (products, blog posts).
- Status codes: `200` read/update, `201` create, `204` delete or idempotent PUT with no body, and errors per §4.
- Every route has `summary`, `tags` and `response_model`. Error responses are documented with `responses={404: {"model": ErrorResponse}}`.
- List endpoints always paginate with `PageParams` and `Page[T]`. There are no unbounded lists, except small reference data (categories, rooms, locations).
- Query-parameter enums are `StrEnum`s, so OpenAPI shows allowed values.
- **Breaking-change rule:** never rename or remove a field in v1. Add new fields and deprecate old ones. Update `docs/API_CONTRACT.md` and regenerate the FE types in the same PR.

### 3.3 Money, time, IDs
- Money is an `int` in minor units, i.e. **US cents** (`*_minor` suffix). Float money is forbidden. Totals are computed in services, never in SQL with floats.
- Time is timezone-aware UTC (`datetime.now(UTC)`), and columns use `DateTime(timezone=True)`.
- Primary keys are integers. Cart IDs are UUID4, because they are exposed to anonymous clients. Order numbers look like `FUR-000123`, derived from the ID.

### 3.4 Validation
- Input shape and format are validated in schemas with Pydantic (`EmailStr`, `constr`, `conint`, `Field(ge=, le=)`).
- Business rules are validated in services: stock, allowed sizes and colours, compare limit, duplicate subscription.
- Strip whitespace on all string inputs (`str_strip_whitespace=True` in the base schema config).

## 4. Error handling strategy
- `core/errors.py` defines `AppError(code: str, message: str, status: int, details: list | None)` plus subclasses: `NotFoundError`, `ConflictError`, `BadRequestError`, `UnauthorizedError`, `ForbiddenError`.
- Global handlers turn these into the envelope in [API_CONTRACT §1.3](../docs/API_CONTRACT.md):
  - `AppError` becomes its own status and code.
  - `RequestValidationError` becomes `422 VALIDATION_ERROR`, with `details` mapped to `{field, message}`.
  - `StarletteHTTPException` (404/405) becomes the envelope.
  - Any other `Exception` becomes `500 INTERNAL_ERROR`. The stack trace is logged and never returned.
- Error `code`s are `UPPER_SNAKE` constants in `core/errors.py`. Tests assert on `code`, not on `message`.

## 5. Configuration and security
- All config lives in `Settings` (`core/config.py`), read from the environment or `.env`. Code never reads `os.environ` directly.
  - Keys: `APP_ENV` (`dev|test|prod`), `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_MINUTES=1440`, `CORS_ORIGINS`, `MEDIA_DIR`, `SEED_ON_STARTUP`, `LOG_LEVEL`, `BUG_TOGGLES_ENABLED=false`.
  - Currency is fixed in settings as `CURRENCY_CODE=USD`, `CURRENCY_SYMBOL=$`, `CURRENCY_LOCALE=en-US`, and exposed through `/meta/config`.
- `JWT_SECRET` has no default when `APP_ENV=prod`. Startup fails if it is missing.
- Passwords are hashed with bcrypt (cost 12, or 4 under `APP_ENV=test` for speed). Never log passwords, tokens or full request bodies from auth routes.
- CORS allows only the origins in `CORS_ORIGINS` (default `http://localhost:5180`).
- `test_support` routes are **included in the router only when `APP_ENV=test`**. This is enforced by a unit test.
- `bugs` routes are included only when `BUG_TOGGLES_ENABLED=true`. `Settings` validation **refuses to start** with `BUG_TOGGLES_ENABLED=true` and `APP_ENV=prod`. Both rules are enforced by unit tests.
- SQL is always built with SQLAlchemy. Never format user input into SQL strings.
- Rate limiting is out of scope. Leave a TODO in `main.py` so it is easy to add.

## 6. Data model

All tables have `id` (PK), `created_at` and `updated_at` (`TimestampMixin`) unless noted. The naming convention for constraints is set in `db/base.py` (`ix_`, `uq_`, `fk_`, `pk_`, `ck_`).

| Table | Key columns | Constraints |
|---|---|---|
| `categories` | slug, name, position | uq(slug) |
| `rooms` | slug, name, image_url, position | uq(slug) |
| `tags` / `product_tags` | name / (product_id, tag_id) | uq(name) / pk(both) |
| `products` | slug, sku, name, subtitle, short_description, description (JSON list of paragraphs), price_minor, compare_at_price_minor?, is_new, is_featured, position, stock, sizes (JSON), colors (JSON), category_id, room_id?, rating_avg, review_count | uq(slug), uq(sku), ck(price_minor ≥ 0), ck(compare_at > price) |
| `product_images` | product_id, url, alt, kind (`gallery`/`description`), position | |
| `product_specs` | product_id, group, label, value, position | ix(product_id, group) |
| `reviews` | product_id, user_id?, author_name, rating, comment | ck(rating 1..5), uq(product_id, user_id) |
| `users` | email, password_hash, first_name, last_name | uq(lower(email)) |
| `carts` | id **UUID**, user_id? | uq(user_id) (one active cart per user) |
| `cart_items` | cart_id, product_id, quantity, size?, color? | uq(cart_id, product_id, size, color), ck(quantity 1..10) |
| `orders` | order_number, user_id?, email, status, payment_method, billing (JSON), subtotal_minor, total_minor | uq(order_number) |
| `order_items` | order_id, product_id?, product_name, size?, color?, quantity, unit_price_minor, line_total_minor | Snapshots only, never joined for price |
| `wishlist_items` | user_id, product_id | pk(both) |
| `blog_categories` / `blog_posts` | slug, name / slug, title, excerpt, content, cover_url, author, category_id, published_at | uq(slug) |
| `inspirations` | index_label, room, title, image_url, link, position | |
| `contact_messages` | name, email, subject?, message | |
| `newsletter_subscribers` | email | uq(lower(email)) |

`rating_avg` and `review_count` are denormalised and updated by `review_service.create_review`, which keeps list queries cheap.

## 7. Database and migrations
- Every schema change goes through Alembic: `uv run alembic revision --autogenerate -m "add wishlist"`. Review the generated file by hand before committing.
- Migrations must work on **both SQLite and PostgreSQL**. Use `render_as_batch=True` for SQLite ALTERs, and avoid PG-only types (use `JSON`, not `JSONB`).
- Never edit a migration that has been merged. Write a new one.
- `SEED_ON_STARTUP=true` (dev default) runs migrations and then seeds if the DB is empty.

## 8. Seed data strategy
- The seed is **deterministic**: fixed IDs, slugs, timestamps (`2026-01-01T00:00:00Z` + offsets) and review authors. It uses no `random` and no `faker` at runtime.
- The data lives in `app/seed/data/*.json` and is validated through the same Pydantic schemas before insert.
- The baseline matches the design:
  - 32 products; the first 8 are the design's cards: Syltherine, Leviosa, Lolito, Respira, Grifo, Muggo, Pingky, Potty.
  - Prices come from the design, rescaled to USD: Rp ÷ 10,000 and Rs. ÷ 100. For example, Syltherine is $250.00 (was $350.00, -30%), Muggo $15.00, Lolito $700.00 (was $1,400.00), and Asgaard sofa $2,500.00.
  - Asgaard sofa (SKU `SS001`, 5 reviews) and Outdoor Sofa Set, with full specs for `/compare`.
  - Blog categories with counts Crafts 2 / Design 8 / Handmade 7 / Interior 1 / Wood 6. The blog therefore has 24 posts, so the counts are true and pagination has 8 pages.
- `SEED_VERSION` constant: bump it whenever seed data changes. `/__test__/reset` returns it so test suites can detect a mismatch.
- Scenarios (`seed/scenarios.py`) layer on top of the baseline and return the handles tests need (cart_id, token, product IDs).

## 9. Testing strategy
- **Framework:** pytest, `fastapi.testclient.TestClient` (backed by `httpx2`; Starlette deprecated plain `httpx`), pytest-cov. Warnings are errors (`filterwarnings = error`).
- **Isolation:** each test runs inside a transaction that is rolled back (`conftest.db` fixture with a nested SAVEPOINT). The baseline seed is loaded once per session.
- **Layout:** `tests/unit/test_<service>.py` for service logic, and `tests/integration/test_<router>_api.py` for HTTP behaviour.
- **What every endpoint needs:** the happy path, validation failure (422 with the field in `details`), not found, the auth-required path (401) where relevant, and boundary values (page size limits, qty 0/1/10/11, compare 3/4).
- **Naming:** `test_<unit>_<condition>_<expected>`, for example `test_add_item_same_variant_merges_quantity`.
- **Assertions:** assert on the status code, the error `code`, and the exact JSON shape (via schema) for key endpoints.
- **Coverage gate:** `--cov=app --cov-fail-under=85`.
- **DB matrix in CI:** SQLite and PostgreSQL (service container).
- **Contract:** `tests/test_openapi_snapshot.py` compares `app.openapi()` against the committed **`backend/openapi.json`**. That file is the single source for frontend type generation. Update it deliberately with `make openapi` (or `pytest --update-snapshot`).

### 9.1 Bug toggles
- Defect code goes **only** inside `if bugs.is_active(BugId.X):` blocks, placed next to the correct code. Never replace the correct path.
- `is_active` checks the per-request override first (the `X-Bug-Toggles` header, parsed by middleware into a contextvar), then the global state.
- Deterministic only. "Intermittent" defects use a module-level counter that `POST /__bugs__/reset` also clears.
- Each toggle has a test in `tests/bugs/test_<bug_id>.py` asserting both the broken and the correct behaviour.
- The normal test run uses an autouse fixture that asserts every toggle is off, so no defect leaks into the other tests.
- `tests/bugs/test_catalogue_sync.py` fails if `BugId` and `docs/BUG_CATALOGUE.md` list different IDs.

## 10. Logging and observability
- Logs are JSON lines in `prod` and pretty in `dev`. Every log line includes `request_id`, `method`, `path`, `status` and `duration_ms`.
- Log `INFO` for each request, `WARNING` for 4xx business errors, and `ERROR` with stack trace for 5xx.
- `/health` checks DB connectivity with `SELECT 1`.

## 11. Commands (via `uv`, wrapped in the root Makefile)
```bash
uv sync                                   # install
uv run uvicorn app.main:app --reload --port 8100   # dev server (or `make dev-backend`)
uv run alembic upgrade head               # migrate
uv run python -m app.seed --reset         # reseed
uv run pytest -q                          # tests
uv run ruff check . && uv run ruff format --check . && uv run mypy app
uv run python -m app.scripts.export_openapi > openapi.json   # or `make openapi` (also regenerates FE types)
```

## 12. Checklist for adding an endpoint
1. Add or extend the schema in `schemas/`.
2. Add the service function in `services/` with a unit test.
3. Add a thin route in `api/v1/routes/`, with `response_model`, `summary`, `tags` and error `responses`.
4. Add an integration test covering the happy path, validation, not-found and auth cases.
5. Add a migration if the models changed, and update the seed JSON and `SEED_VERSION` if data changed.
6. Update `docs/API_CONTRACT.md`, the OpenAPI snapshot, and regenerate the FE types.
