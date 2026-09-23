# Backend Guidelines — Furniro API

These are the rules, structure and strategies for `backend/`. Read them before writing code.
If a rule blocks you, change the rule here in the same PR and explain why. Do not quietly break it.

Stack: **Python 3.12 · FastAPI · SQLAlchemy 2.0 (sync) · Alembic · Pydantic v2 · pydantic-settings ·
PyJWT · bcrypt · ruff · mypy · uv**

> **No automated tests** are written for this project (PLAN.md D-5). Quality comes from strict typing,
> linting, the OpenAPI contract check and manual verification through Swagger UI (`/docs`).

---

## 1. Directory structure

```
backend/
├── pyproject.toml            # deps + ruff/mypy config (single source)
├── openapi.json              # committed OpenAPI export: contract snapshot + FE type source
├── uv.lock
├── alembic.ini
├── .env.example              # every setting, with safe defaults
├── Dockerfile
├── media/                    # static images served at /media (seeded assets)
├── migrations/               # Alembic env.py (URL + metadata from the app) + versions/
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
│   │   ├── session.py        # engine, sessionmaker, get_db() dependency
│   │   └── migrate.py        # upgrade_to_head(), used by the seed CLI and the startup hook
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
│   ├── scripts/              # export_openapi.py (dev tooling)
│   ├── api/
│   │   ├── deps.py           # get_db, get_current_user, get_optional_user, get_cart_id
│   │   └── v1/
│   │       ├── router.py     # includes every route module under /api/v1
│   │       └── routes/       # products.py, cart.py, orders.py, auth.py, …
│   └── seed/
│       ├── __main__.py       # `python -m app.seed [--reset]`
│       ├── loader.py
│       └── data/             # taxonomy, products, reviews, inspirations, locations (.json); blog/users later
```

## 2. Layering rules (strict)

```
routes (api/v1/routes)  →  services  →  models / Session
     ↑ schemas in/out          ↑ raise AppError         ↑ SQLAlchemy only
```

1. **Routes are thin.** They parse input into schemas, resolve dependencies, call one service function, and return a schema. They contain no queries and no business rules.
2. **Services own the business logic.** They take a `Session` and plain arguments or schemas, and return ORM objects, dataclasses, or response schemas when the result has no ORM equivalent (for example the product comparison table). They **never** import `fastapi` or raise `HTTPException`. They raise `AppError` subclasses.
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
- Error `code`s are `UPPER_SNAKE` constants in `core/errors.py`. They are part of the public contract: clients branch on `code`, never on `message`.

## 5. Configuration and security
- All config lives in `Settings` (`core/config.py`), read from the environment or `.env`. Code never reads `os.environ` directly.
  - Keys: `APP_ENV` (`dev|prod`), `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_MINUTES=1440`, `CORS_ORIGINS`, `MEDIA_DIR`, `SEED_ON_STARTUP`, `LOG_LEVEL`.
  - Currency is fixed in settings as `CURRENCY_CODE=USD`, `CURRENCY_SYMBOL=$`, `CURRENCY_LOCALE=en-US`, and exposed through `/meta/config`.
- `JWT_SECRET` has no default when `APP_ENV=prod`. Startup fails if it is missing.
- Passwords are hashed with bcrypt (cost 12). Never log passwords, tokens or full request bodies from auth routes.
- CORS allows only the origins in `CORS_ORIGINS` (default `http://localhost:5180`).
- There are no test-only or debug routes. Every route in the router is part of the public API.
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
| `reviews` | product_id, author_name, rating, comment (user_id? added in Phase 5) | ck(rating 1..5); uq(product_id, user_id) from Phase 5 |
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
  - Asgaard sofa (SKU `SS001`, 5 reviews, average 4.6) and Outdoor Sofa Set, with the design's spec values for `/compare`. Every product has specs.
  - 10 products on sale, 6 new, 1 out of stock (`cornice`). Reviews are generated by a fixed formula, so the same seed always gives the same data.
  - Blog categories with counts Crafts 2 / Design 8 / Handmade 7 / Interior 1 / Wood 6. The blog therefore has 24 posts, so the counts are true and pagination has 8 pages.
- `SEED_VERSION` constant: bump it whenever seed data changes. `python -m app.seed --reset` restores the baseline at any time, which also gives future testers a known starting state.

## 9. API contract snapshot
- `backend/openapi.json` is the committed export of `app.openapi()` and the single source for frontend type generation.
- After any intentional API change, run `make openapi` (re-exports it and regenerates `frontend/src/api/schema.d.ts`) and commit both files.
- CI runs `make contract`, which fails if either file is stale.

## 10. Logging and observability
- Logs are JSON lines in `prod` and pretty in `dev`. Every log line includes `request_id`, `method`, `path`, `status` and `duration_ms`.
- Log `INFO` for each request, `WARNING` for 4xx business errors, and `ERROR` with stack trace for 5xx.
- `/health` checks DB connectivity with `SELECT 1`.

## 11. Commands (via `uv`, wrapped in the root Makefile)
```bash
uv sync                                   # install
uv run uvicorn app.main:app --reload --port 8100   # dev server (or `make dev-backend`)
uv run alembic upgrade head               # migrate            (make migrate)
uv run python -m app.seed                 # seed if empty      (make seed)
uv run python -m app.seed --reset         # wipe and reseed    (make seed-reset)
uv run ruff check . && uv run ruff format --check . && uv run mypy app
uv run python -m app.scripts.export_openapi > openapi.json   # or `make openapi` (also regenerates FE types)
```

## 12. Checklist for adding an endpoint
1. Add or extend the schema in `schemas/`.
2. Add the service function in `services/`.
3. Add a thin route in `api/v1/routes/`, with `response_model`, `summary`, `tags` and error `responses`.
4. Check it by hand in Swagger UI (`/docs`): the happy path, validation (422 with `details`), not found, and auth (401) where relevant.
5. Add a migration if the models changed, and update the seed JSON and `SEED_VERSION` if data changed.
6. Update `docs/API_CONTRACT.md`, the OpenAPI snapshot, and regenerate the FE types.
