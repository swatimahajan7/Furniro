# Furniro — Master Implementation Plan

> A full-stack furniture e-commerce demo app built from the Furniro Figma UI kit
> (`Furniro_Web_Design_UI_KIT.pdf`). It is built to be a **stable, testable target**
> for manual, API and UI test automation.

| Item | Value |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Backend | Python 3.12 + FastAPI + SQLAlchemy 2 + Alembic |
| Database | SQLite (local/dev default) · PostgreSQL 16 (Docker / CI) |
| E2E | Playwright (repo-level `e2e/`) |
| Design source | `Furniro_Web_Design_UI_KIT.pdf` → screens in `docs/design/screens/` |
| Status | Phase 0 (foundation) complete, 2026-09-23 · next: Phase 1 |

Related docs:
- [docs/DESIGN_SPEC.md](docs/DESIGN_SPEC.md): design tokens and a screen-by-screen UI spec
- [docs/API_CONTRACT.md](docs/API_CONTRACT.md): REST contract shared by both sides
- [backend/GUIDELINES.md](backend/GUIDELINES.md): backend rules, structure and strategies
- [frontend/GUIDELINES.md](frontend/GUIDELINES.md): frontend rules, structure and strategies

---

## 1. Goals and non-goals

### Goals
1. Build all **9 designed screens** closely to the design at 1440 px desktop, and make them responsive down to 360 px.
2. Make the flows real, with no dead buttons: browse → filter/sort → product → cart → checkout → order, plus compare, wishlist, blog, contact and newsletter.
3. Build a **test-friendly app**:
   - deterministic seed data
   - a reset endpoint
   - stable `data-testid`s
   - predictable error format
   - an OpenAPI spec
4. Keep the codebase clean enough to serve as a reference: typed, linted, tested and documented.

### Non-goals
- Real payments. "Direct Bank Transfer" and "Cash on Delivery" only record the chosen method.
- Real email delivery. Contact and newsletter entries are stored in the DB and logged.
- Admin UI. Catalog data comes from seed files. An admin API may come later.
- Production-grade infrastructure such as a CDN, horizontal scaling or payment compliance.

---

## 2. Design inventory (what the PDF contains)

| # | Screen | Route | Notes |
|---|---|---|---|
| 1 | Home | `/` | Hero, Browse the Range (Dining/Living/Bedroom), Our Products (8), 50+ Rooms Inspiration slider, #FuniroFurniture gallery |
| 2 | Shop | `/shop` | Banner, filter bar (Filter · grid/list · "Showing 1–16 of 32" · Show N · Sort by), 4×4 grid, pagination, feature strip |
| 3 | Single Product | `/product/:slug` | Breadcrumb, 4 thumbnails + main image, rating, size, colour, qty, Add To Cart, + Compare, meta (SKU/Category/Tags/Share), tabs (Description/Additional Info/Reviews), Related Products |
| 4 | Product + Cart Drawer | overlay | Right-side "Shopping Cart" drawer: items, remove, subtotal, [Cart] [Checkout] [Comparison] |
| 5 | Product Comparison | `/compare` | Up to 3 products, spec groups General/Product/Dimensions/Warranty, "Add A Product" dropdown, Add To Cart per column |
| 6 | Cart | `/cart` | Table (Product/Price/Quantity/Subtotal/delete), Cart Totals, Check Out |
| 7 | Checkout | `/checkout` | Billing form (11 fields), order summary, payment method radios, Place order |
| 8 | Contact | `/contact` | Address/Phone/Working time, form (name, email, subject, message) |
| 9 | Blog | `/blog` | Post list (3/page), search, categories with counts, recent posts, pagination |

Shared across pages: **Header** (logo, nav, account/search/wishlist/cart icons), **Page banner** (blurred image + title + breadcrumb), **Feature strip** (High Quality / Warranty / Free Shipping / 24×7 Support), **Footer** (address, links, help, newsletter).

