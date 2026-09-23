# Furniro — Master Implementation Plan

> A full-stack furniture e-commerce demo app built from the Furniro Figma UI kit
> (`Furniro_Web_Design_UI_KIT.pdf`). Scope is the **frontend and backend only**. Automated tests are
> out of scope, but the UI carries stable `data-testid`s so tests can be added later.

| Item | Value |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Backend | Python 3.12 + FastAPI + SQLAlchemy 2 + Alembic |
| Database | SQLite (local/dev default) · PostgreSQL 16 (Docker) |
| Design source | `Furniro_Web_Design_UI_KIT.pdf` → screens in `docs/design/screens/` |
| Status | Phase 4 (cart, checkout and orders) complete, 2026-09-23 · next: Phase 5 |

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
3. Make the app **ready for future testing** without shipping any tests: a stable `data-testid` on every interactive element and repeated item (§8), plus normal good backend design that also helps testers (deterministic seed data, machine-readable error codes, `X-Request-Id`, OpenAPI docs).
4. Keep the codebase clean enough to serve as a reference: typed, linted and documented.

### Non-goals
- Real payments. "Direct Bank Transfer" and "Cash on Delivery" only record the chosen method.
- Real email delivery. Contact and newsletter entries are stored in the DB and logged.
- Admin UI. Catalog data comes from seed files. An admin API may come later.
- Production-grade infrastructure such as a CDN, horizontal scaling or payment compliance.
- **Automated tests of any kind** (unit, integration, component, E2E), test hooks/reset endpoints, and deliberate-defect ("bug toggle") features. See D-4 and D-5 in §12.

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
| Syltherine shows `-30%`, but Rp 2.500.000 vs 3.500.000 is a 28.6 % discount | The badge is computed from the prices, so it shows **-29%**. The prices stay as designed. |
| Cart page quantity is a plain number box | Built as the compact `- n +` stepper; each click is one server update and the server's stock limit is shown as a message. |
| Shop list view and share icons are not designed | List view shows the card actions inline under the text (no hover overlay). Share links use letter marks (f, in, X) because Lucide has no brand icons. |
| Free shipping "Order over 150 $" | Informational only. Shipping is always free, so total = subtotal. The text is shown as "Order over $150". |

---

## 3. Feature scope (functional requirements)

