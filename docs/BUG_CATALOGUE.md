# Bug Catalogue (answer key)

> ⚠️ **Trainer-only.** This file describes the deliberate defects that can be switched on in Furniro.
> Keep it away from testers during exercises (see PLAN.md §13).

All toggles are **off by default**, deterministic, and only available when `BUG_TOGGLES_ENABLED=true`
(never in `APP_ENV=prod`). How to switch them: `PUT /__bugs__/{id}`, the `X-Bug-Toggles` header,
or the hidden `/__bugs` page.

Difficulty: ★ obvious in a quick manual pass · ★★ needs a specific scenario or boundary value ·
★★★ needs careful observation, automation, or non-functional testing.

## API-layer defects (backend)

| ID | Breaks | Symptom when ON | Where it lives | Difficulty |
|---|---|---|---|---|
| `BUG-SORT-PRICE` | FR-CAT-02 | "Price low→high" sorts prices as text, so $1,400.00 comes before $250.00 | `catalog_service.list_products` | ★ |
| `BUG-PAGINATION-OVERLAP` | FR-CAT-01 | Page 2 repeats the last product of page 1 and skips one product (offset off by one) | `core/pagination.paginate` | ★★ |
| `BUG-RESULTS-COUNT` | FR-CAT-01 | `total` ignores active filters, so the page shows "Showing 1–5 of 32" when only 5 match | `catalog_service.list_products` | ★★ |
| `BUG-SEARCH-CASE` | FR-CAT-03 | Search becomes case-sensitive: "sofa" finds nothing, "Sofa" works | `catalog_service.list_products` | ★★ |
| `BUG-CART-TOTAL` | FR-CART-03 | The subtotal ignores the quantity of the **last** cart line (counts it once) | `cart_service.compute_totals` | ★★ |
| `BUG-CART-MERGE-DUP` | FR-CART-02 | Adding the same product + size + colour again creates a second line instead of increasing quantity | `cart_service.add_item` | ★ |
| `BUG-QTY-LIMIT` | FR-CART-02 | Quantity above 10 and above stock is accepted (for example 99) | `cart_service.update_item` | ★★ |
| `BUG-DISCOUNT-ROUNDING` | FR-CAT-05 | `discount_percent` is truncated instead of rounded (-49% instead of -50% for some items) | `schemas.catalog.ProductSummary` | ★★★ |
| `BUG-CHECKOUT-EMAIL` | FR-CHK-01 | The server accepts an invalid billing email (`abc@`) when the client-side check is bypassed | `schemas.order.BillingIn` | ★★★ (API only) |
| `BUG-ORDER-STOCK` | FR-CHK-04 | Placing an order does not decrement stock, so an item can be oversold | `order_service.place_order` | ★★★ |
| `BUG-SLOW-PRODUCTS` | NFR performance | `GET /products` takes 3.5 s | `api/v1/routes/products.py` | ★★ |
| `BUG-INTERMITTENT-500` | FR-CART-02 | Every 3rd `POST /cart/items` returns `500 INTERNAL_ERROR` (counter-based) | `cart_service.add_item` | ★★★ |
| `BUG-AUTH-ENUM` | Security | Login returns a different error for an unknown email (`USER_NOT_FOUND`) than for a wrong password, which lets attackers discover which emails are registered | `auth_service.login` | ★★★ |

## UI-layer defects (frontend)

| ID | Breaks | Symptom when ON | Where it lives | Difficulty |
|---|---|---|---|---|
| `BUG-UI-DOUBLE-SUBMIT` | FR-CHK-04 | "Place order" stays enabled while pending, so a double click creates two orders | `CheckoutForm` | ★★ |
| `BUG-UI-STALE-BADGE` | FR-CART-04 | The header cart count does not update after removing an item until the page is reloaded | `useRemoveCartItem` | ★ |
| `BUG-UI-WRONG-PRICE-FORMAT` | FR-CAT-05 | The card shows cents as dollars (`$25,000.00` instead of `$250.00`) on list view only | `ProductCard` (list variant) | ★ |
| `BUG-UI-COMPARE-LIMIT` | FR-CMP-01 | A 4th product can be added to compare, and the table overflows | `compareStore` | ★★ |
| `BUG-UI-FILTER-RESET` | FR-CAT-07 | Changing the sort resets the page size to 16 and drops the filters from the URL | `useShopParams` | ★★ |
| `BUG-UI-MOBILE-OVERLAP` | Responsive | Below 768 px the cart drawer's Checkout button is hidden behind the subtotal row | `CartDrawer.module.css` | ★★ |
| `BUG-UI-A11Y-LABELS` | A11y | Checkout labels are not associated with their inputs, and the error text is not announced | `CheckoutForm` | ★★★ (axe) |
| `BUG-UI-TESTID-DRIFT` | Automation | `data-testid="pdp-add-to-cart"` becomes `pdp-add-cart`, which breaks locator-based tests | `ProductActions` | ★★★ (automation) |

## Adding a new toggle
1. Add the ID to `BugId` (backend `app/bugs/registry.py`) or `BUG_IDS` (frontend `src/lib/bugs.ts`), plus a row here.
2. Put the defect behind `bugs.is_active(BugId.X)` or `useBug('X')`, as a small branch next to the correct code and never in place of it.
3. Add a regression test: toggle on → broken behaviour; toggle off → correct behaviour.
4. Keep it deterministic: no `random`, no timing races except explicit delays.