### 2.1 Screens that are implied but not designed
Level of finish: **functional and tidy**. These screens fully work and are built only from existing tokens and components (page banner, cards, form fields, feature strip). They use short placeholder copy and no new visual patterns.

| Screen | Route | Why it is needed |
|---|---|---|
| About | `/about` | It is in the main nav |
| Login / Register | `/login`, `/register` | Account icon in the header |
| Account (my orders) | `/account` | After login |
| Wishlist | `/wishlist` | Heart icon in the header and "Like" on cards |
| Search | header overlay → `/shop?q=` | Search icon in the header |
| Order confirmation | `/order/:orderNumber` | After "Place order" |
| Blog post | `/blog/:slug` | "Read more" |
| Shop filter panel | drawer on `/shop` | The "Filter" button has no designed panel |
| Shop list view | `/shop?view=list` | The list-view toggle has no design |
| 404 / error | `*` | Robustness |
| Footer help pages | `/help/payment-options`, `/help/returns`, `/help/privacy-policy` | Footer links |

### 2.2 Design inconsistencies and the decision for each
These are the defaults we will use. Change them here if you want something different.

| Issue in design | Decision |
|---|---|
| Currency shown as both `Rp 2.500.000` (cards) and `Rs. 250,000.00` (product/cart/checkout) | **USD everywhere**, formatted `$2,500.00` (`en-US`). Design prices are rescaled, keeping their ratios: **Rp ÷ 10,000** (Syltherine Rp 2.500.000 → $250.00) and **Rs. ÷ 100** (Asgaard sofa Rs. 250,000.00 → $2,500.00). Prices are stored as integer cents, and one `formatPrice()` sets the display. Currency info comes from `GET /meta/config`. |
| Brand spelt "Furniro" (header), "Funiro." (footer), "#FuniroFurniture", "furino" (copyright) | Header and footer use **Furniro**. The hashtag stays as designed. |
| Typos: "Short by", "reverved", "65 GK", "Ser icev" | Fix them: "Sort by", "reserved", "65 KG". |
| Product description copy is about a speaker ("Kilburn") | Seed data uses realistic furniture copy. |
| Checkout lists "Direct Bank Transfer" twice | Two options: **Direct Bank Transfer** and **Cash On Delivery**. The helper text appears under the selected option. |
| Muggo ("Small mug"), Pingky ("Cute bed set") and Potty ("Minimalist flower pot") cards show unrelated sofa photos | Use the matching mug, bedding and vase photos that are also in the PDF. The design's sofa photos become extra catalog products (`grey-sectional`, `nordic-sofa-set`, `cognac-leather-sofa`). |
| Home "Show More" vs Related "Show More" | Home goes to `/shop`. Related loads 4 more related items in place. |
| Free shipping "Order over 150 $" | Informational only. Shipping is always free, so total = subtotal. The text is shown as "Order over $150". |

---

## 3. Feature scope (functional requirements)

IDs are used in tests and PRs (for example, `FR-CART-03`).

### Catalog
- **FR-CAT-01**: List products with pagination. Page size options are 8/16/24/32 (default 16). The "Showing X–Y of Z results" text must be accurate.
- **FR-CAT-02**: Sort by Default, Price low→high, Price high→low, Newest, Name A→Z.
- **FR-CAT-03**: Filter by category, room (Dining/Living/Bedroom), price range, "On sale", "New", and keyword `q`.
- **FR-CAT-04**: Grid and list view toggle.
- **FR-CAT-05**: Product cards show a badge: `-X%` (red) when on sale, `New` (teal) when new, and neither otherwise. On sale, the old price is struck through.
- **FR-CAT-06**: Card hover overlay with "Add to cart", "Share" (copy link and show a toast), "Compare" and "Like" (wishlist).
- **FR-CAT-07**: Filters, sort, page, page size and view live in the URL query string, so any state can be deep-linked.

