# Furniro — API Contract (v1)

This is the human-readable contract. The **source of truth at runtime** is the OpenAPI spec
served at `/api/v1/openapi.json`. When they disagree, fix the code or this doc in the same PR.

- Base URL: `http://localhost:8100/api/v1` in local dev (`make dev`); the SPA calls it same-origin as `/api/v1`
- Content type: `application/json; charset=utf-8`
- Field names are `snake_case` on the wire. The frontend uses the generated types as-is and does not remap to camelCase.
- Time values are ISO-8601 UTC strings, for example `2026-09-23T10:00:00Z`.
- Money is an integer in **minor units, i.e. US cents** (`price_minor: 250000` = $2,500.00). Currency info comes from `GET /meta/config`.

## 1. Conventions

### 1.1 Headers
| Header | Direction | Purpose |
|---|---|---|
| `Authorization: Bearer <jwt>` | request | Authenticated endpoints (🔒) |
| `X-Cart-Id: <uuid>` | request | Identifies an anonymous cart |
| `X-Request-Id` | both | Echoed back, or generated if absent. Include it in bug reports. |

### 1.2 Pagination (list endpoints)
Query: `page` (≥1, default 1), `page_size` (one of 8, 16, 24, 32; default 16; blog default 3).
```json
{ "items": [ ... ], "page": 1, "page_size": 16, "total": 32, "total_pages": 2 }
```
A `page` beyond `total_pages` returns `200` with `items: []`. It is not an error.

### 1.3 Error envelope (every non-2xx response)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [ { "field": "email", "message": "Invalid email address" } ],
    "request_id": "b1f0…"
  }
}
```
| HTTP | `code` examples |
|---|---|
| 400 | `BAD_REQUEST`, `CART_EMPTY`, `COMPARE_LIMIT_EXCEEDED` |
| 401 | `UNAUTHENTICATED`, `INVALID_CREDENTIALS`, `TOKEN_EXPIRED` |
| 403 | `FORBIDDEN` |
| 404 | `NOT_FOUND`, `PRODUCT_NOT_FOUND`, `CART_NOT_FOUND`, `ORDER_NOT_FOUND` |
| 409 | `EMAIL_ALREADY_REGISTERED`, `ALREADY_SUBSCRIBED`, `INSUFFICIENT_STOCK` |
| 422 | `VALIDATION_ERROR` (with `details[]`) |
| 500 | `INTERNAL_ERROR` (no internals leaked) |

## 2. Resources

### 2.1 Meta
`GET /health` → `{ "status": "ok", "version": "0.1.0", "db": "ok" }`

`GET /meta/config`
```json
{ "currency": { "code": "USD", "symbol": "$", "minor_units": 2, "locale": "en-US" },
  "page_size_options": [8, 16, 24, 32], "compare_limit": 3, "free_shipping_threshold_minor": null }