IDs are used in PRs and give future test cases something to trace to (for example, `FR-CART-03`).

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
| AD-1 | Monorepo: `backend/`, `frontend/`, `docs/` | One version of the contract, changed in one place. |
| AD-2 | **Contract-first**: FastAPI OpenAPI → `openapi-typescript` → `frontend/src/api/schema.d.ts` | FE types cannot drift from the API, and a CI check fails when they do. |
| AD-3 | Server-side cart keyed by an anonymous UUID | Supports guest carts and merging on login. Totals are computed on the server. |
| AD-4 | Money is stored as **integer minor units** (`price_minor`) | No float errors. Formatting happens only at the UI edge. |
| AD-5 | Sync SQLAlchemy 2.0 + FastAPI `def` endpoints | Simpler to reason about. Load is trivial for a demo. |
| AD-6 | SQLite by default, PostgreSQL in Docker/CI | Zero-setup local runs, with a production-like DB in CI. |
| AD-7 | JWT bearer tokens (access only, 24 h) kept in localStorage | Simple for a demo. The trade-off (XSS exposure vs. httpOnly cookies) is accepted. |
| AD-8 | CSS Modules + CSS custom-property design tokens | Close fidelity to the design, no utility-class soup, and tokens live in one file. |
| AD-9 | Images served by the backend from `/media` | Seed data and images are versioned together. There is no external storage. |

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
- 0–5 reviews per product (80 in total). The Asgaard sofa has exactly 5 (matching the PDP's "5 Customer Review"), with ratings 5, 5, 5, 4, 4 for an average of **4.6**. The design's 4.7 is impossible with five whole-star ratings.
- One product (`cornice`) is out of stock, so the out-of-stock state can be seen.
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

---

## 7. Delivery phases

Each phase ends with a **demoable increment** and must meet the Definition of Done (§9).

### Phase 0: Foundation (≈1 day)
- [x] Own git repo inside `Furniro/` on branch `main`, with `.gitignore` and `.editorconfig`. The 158 MB design PDF is git-ignored because it is over GitHub's 100 MB limit and Git LFS is not installed. The screen renders and extracted assets are committed instead.
- [x] Initial commit (`0507dc0`). A remote (GitHub/GitLab) is still to be added, so CI has not run yet.
- [x] Backend skeleton: uv project (Python 3.12), FastAPI app factory, settings with prod guards, error envelope, request-id middleware and access log, `/api/v1/health` (DB ping), `/media` mount, ruff, mypy `--strict`, and the committed `backend/openapi.json` contract snapshot.
- [x] Frontend skeleton: Vite 8 + React 19 + TS 5.9 (strict), ESLint 10 (type-checked), stylelint (tokens-only rule), Prettier, `@/` alias, dev proxy, `tokens.css` (all DESIGN_SPEC §2 tokens), minimal `apiFetch`/`ApiError`, and a placeholder page showing live API health (with `data-testid`s).
- [x] **Asset extraction script** (`scripts/extract_design_assets.py` + `scripts/design_assets_map.json`): 468 embedded images → 53 unique → **48 WebP assets (3.1 MB)** in `backend/media/`, with transparency kept on product cut-outs. Logo mark redrawn as SVG in `frontend/public/logo-mark.svg`.
- [x] Load fonts: Poppins (400/500/600/700) and Montserrat 700 through Fontsource (self-hosted, Latin subset).
- [x] CI (GitHub Actions): backend lint + types, frontend lint/types/build, and the `make contract` OpenAPI-drift job. It has not run yet because the repo has no remote; the same commands pass locally via `make check`.
- [x] `docker-compose.yml` (postgres + backend + nginx-served frontend) plus both Dockerfiles. Docker is not installed on the dev machine, so both images were built with Podman 3.4, and the backend container was smoke-tested (non-root, `/api/v1/health` 200, WebP media). The full `docker compose up` (with PostgreSQL) is still to be run on a Docker host.
- [x] Root `Makefile` (`make help`) covering dev, lint, format, typecheck, build, check, openapi/contract, assets, and up/down.

**Phase 0 notes (environment decisions):**
- Local dev ports are **API :8100** and **web :5180** (preview :4180), because 8000/8001/5173/5174 are used by other local projects. Override with `make dev API_PORT=… WEB_PORT=…`. Inside Docker the API still listens on 8000; Compose publishes it on 8100 and the SPA on 8080.
- `registry.npmjs.org` fails TLS on the dev network, so `frontend/.npmrc` points npm at `registry.yarnpkg.com`, a public mirror serving identical packages. The lockfile keeps standard npmjs URLs, so CI is unaffected.
- `uv` 0.12 and Python 3.12 are installed per-user (`~/.local/bin`, `~/.local/share/uv`). System Python 3.10 is untouched.

- 2026-09-23: test suites, test tooling (pytest, Vitest, Testing Library), coverage gates and CI test jobs were **removed** at the user's request (D-5). `make check` = lint + types + build + contract.

**Exit criteria:** `make dev` starts both apps. `/api/v1/health` returns 200. The FE shows a placeholder page. CI is green.

### Phase 1: Backend core and catalog (≈2–3 days)
- [x] DB session, base model, Alembic baseline migration (`migrations/versions/…_catalog_baseline.py`), and a startup hook that migrates and seeds an empty database when `SEED_ON_STARTUP=true`.
- [x] Models: category, room, tag, product, product_image, product_spec, review, inspiration.
- [x] Deterministic seed: JSON in `app/seed/data/` (32 products, 80 reviews, 4 inspirations, locations), with `make seed` / `make seed-reset` (`python -m app.seed [--reset]`).
- [x] Catalog endpoints with filtering, sorting and pagination (boundaries handled: page 0 → 422, page beyond the last → empty list, invalid sort → 422, disallowed page size → 422, min > max price → 400).
- [x] `/meta/config` and `/meta/locations`.

**Phase 1 notes:**
- Verified by hand with 35 API checks (every endpoint, filter, sort and boundary) on **SQLite and PostgreSQL 16**, with identical responses. The PostgreSQL ID sequences are moved past the seed IDs after seeding.
- `make contract` now compares freshly generated files with the working tree, so it passes locally before a commit and still fails on drift in CI.
- Reviews have no `user_id` yet; it is added with auth in Phase 5.

**Exit criteria:** Swagger UI at `/docs` lists the catalog API. `GET /products?page=1&page_size=16` returns 16 of 32 items.

### Phase 2: Frontend shell and design system (≈2–3 days)
- [x] `tokens.css` complete (plus `--text-logo`, `--weight-light`, `--color-banner-veil`, layout sizes and z-index layers, all added to DESIGN_SPEC §2 first).
- [x] Layout: `Header` (sticky; active nav; account/search/wishlist/cart icons), mobile menu drawer, search drawer (→ `/shop?q=`), `Footer` (links, help, newsletter form with validation), `PageBanner`, `Breadcrumb` (banner and cream-bar variants), `FeatureStrip`, `AppLayout` (skip link, route progress bar, scroll restoration), `PageShell`, `PageLoader`.
- [x] UI primitives: `Button`/`ButtonLink` (primary / outline-primary / outline-dark / pill / light / link; sm–lg; loading, disabled), `Input`, `Select`, `Textarea`, `Checkbox`, `RadioGroup`, `Badge`, `Rating`, `QuantityStepper`, `Pagination`, `Tabs`, `Drawer`, `Toast`, `Spinner`, `Skeleton`, `EmptyState`, `ErrorState`.
- [x] Router (React Router 8) with every route from GUIDELINES §5 as lazy chunks, placeholder pages that show their real banner/breadcrumb, and a 404 page.
- [x] API client (`apiFetch` with query strings, `ApiError`, `NetworkError`), generated types plus aliases, `queryKeys`, TanStack Query provider, error boundaries.
- [x] `/dev/ui` gallery (development builds only): tokens, type scale, every primitive, overlays, states, and live API status.
- [x] `data-testid` support in every primitive and layout element, plus `src/lib/testIds.ts` helpers for dynamic IDs (frontend/GUIDELINES.md §6).

**Phase 2 notes:**
- Verified in Chromium against the dev servers: all 19 routes render with header, footer, correct `<title>`, one `h1` and a `page-*` root; no duplicate test IDs; no console errors. 32 interactive checks passed, covering search, nav, newsletter validation, drawer focus trap/Esc/backdrop/focus return, toasts, tabs keyboard, stepper limits, pagination links, radio descriptions, and the mobile menu with no horizontal overflow at 390 px.
- Initial JS is 116 KB gzipped (budget 200 KB), and every page is a separate chunk.
- The footer newsletter form validates the email and shows a toast; it is connected to `POST /newsletter/subscribe` in Phase 6. The header cart icon links to `/cart` until the cart drawer arrives in Phase 4.
- React Router is v8, not v7 as first planned. `RouterProvider` comes from `react-router/dom`, and Node ≥ 22.22 is required.
**Exit criteria:** Every route renders with the correct header, banner and footer. The UI gallery matches the design tokens.

### Phase 3: Catalog UI (≈3 days)
- [x] Home: hero (page h1), Browse the Range (rooms from the API), Our Products (8 featured), inspiration slider (Embla; no autoplay), #FuniroFurniture photo wall.
- [x] Shop: toolbar, filter drawer (category, room, price in dollars, on sale, new), grid/list, show-N, sort, pagination, and header search, all synced with the URL. URL keys mirror the API (prices in cents); invalid values fall back to defaults.
- [x] `ProductCard` with badges, strikethrough price, stretched link, and a hover/focus overlay (a top bar on touch screens; inline actions in list view). Share copies the link; Add to cart, Compare and Like show an info toast until Phases 4–5.
- [x] Product detail: gallery, size/colour (first preselected), qty (max = min(10, stock)), low-stock and out-of-stock states, SKU/Category/Tags/Share, tabs (description + images, spec table, reviews with "Load more"), related products with "Show More".
- [x] Loading skeletons, "no products match" (with Clear filters), page-out-of-range, error-with-retry, and a product-not-found page.

**Phase 3 notes:**
- Verified in Chromium against the dev servers with 43 checks (home, shop, filters, search, edge URLs, cards, product page, mobile), twice in a row with no console errors (apart from the browser's own log of the deliberate 404). Found and fixed along the way: description images overflowing on mobile, the gallery image overlapping the info column, "1 results" grammar, and the results text briefly describing the next page before its data arrived (it now comes from the response).
- Header search starts a fresh search (it drops active filters). Changing page scrolls back to the results; filter and sort changes keep the scroll position.
- Initial JS is 75 KB gzipped; Home, Shop and Product chunks are 10, 1 and 5 KB.
**Exit criteria:** You can browse, filter, sort and paginate the whole catalog and open any product.

### Phase 4: Cart, checkout and orders (≈3 days)
- [x] Backend: `carts`, `cart_items`, `orders`, `order_items` (migration `…_cart_and_orders`), cart and order services and endpoints: option validation, per-line cap `min(10, stock)`, line merging, live-price totals; orders validate billing and location, lock and recheck stock, snapshot lines, decrement stock, empty the cart, and number as `FUR-000001`; guest lookup by order number + email.
- [x] FE: cart ID in a persisted session store (`api/session.ts`) sent as `X-Cart-Id` (a stale ID is dropped and a new cart made on the next add), cart hooks, `CartDrawer` (opens on Add to cart and from the header), header count badge, `/cart` page (table, stepper, remove, totals, empty state). Card Add to cart uses the first size/colour; the PDP sends the chosen options and quantity.
- [x] Checkout form (React Hook Form + Zod mirroring the API rules) with dependent country → province selects, payment method with helper text, server field errors mapped onto inputs, stock/empty-cart errors shown in the form, double-submit guard, and redirect to `/cart` when empty.
- [x] Order confirmation page: shows the order handed over by checkout, survives refresh via a tab-scoped email memory, and offers an email lookup form elsewhere.

**Phase 4 notes:**
- Verified: 37 API checks (every cart/order rule and error), 26 browser checks for the full guest journey (cards, PDP, drawer, cart page, reload, checkout validation, order, confirmation, lookup from another browser, stale cart recovery, double-submit guard, mobile), plus re-runs of the Phase 3 suite. All pass from a clean `make seed-reset`.
- Found and fixed: a loading button used `disabled`, which dropped keyboard focus so the drawer could not return it; loading buttons now use `aria-disabled` (GUIDELINES §2.2). The dev server once cached an empty module mid-write; touching the files cleared it (tooling, not the app).
- `ProductSummary` gained `sizes` and `colors` (additive) so cards can add with default options.
- Placing orders really decrements stock, so run `make seed-reset` to return the catalog to its baseline.
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

### Phase 7: Hardening (≈2 days)
- [ ] Responsive pass at 360 / 768 / 1024 / 1440.
- [ ] Accessibility pass: keyboard navigation, focus trap in the drawers, labelled controls, AA contrast.
- [ ] Every page has loading, error and empty states. Network failure shows a retry option.
- [ ] `data-testid` audit: every interactive element and repeated item follows the convention (frontend/GUIDELINES.md §6), and the testid inventory in that section is current.
- [ ] Performance: images lazy-loaded with width/height set, route-level code splitting, Lighthouse ≥ 90 for Performance, A11y and Best Practices.
- [ ] Final README: setup, scripts and demo accounts.

**Exit criteria:** `docker compose up` runs the full stack on PostgreSQL, every screen works at all four widths, and the Lighthouse targets are met.

**Rough total: 15–17 working days for one developer.**

---

## 8. Testability (for future tests)

Writing tests is **out of scope** (D-5). The app only has to make future testing easy:

- **`data-testid` on the UI.** Every interactive element (buttons, links that act like buttons, inputs, selects, forms), every repeated item (with a stable slug or ID qualifier, never an index), and key containers (page roots, drawers, modals, toasts). The naming convention is in [frontend/GUIDELINES.md §6](frontend/GUIDELINES.md). Test IDs are a public contract: once shipped, don't rename them casually.
- **Accessible names and roles** stay correct, so future tests can also use role-based locators.
- Normal backend design that testers benefit from anyway: deterministic seed data (fixed IDs, slugs, timestamps), a machine-readable `code` on every error, an `X-Request-Id` on every response, and OpenAPI docs at `/docs`.
---

## 9. Definition of Done (every task)
- Code follows the relevant GUIDELINES.md, and lint, format, type-check and build pass (CI is green).
- New UI has `data-testid`s following frontend/GUIDELINES.md §6.
- UI work matches the design screen (compared side by side with `docs/design/screens/*`). Any deviation is noted in the PR.
- New or changed endpoints are reflected in `docs/API_CONTRACT.md`, and FE types are regenerated.
- There are no `console.error` messages or unhandled promise rejections in the browser, and no Python warnings in the server log.
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
├── Makefile                    ← dev, lint, typecheck, build, contract, assets shortcuts
├── .github/workflows/ci.yml
├── docs/
│   ├── DESIGN_SPEC.md
│   ├── API_CONTRACT.md
│   ├── adr/                    ← one file per significant decision after kickoff
│   └── design/screens/         ← PNG/JPG renders of each PDF page
├── scripts/
│   └── extract_design_assets.py
├── backend/                    ← see backend/GUIDELINES.md
└── frontend/                   ← see frontend/GUIDELINES.md
```

---

## 11. Risks and mitigations
| Risk | Mitigation |
|---|---|
| The PDF is 158 MB and images are large (up to 4096 px) | One-time extraction script with WebP conversion. Media stays under about 15 MB in total. |
| No automated tests, so regressions can slip through | Strict typing on both sides, the OpenAPI contract check, and a manual walkthrough of the affected screens before each phase sign-off. |
| Undesigned screens drift in style | Build them only from existing tokens and primitives, and review them against the nearest designed screen. |
| FE/BE contract drift | Generated types and a CI drift check (AD-2). |
| SQLite vs PostgreSQL behaviour differences | Avoid DB-specific SQL; migrations must run on both. Run `make up` (PostgreSQL) before each phase sign-off. |

## 12. Resolved decisions
| # | Question | Decision (2026-09-23) |
|---|---|---|
| D-1 | Currency | **USD** (`$2,500.00`, `en-US`). Design prices are rescaled per §2.2. |
| D-2 | Finish level of undesigned pages | **Functional and tidy**: working, built from existing tokens and components, with placeholder copy (§2.1). |
| D-3 | Where the app runs | **Local + Docker Compose**: `make dev` for development, and `docker compose up` for a production-like stack with PostgreSQL. No hosted environment for now. |
| D-4 | Bug toggles for testing practice | ~~Yes, off by default~~ → **Dropped** (2026-09-23). No deliberate-defect feature and no `/__test__` hooks. |
| D-5 | Automated tests | **None.** Build the frontend and backend only; the UI carries `data-testid`s so tests can be added later. Phase 0 test suites and tooling were removed. |

New open questions go here, each with a default, until they are decided.