### Product detail
- **FR-PDP-01**: Gallery: clicking a thumbnail swaps the main image.
- **FR-PDP-02**: Size and colour selection is required before Add To Cart when the product has options. The first option is preselected.
- **FR-PDP-03**: Quantity stepper, min 1, max = stock (capped at 10).
- **FR-PDP-04**: Tabs: Description / Additional Information (spec table) / Reviews [N], with a list and a form. Posting a review requires login.
- **FR-PDP-05**: Share to Facebook, LinkedIn and Twitter/X through share links.
- **FR-PDP-06**: Related products (same category, excluding the current product), 4 at a time, with "Show More".
- **FR-PDP-07**: Add To Cart opens the cart drawer.

### Cart
- **FR-CART-01**: Server-side cart identified by an anonymous `cart_id`, kept in localStorage and sent as the `X-Cart-Id` header. It is attached to the user on login.
- **FR-CART-02**: Add, update quantity and remove items. The same product + size + colour merges into one line.
- **FR-CART-03**: The cart drawer and the cart page show live subtotals and totals, computed on the server.
- **FR-CART-04**: The header cart icon shows an item-count badge.
- **FR-CART-05**: Empty-cart state with a "Continue shopping" CTA.

### Checkout and orders
- **FR-CHK-01**: Billing form with validation on both client and server. Required: first name, last name, country, street, city, province, ZIP, phone, email. Optional: company, additional info.
- **FR-CHK-02**: Country and Province dropdowns come from `GET /meta/locations`. Provinces depend on the selected country.
- **FR-CHK-03**: Payment method: bank transfer or COD.
- **FR-CHK-04**: Place order creates an order with price and name snapshots, empties the cart, and redirects to `/order/:orderNumber`.
- **FR-CHK-05**: Guest checkout is allowed. When logged in, the order links to the user and the form is prefilled.
- **FR-CHK-06**: Checking out with an empty cart is blocked, and the user is redirected to `/cart`.

### Compare
- **FR-CMP-01**: Compare up to **3** products. The list is kept client-side and persists across reloads.
- **FR-CMP-02**: The comparison table is grouped by General/Product/Dimensions/Warranty, and missing values show as "—".
- **FR-CMP-03**: The "Add A Product" dropdown lists products not yet compared. Removing a product is also supported.

### Wishlist and auth
- **FR-AUTH-01**: Register, log in and log out with a JWT bearer token.
- **FR-AUTH-02**: `/account` shows the profile and order history.
- **FR-WISH-01**: The wishlist requires login. A guest who clicks Like is sent to login and returned afterwards.

### Content
- **FR-BLOG-01**: Blog list with 3 posts per page, category filter with counts, search, recent posts (5), and a post detail page.
- **FR-CON-01**: Contact form: name, email and message are required, subject is optional. It stores the message and shows a success message.
- **FR-NEWS-01**: Newsletter subscribe from the footer. It validates the email, and a duplicate email is handled gracefully.
- **FR-HOME-01**: The home page's "Our Products" shows 8 featured products. The inspiration slider comes from the API.

---

## 4. Architecture

```
┌─────────────────────────────┐        HTTP/JSON (REST, /api/v1)      ┌──────────────────────────────┐
│ frontend (React + Vite)     │ ────────────────────────────────────▶ │ backend (FastAPI)            │
│  • React Router (routes)    │   Authorization: Bearer <jwt>         │  • api/ (routers, thin)      │
│  • TanStack Query (server   │   X-Cart-Id: <uuid>                   │  • services/ (business rules)│
│    state + caching)         │ ◀──────────────────────────────────── │  • models/ (SQLAlchemy ORM)  │
│  • Zustand (UI/local state) │   JSON + {"error":{...}} envelopes    │  • schemas/ (Pydantic I/O)   │
│  • Types generated from     │                                       │  • Alembic migrations        │
│    backend OpenAPI          │   /media/* (static product images)    │  • seed/ (deterministic data)│
└─────────────────────────────┘                                       └──────────────┬───────────────┘
                                                                                     │
                                                                          SQLite (dev) / PostgreSQL
```

Key architectural decisions (ADR-lite):