```
`GET /meta/locations` → `[{ "code": "LK", "name": "Sri Lanka", "provinces": [{ "code": "WP", "name": "Western Province" }, …] }, …]`

### 2.2 Auth
| Method | Path | Body | 2xx response |
|---|---|---|---|
| POST | `/auth/register` | `{ email, password, first_name, last_name }` | `201 { access_token, token_type: "bearer", user }` |
| POST | `/auth/login` | `{ email, password }` | `200 { access_token, token_type, user }` |
| GET 🔒 | `/auth/me` | — | `200 User` |

`User = { id, email, first_name, last_name, created_at }`. Password rules: at least 8 characters, with at least 1 letter and 1 digit.

### 2.3 Catalog
`GET /products` query parameters:
| Param | Type | Notes |
|---|---|---|
| `q` | string | Case-insensitive match on name and subtitle |
| `category` | slug, repeatable | `?category=sofas&category=chairs` |
| `room` | slug, repeatable | dining, living, bedroom |
| `min_price`, `max_price` | int (minor) | Inclusive |
| `on_sale`, `is_new`, `featured` | bool | |
| `sort` | enum | `default` (position), `price_asc`, `price_desc`, `newest`, `name_asc` |
| `page`, `page_size` | int | See §1.2 |

→ `Page<ProductSummary>`
```json
ProductSummary = {
  "id": 1, "slug": "syltherine", "name": "Syltherine", "subtitle": "Stylish cafe chair",
  "price_minor": 25000, "compare_at_price_minor": 35000, "discount_percent": 30,
  "is_new": false, "image_url": "/media/products/syltherine-1.webp",
  "rating_avg": 4.5, "review_count": 3, "in_stock": true
}
```
`GET /products/{slug}` → `ProductDetail`: ProductSummary plus `sku`, `description` (paragraphs[]), `short_description`, `images[] {url, alt, kind: gallery|description}`, `sizes[]` (for example `["L","XL","XS"]`), `colors[] {name, hex}`, `stock`, `category {slug,name}`, `room {slug,name}|null`, `tags[]`, and `specs[] {group, label, value}`.

`GET /products/{slug}/related?limit=4&offset=0` → `{ items: ProductSummary[], has_more: bool }`

`GET /products/compare?ids=1,2,3` → `{ products: ProductSummary[], groups: [{ name: "General", rows: [{ label, values: [v1, v2, v3|null] }] }] }`. More than 3 IDs returns `400 COMPARE_LIMIT_EXCEEDED`.

`GET /categories` → `[{ slug, name, product_count }]` · `GET /rooms` → `[{ slug, name, image_url }]`
`GET /inspirations` → `[{ id, index: "01", room: "Bed Room", title: "Inner Peace", image_url, link }]`

### 2.4 Reviews
`GET /products/{slug}/reviews?page=` → `Page<{ id, author_name, rating, comment, created_at }>`
`POST /products/{slug}/reviews` 🔒 `{ rating: 1..5, comment: 10..1000 chars }` → `201 Review`. One review per user per product, otherwise `409 ALREADY_REVIEWED`.

### 2.5 Cart
| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/cart` | — | `201 Cart` (new anonymous cart, returns `id`) |
| GET | `/cart` | — | `200 Cart` |
| POST | `/cart/items` | `{ product_id, quantity, size?, color? }` | `200 Cart` |
| PATCH | `/cart/items/{item_id}` | `{ quantity }` (1..10) | `200 Cart` |
| DELETE | `/cart/items/{item_id}` | — | `200 Cart` |
| DELETE | `/cart` | — | `200 Cart` (emptied) |
| POST 🔒 | `/cart/merge` | — | `200 Cart` (moves the `X-Cart-Id` items into the user's cart) |

Cart resolution: if a token is present, use the user's cart. Otherwise use `X-Cart-Id`. If neither is present, return `404 CART_NOT_FOUND` (except for `POST /cart`).
```json
Cart = {
  "id": "5e0c…", "items": [
    { "id": 11, "product": ProductSummary, "quantity": 1, "size": "L", "color": "Black",
      "unit_price_minor": 250000, "line_total_minor": 250000 }
  ],
  "item_count": 1, "subtotal_minor": 250000, "total_minor": 250000
}
```
Rules:
- The same `(product_id, size, color)` merges into one line, adding the quantities.
- The quantity cap is `min(10, stock)`. Going over it returns `409 INSUFFICIENT_STOCK`.
- `size` and `color` are required when the product defines them, and must be among the allowed values (otherwise 422).

### 2.6 Orders
`POST /orders` (token optional, `X-Cart-Id` required for guests)
```json
{ "billing": { "first_name": "", "last_name": "", "company": null, "country": "LK",
    "street": "", "city": "", "province": "WP", "zip": "", "phone": "", "email": "",
    "notes": null },
  "payment_method": "bank_transfer" | "cod" }
```
→ `201 Order`. It uses the cart as it stands, snapshots names and prices, decrements stock, and empties the cart. An empty cart returns `400 CART_EMPTY`.

`Order = { order_number: "FUR-000123", status: "pending", payment_method, billing, items[] {product_name, size, color, quantity, unit_price_minor, line_total_minor}, subtotal_minor, total_minor, created_at }`

`GET /orders/{order_number}?email=` → Order. The owner may use a token. A guest must pass the matching `email`, otherwise `404`.
`GET /orders` 🔒 → `Page<OrderSummary>`, newest first.

### 2.7 Wishlist 🔒
`GET /wishlist` → `ProductSummary[]` · `PUT /wishlist/{product_id}` → `204` (idempotent) · `DELETE /wishlist/{product_id}` → `204` (idempotent).

### 2.8 Blog
`GET /blog/posts?page=&page_size=3&category=&q=` → `Page<{ slug, title, excerpt, cover_url, author, category {slug,name}, published_at }>`
`GET /blog/posts/{slug}` → the post plus `content` (markdown).
`GET /blog/categories` → `[{ slug, name, post_count }]` · `GET /blog/posts/recent?limit=5`

### 2.9 Forms
`POST /contact` `{ name (2..80), email, subject? (≤120), message (10..2000) }` → `201 { id, received_at }`
`POST /newsletter/subscribe` `{ email }` → `201 { email, subscribed_at }`. A duplicate returns `409 ALREADY_SUBSCRIBED`.

## 3. Changelog
| Date | Change |
|---|---|
| 2026-09-23 | Initial contract drafted from the design |
| 2026-09-23 | Currency set to USD |
| 2026-09-23 | Removed test-support (`/__test__/*`) and bug-toggle (`/__bugs__/*`) endpoints; tests are out of scope |