| # | Decision | Rationale |
|---|---|---|
| AD-1 | Monorepo: `backend/`, `frontend/`, `e2e/`, `docs/` | One version of the contract. E2E tests span both sides. |
| AD-2 | **Contract-first**: FastAPI OpenAPI → `openapi-typescript` → `frontend/src/api/schema.d.ts` | FE types cannot drift from the API, and a CI check fails when they do. |
| AD-3 | Server-side cart keyed by an anonymous UUID | Gives realistic API test scenarios (guest cart, merge on login). Totals are computed on the server. |
| AD-4 | Money is stored as **integer minor units** (`price_minor`) | No float errors. Formatting happens only at the UI edge. |
| AD-5 | Sync SQLAlchemy 2.0 + FastAPI `def` endpoints | Simpler to reason about and test. Load is trivial for a demo. |
| AD-6 | SQLite by default, PostgreSQL in Docker/CI | Zero-setup local runs, with a production-like DB in CI. |
| AD-7 | JWT bearer tokens (access only, 24 h) kept in localStorage | Simple for a demo and for test tooling. The trade-off is documented. |
| AD-8 | CSS Modules + CSS custom-property design tokens | Close fidelity to the design, no utility-class soup, and tokens live in one file. |
| AD-9 | Test hooks exist only when `APP_ENV=test` | Reset and seed endpoints are never available outside test runs. |
| AD-10 | Images served by the backend from `/media` | Seed data and images are versioned together. There is no external storage. |

---

## 5. Data model (summary)

Column details live in [backend/GUIDELINES.md §6](backend/GUIDELINES.md#6-data-model).

```
users ─┬─< carts ──< cart_items >── products ──< product_images
       ├─< orders ──< order_items            ├──< product_specs   (group, label, value, position)
       ├─< wishlist_items >── products        ├──< reviews
       └─< reviews                            ├─── categories      (Sofas, Chairs, Tables, …)
                                              ├─── rooms           (Dining, Living, Bedroom)
                                              └──< product_tags >── tags
blog_categories ──< blog_posts
inspirations            (home slider rooms)
contact_messages · newsletter_subscribers
```

Seed dataset (deterministic, in `backend/app/seed/data/*.json`):
- **32 products**, so the "Showing 1–16 of 32" and 2-page shop match the design. Page 3 appears when the page size is 8.
- 6 categories and 3 rooms.
- Every product has 1–4 images and a full spec set for comparison.
- 0–5 reviews per product. The Asgaard sofa has exactly 5, with an average rating of 4.7.
- 24 blog posts across 5 categories, matching the design's sidebar counts (Crafts 2, Design 8, Handmade 7, Interior 1, Wood 6).
- 4 inspiration rooms.
- 2 users: `demo@furniro.test` / `Demo@1234` and `empty@furniro.test` / `Demo@1234` (no orders).

---

## 6. API surface (summary)

The full request and response shapes are in [docs/API_CONTRACT.md](docs/API_CONTRACT.md). All routes are under `/api/v1`.

| Area | Endpoints |
|---|---|
| Health/meta | `GET /health` · `GET /meta/config` · `GET /meta/locations` |
| Auth | `POST /auth/register` · `POST /auth/login` · `GET /auth/me` |
| Catalog | `GET /products` · `GET /products/{slug}` · `GET /products/{slug}/related` · `GET /products/compare?ids=` · `GET /categories` · `GET /rooms` · `GET /inspirations` |
| Reviews | `GET /products/{slug}/reviews` · `POST /products/{slug}/reviews` 🔒 |
| Cart | `POST /cart` · `GET /cart` · `POST /cart/items` · `PATCH /cart/items/{id}` · `DELETE /cart/items/{id}` · `DELETE /cart` · `POST /cart/merge` 🔒 |
| Orders | `POST /orders` · `GET /orders/{order_number}` · `GET /orders` 🔒 |
| Wishlist | `GET /wishlist` 🔒 · `PUT /wishlist/{product_id}` 🔒 · `DELETE /wishlist/{product_id}` 🔒 |
| Blog | `GET /blog/posts` · `GET /blog/posts/{slug}` · `GET /blog/categories` · `GET /blog/posts/recent` |
| Forms | `POST /contact` · `POST /newsletter/subscribe` |
| Test only | `POST /__test__/reset` · `POST /__test__/seed/{scenario}` (only when `APP_ENV=test`) |
| Bug toggles | `GET /__bugs__` · `PUT /__bugs__/{id}` · `DELETE /__bugs__/{id}` · `POST /__bugs__/reset` (only when `BUG_TOGGLES_ENABLED=true`) |

---

## 7. Delivery phases

Each phase ends with a **demoable increment** and must meet the Definition of Done (§9).

### Phase 0: Foundation (≈1 day)
- [x] Own git repo inside `Furniro/` on branch `main`, with `.gitignore` and `.editorconfig`. The 158 MB design PDF is git-ignored because it is over GitHub's 100 MB limit and Git LFS is not installed. The screen renders and extracted assets are committed instead.
- [ ] Initial commit, and optionally a remote (GitHub/GitLab).
- [x] Backend skeleton: uv project (Python 3.12), FastAPI app factory, settings with prod guards, error envelope, request-id middleware and access log, `/api/v1/health` (DB ping), `/media` mount, ruff, mypy `--strict`, pytest with an 85 % coverage gate, and the OpenAPI snapshot test.
- [x] Frontend skeleton: Vite 8 + React 19 + TS 5.9 (strict), ESLint 10 (type-checked), stylelint (tokens-only rule), Prettier, Vitest 5 + Testing Library with a coverage gate, `@/` alias, dev proxy, `tokens.css` (all DESIGN_SPEC §2 tokens), minimal `apiFetch`/`ApiError`, and a placeholder page showing live API health.
- [x] **Asset extraction script** (`scripts/extract_design_assets.py` + `scripts/design_assets_map.json`): 468 embedded images → 53 unique → **48 WebP assets (3.1 MB)** in `backend/media/`, with transparency kept on product cut-outs. Logo mark redrawn as SVG in `frontend/public/logo-mark.svg`.
- [x] Load fonts: Poppins (400/500/600/700) and Montserrat 700 through Fontsource (self-hosted, Latin subset).
- [x] CI (GitHub Actions): backend on SQLite and PostgreSQL, frontend lint/type/test/build, and the `make contract` OpenAPI-drift job. It has not run yet because the repo has no remote; the same commands pass locally via `make check`.
- [x] `docker-compose.yml` (postgres + backend + nginx-served frontend) plus both Dockerfiles. Docker is not installed on the dev machine, so both images were built with Podman 3.4, and the backend container was smoke-tested (non-root, `/api/v1/health` 200, WebP media). The full `docker compose up` (with PostgreSQL) is still to be run on a Docker host.
- [x] Root `Makefile` (`make help`) covering dev, lint, format, typecheck, test, check, openapi/contract, assets, and up/up-training/down.

**Phase 0 notes (environment decisions):**
- Local dev ports are **API :8100** and **web :5180** (preview :4180), because 8000/8001/5173/5174 are used by other local projects. Override with `make dev API_PORT=… WEB_PORT=…`. Inside Docker the API still listens on 8000; Compose publishes it on 8100 and the SPA on 8080.
- `registry.npmjs.org` fails TLS on the dev network, so `frontend/.npmrc` points npm at `registry.yarnpkg.com`, a public mirror serving identical packages. The lockfile keeps standard npmjs URLs, so CI is unaffected.
- `uv` 0.12 and Python 3.12 are installed per-user (`~/.local/bin`, `~/.local/share/uv`). System Python 3.10 is untouched.

**Exit criteria:** `make dev` starts both apps. `/api/v1/health` returns 200. The FE shows a placeholder page. CI is green.

### Phase 1: Backend core and catalog (≈2–3 days)
- [ ] DB session, base model, Alembic baseline migration.
- [ ] Models: category, room, tag, product, product_image, product_spec, review, inspiration.
- [ ] Deterministic seed command: `python -m app.seed --reset`.
- [ ] Catalog endpoints with filtering, sorting and pagination, plus the error envelope and request-id middleware.
- [ ] `/media` static mount, and `/meta/config` and `/meta/locations`.
- [ ] Integration tests for every catalog endpoint, including boundaries (page 0, page beyond the last page, invalid sort).

**Exit criteria:** Swagger UI at `/docs` lists the catalog API. `GET /products?page=1&page_size=16` returns 16 of 32 items.

### Phase 2: Frontend shell and design system (≈2–3 days)
- [ ] `tokens.css` (colours, type, spacing, radius, shadows) from DESIGN_SPEC §2.
- [ ] Layout: `Header`, `Footer`, `PageBanner`, `FeatureStrip`, `Breadcrumb`, and a mobile nav drawer.
- [ ] UI primitives: `Button` (primary / outline-primary / outline-dark / pill), `Input`, `Select`, `Textarea`, `Radio`, `Badge`, `Rating`, `QuantityStepper`, `Pagination`, `Tabs`, `Drawer`, `Toast`, `Spinner`, `Skeleton`, `EmptyState`.
- [ ] Router with all routes (placeholder pages) and 404.
- [ ] API client, generated types, TanStack Query provider, error boundary.
- [ ] `/dev/ui` route, dev builds only: a gallery of every primitive, used as a visual reference.

**Exit criteria:** Every route renders with the correct header, banner and footer. The UI gallery matches the design tokens.

### Phase 3: Catalog UI (≈3 days)
- [ ] Home: hero, Browse the Range, Our Products (8), inspiration slider (Embla), gallery grid.
- [ ] Shop: toolbar, filter drawer, grid/list, show-N, sort, pagination, all synced with the URL.
- [ ] `ProductCard` with badges and hover overlay (Share, Compare, Like are wired as stubs until Phase 5).
- [ ] Product detail: gallery, options, qty, tabs, reviews list, related products with "Show More".
- [ ] Loading skeletons, empty results, and a not-found product page.

**Exit criteria:** You can browse, filter, sort and paginate the whole catalog and open any product.

### Phase 4: Cart, checkout and orders (≈3 days)
- [ ] Backend: cart, cart_item, order and order_item models, services and endpoints, with stock checks and price snapshots.
- [ ] FE: cart store (cart id), cart query hooks, `CartDrawer`, `/cart` page, header badge.
- [ ] Checkout form (React Hook Form + Zod) with dependent country/province selects and the payment method.
- [ ] Order confirmation page.
- [ ] Integration tests covering add/merge/update/remove and each checkout validation error.

**Exit criteria:** The full guest purchase flow works end to end, and the cart is empty afterwards.

### Phase 5: Auth, wishlist and compare (≈2 days)
- [ ] Backend: users, password hashing, JWT, `/auth/*`, wishlist, cart merge on login, `GET /orders` for the user, posting reviews.
- [ ] FE: login and register pages, auth store, protected routes with return-to redirect, `/account`, `/wishlist`, Like on cards and the PDP, review form.
- [ ] Compare: Zustand-persisted compare list (max 3), `/compare` page, "Add A Product" dropdown, and the Comparison button in the drawer.

**Exit criteria:** Log in → like → wishlist page; compare 3 products; guest cart merged after login.

### Phase 6: Content pages (≈1.5 days)
- [ ] Backend: blog models, endpoints and seed; contact; newsletter.
- [ ] FE: blog list with sidebar (search, categories, recent posts), blog post page, contact page, footer newsletter, About page, help pages.

**Exit criteria:** Every nav and footer link leads to a working page. The forms submit and show success and error states.

### Phase 7: Hardening and test readiness (≈2–3 days)
- [ ] Responsive pass at 360 / 768 / 1024 / 1440.
- [ ] Accessibility pass: axe with zero serious violations, keyboard navigation, focus trap in the drawers.
- [ ] Every page has loading, error and empty states. Network failure shows a retry option.
- [ ] Test hooks: `/__test__/reset` and seed scenarios (`empty-cart`, `cart-with-2-items`, `out-of-stock-item`, `user-with-orders`).
- [ ] **Bug toggles** (≈2 days): flag service, `/__bugs__` API, hidden FE panel, and the defect catalogue in [docs/BUG_CATALOGUE.md](docs/BUG_CATALOGUE.md), with one test per toggle proving that it breaks the behaviour and that turning it off restores it. See §13.
- [ ] Playwright suite: smoke tests and critical-path journeys (§8.3), with page objects.
- [ ] Performance: images lazy-loaded with width/height set, route-level code splitting, Lighthouse ≥ 90 for Performance, A11y and Best Practices.
- [ ] Final README: setup, scripts, test accounts, and the test-hook reference.

**Exit criteria:** The E2E suite passes in CI against Docker Compose (PostgreSQL), and the Lighthouse targets are met.

**Rough total: 19–22 working days for one developer** (including bug toggles).

---

## 8. Testing strategy

### 8.1 Pyramid
| Level | Backend | Frontend |
|---|---|---|
| Unit | pytest: services, pricing, validators (no HTTP) | Vitest: utils (`formatPrice`), hooks, stores |
| Integration / component | pytest + `TestClient` against a real SQLite/PG DB, per-test transaction rollback | Vitest + Testing Library + MSW (mocked API) |
| Contract | OpenAPI snapshot test and FE type-generation drift check | Same (CI job) |
| E2E | — | Playwright against the real stack (`e2e/`) |

### 8.2 Coverage targets
- Backend: ≥ 85 % line coverage (services ≥ 95 %).
- Frontend: ≥ 75 % on `features/` and `lib/`. UI primitives are covered by component tests.

### 8.3 Critical E2E journeys (must stay green)
1. Guest: home → shop → sort by price → product → pick size and colour → add to cart → drawer → checkout → place order → confirmation.
2. Cart: update quantity and remove item on `/cart`, and the totals recalculate.
3. Checkout validation: empty submit shows every required-field error. An invalid email and invalid phone each show their own error.
4. Auth: register → log in → like 2 products → wishlist shows 2 → log out.
5. Guest cart merge: add items as a guest → log in → the items persist.
6. Compare: add 3 products → a 4th is blocked with a message → remove one → add another.
7. Blog: filter by category → paginate → open post.
8. Contact and newsletter: success paths and duplicate subscription.

### 8.4 Testability features built into the app
- A stable `data-testid` on every interactive element and repeated item (convention in the FE guidelines).
- Deterministic seed data, with fixed IDs, slugs and timestamps.
- `POST /__test__/reset` gives each test a clean state. Seed scenarios give specific fixtures.
- `?e2e=1` query flag or the `VITE_DISABLE_ANIMATIONS` env var turns off transitions and carousel autoplay.
- Every error response carries a machine-readable `code`, and every response has an `X-Request-Id` header.
- OpenAPI docs at `/docs` for API testing (Postman/pytest/REST Assured).
- **Bug toggles**: switchable, deterministic defects for training and for checking that a test suite catches them (§13).

---

## 9. Definition of Done (every task)
- Code follows the relevant GUIDELINES.md, and lint, format and type-check pass.
- Tests are added or updated at the right level, and CI is green.
- UI work matches the design screen (compared side by side with `docs/design/screens/*`). Any deviation is noted in the PR.
- New or changed endpoints are reflected in `docs/API_CONTRACT.md`, and FE types are regenerated.
- There are no `console.error`, unhandled promise rejections or Python warnings in the test output.
- Docs are updated when rules, structure or decisions change.

---

## 10. Repository layout (target)

```
Furniro/
├── PLAN.md                     ← this file
├── README.md                   ← quickstart
├── CLAUDE.md                   ← AI-assistant entry point (imports guidelines)
├── Furniro_Web_Design_UI_KIT.pdf
├── docker-compose.yml
├── Makefile                    ← dev, test, lint, seed, e2e shortcuts
├── .github/workflows/ci.yml
├── docs/
│   ├── DESIGN_SPEC.md
│   ├── API_CONTRACT.md
│   ├── adr/                    ← one file per significant decision after kickoff
│   └── design/screens/         ← PNG/JPG renders of each PDF page
├── scripts/
│   └── extract_design_assets.py
├── backend/                    ← see backend/GUIDELINES.md
├── frontend/                   ← see frontend/GUIDELINES.md
└── e2e/                        ← Playwright specs + page objects
```

---

## 11. Risks and mitigations
| Risk | Mitigation |
|---|---|
| The PDF is 158 MB and images are large (up to 4096 px) | One-time extraction script with WebP conversion. Media stays under about 15 MB in total. |
| Undesigned screens drift in style | Build them only from existing tokens and primitives, and review them against the nearest designed screen. |
| FE/BE contract drift | Generated types and a CI drift check (AD-2). |
| Flaky E2E tests from animations or data | Reset endpoint, deterministic seed, animation kill-switch, role/testid locators, no fixed sleeps. |
| SQLite vs PostgreSQL behaviour differences | CI runs the backend tests on PostgreSQL. Avoid DB-specific SQL. |
| Bug-toggle code leaks into normal behaviour | All defect code sits behind one `bugs.is_active()` check, is off by default, and cannot be enabled when `APP_ENV=prod`. CI runs the full suite with every toggle off. |

## 12. Resolved decisions
| # | Question | Decision (2026-09-23) |
|---|---|---|
| D-1 | Currency | **USD** (`$2,500.00`, `en-US`). Design prices are rescaled per §2.2. |
| D-2 | Finish level of undesigned pages | **Functional and tidy**: working, built from existing tokens and components, with placeholder copy (§2.1). |
| D-3 | Where the app runs | **Local + Docker Compose**: `make dev` for development, and `docker compose up` for a production-like stack with PostgreSQL. No hosted environment for now. |
| D-4 | Bug toggles for testing practice | **Yes, off by default**. See §13 and [docs/BUG_CATALOGUE.md](docs/BUG_CATALOGUE.md). |

New open questions go here, each with a default, until they are decided.

## 13. Bug toggles (deliberate, switchable defects)

**Purpose:** give testers known defects to find, and let trainers check whether a test suite catches regressions. The correct app is always the default.

**Rules:**
- Setting `BUG_TOGGLES_ENABLED` defaults to `false`. Startup **fails** if it is `true` while `APP_ENV=prod`. Docker Compose ships a `training` profile that turns it on.
- Each toggle has a stable ID (for example `BUG-CART-TOTAL`), a layer (API or UI), a short symptom, and the FR-ID it breaks.
- Scope of activation:
  - **Global:** `PUT /__bugs__/{id}` changes the state for all clients. It is kept in memory and resets on restart.
  - **Per request:** the `X-Bug-Toggles: BUG-A,BUG-B` header overrides global state for that request only, so parallel tests don't interfere.
  - The FE reads the active UI toggles from `GET /meta/config` (`active_bugs`). A hidden panel at `/__bugs` (not linked anywhere) switches toggles when the feature is enabled.
- Defects are **deterministic**. An "intermittent" bug fails on every Nth call using a counter, never `random`, so failures are reproducible.
- Backend defect code sits only behind `bugs.is_active(BugId.X)` in services, and FE code only behind `useBug('BUG-…')`. A lint check keeps the IDs in the catalogue and the code in sync.
- Every toggle has a regression test that turns it on, asserts the broken behaviour, turns it off, and asserts correct behaviour.
- **Answer key:** `docs/BUG_CATALOGUE.md` lists what each toggle breaks. If testers will have repo access during an exercise, give them a build without that file, or keep the catalogue in a private location.
