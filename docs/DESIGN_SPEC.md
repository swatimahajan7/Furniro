# Furniro — Design Spec

Source: `Furniro_Web_Design_UI_KIT.pdf` (9 frames, 1440 px wide). Page renders are in
[`design/screens/`](design/screens/). Colours were sampled from the renders and match the
known Furniro kit palette. Confirm any value in Figma when pixel accuracy matters.

> **Rule:** components use only the tokens below, never raw hex or px values.
> If a value is missing, add a token here first, then to `frontend/src/styles/tokens.css`.

---

## 1. Layout grid

| Token | Value | Notes |
|---|---|---|
| Design canvas | 1440 px | Desktop reference |
| `--container-max` | 1236 px | Content width (4 cards × 285 + 3 gaps × 32) |
| `--container-pad` | 16 px mobile · 24 px tablet · auto-centred desktop | |
| Product grid | 4 cols ≥1024 · 3 cols ≥768 · 2 cols ≥480 · 1 col | Gap 32 px desktop, 16 px mobile |
| Card size | 285 × 446 px (image 301 px tall) | Image ratio ≈ 0.95 |
| Breakpoints | `sm 480` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1440` | Mobile-first `min-width` |

## 2. Tokens

### 2.1 Colour
| Token | Hex | Where it is used |
|---|---|---|
| `--color-primary` | `#B88E2F` | Buttons (BUY NOW, Submit, Explore More), active pagination, hero title, prices in drawer and totals, logo mark |
| `--color-primary-hover` | `#A07A25` | Hover/pressed for primary (derived) |
| `--color-hero-card` | `#FFF3E3` | Home hero text card |
| `--color-cream` | `#F9F1E7` | Shop toolbar, breadcrumb bar, feature strip, cart table header, Cart Totals box, inactive pagination, PDP image backgrounds |
| `--color-cream-light` | `#FCF8F3` | Home "50+ Beautiful rooms" section |
| `--color-card` | `#F4F5F7` | Product card body |
| `--color-text` | `#3A3A3A` | Headings, product names |
| `--color-text-body` | `#333333` | Body |
| `--color-text-muted` | `#898989` | Card subtitle, meta labels, footer address |
| `--color-text-subtle` | `#9F9F9F` | Inactive tabs, placeholders, footer headings |
| `--color-text-strike` | `#B0B0B0` | Struck-through old price |
| `--color-sale` | `#E97171` | `-30%` badge |
| `--color-new` | `#2EC1AC` | `New` badge |
| `--color-rating` | `#FFC700` | Stars |
| `--color-border` | `#D9D9D9` | Dividers, footer rule |
| `--color-input-border` | `#9F9F9F` | Inputs, selects, outline buttons |
| `--color-overlay` | `rgba(58,58,58,.72)` | Product card hover overlay |
| `--color-backdrop` | `rgba(0,0,0,.2)` | Page dim behind the cart drawer |
| `--color-banner-veil` | `rgba(255,255,255,.45)` | White wash over the blurred page-banner photo |
| `--color-swatch-1..3` | `#816DFA` · `#000000` · `#B88E2F` | PDP colour swatches (seed values) |
| `--color-white` / `--color-black` | `#FFFFFF` / `#000000` | |

### 2.2 Typography
Font family: **Poppins** (400, 500, 600, 700). Logo wordmark: **Montserrat 700**.

| Token | Size / line-height / weight | Example |
|---|---|---|
| `--text-logo` | 34 / — / 700 (Montserrat) | Header wordmark "Furniro" |
| `--text-display` | 52 / 65 / 700 | "Discover Our New Collection" |
| `--text-h1` | 48 / 72 / 500 | Page banner titles (Shop, Cart…) |
| `--text-h2` | 40 / 48 / 700 | "Our Products", "50+ Beautiful rooms" |
| `--text-h3` | 32 / 48 / 700 (Browse the Range), 600 (Billing details) | |
| `--text-product-title` | 42 / 63 / 400 | PDP "Asgaard sofa" |
| `--text-h4` | 24 / 29 / 600 | Card names, "Cart Totals" |
| `--text-lg` | 20 / 30 / 500 | Price (card), tabs, feature strip titles |
| `--text-md` | 16 / 24 / 400–500 | Body, nav, buttons |
| `--text-sm` | 14 / 21 / 400 | Meta, breadcrumbs |
| `--text-xs` | 12 / 18 / 400 | Size chips, review count |

Letter-spacing 3 px for "New Arrival" (uppercase eyebrow).

### 2.3 Spacing, radius, elevation
- Spacing scale (px): `4 8 12 16 20 24 32 40 48 56 64 80 96`, as `--space-1` … `--space-13`.
- Radius: `--radius-sm 5px` (size chips, qty box), `--radius-md 10px` (inputs, pagination, image boxes), `--radius-lg 15px` (outline-dark buttons), `--radius-pill 50px` (drawer buttons, badges are circles).
- Shadow: `--shadow-drawer 0 4px 24px rgba(0,0,0,.08)`, and `--shadow-card-hover` (subtle).
- Layout sizes: `--header-height 100px`, `--banner-height 316px`, `--drawer-width 417px`.
- Layers: `--z-header 50`, `--z-drawer 100`, `--z-toast 200`.
- Motion: `--duration-fast 150ms`, `--duration-base 250ms`, `--ease-standard cubic-bezier(.2,0,0,1)`. All motion is disabled under `prefers-reduced-motion`.

## 3. Components

| Component | Variants / states | Spec |
|---|---|---|
| **Button** | `primary` (gold fill, white text); `outline-primary` (Show More: 1px gold border, gold text, white bg); `outline-dark` (Add To Cart / Compare / Check Out / Place order: 1px black border, radius 15, 64 px tall); `pill` (drawer: radius 50, 30 px tall); `link` (Read more with underline) | States: hover, focus-visible (2 px gold ring), disabled (40 % opacity), loading (spinner and `aria-busy`) |
| **Badge** | `sale` (red circle 48 px, "-30%"), `new` (teal circle, "New") | Top-right of the card image, 24 px inset |
| **ProductCard** | default / hover (overlay with white "Add to cart" button + Share, Compare, Like row) / list-view variant | Name h4, subtitle muted 16, price 20/600, old price strike 16 |
| **Header** | Logo · nav (Home, Shop, About, Contact) · icons (account, search, wishlist, cart with count badge) | 100 px tall, sticky, white. Below `lg`: hamburger with a nav drawer |
| **PageBanner** | Blurred background image, logo mark, h1, breadcrumb "Home › X" | 316 px tall |
| **Breadcrumb** | In the banner (centred), or a cream bar (PDP: "Home › Shop › \| Asgaard sofa") | |
| **FeatureStrip** | 4 items: trophy, check-badge, box, headset icons + title + subtitle | Cream bg, 270 px tall |
| **Footer** | Brand + address · Links · Help · Newsletter (underlined input + SUBSCRIBE) · divider · copyright | |
| **Pagination** | 60×60 squares, radius 10, cream / gold active, plus "Next" | Hide Next on the last page |
| **ShopToolbar** | Filter button, grid/list toggles, divider, results text, "Show [16]", "Sort by [Default]" | Cream bar 100 px |
| **QuantityStepper** | `- 1 +` | 1 px border, radius 10; min/max disable the buttons |
| **SizeChip / ColorSwatch** | selected: gold fill (size) / ring (colour) | 30 px |
| **Rating** | 5 stars, supports halves, with an "N Customer Review" link | |
| **Tabs** | Active black, inactive `--color-text-subtle` | Description / Additional Information / Reviews [N] |
| **CartDrawer** | 417 px wide from the right, dimmed page, list of item rows (image 105 px, name, "1 X $2,500.00" in gold, remove ⓧ), Subtotal, pill buttons [Cart] [Checkout] [Comparison] | Focus trap, closes on Esc and backdrop click |
| **Form fields** | Label 16/500 above the input, input 75 px tall, radius 10, border `--color-input-border` | Error: red text below plus `aria-invalid` |
| **Blog card** | Image 817×500 radius 10, meta row (user / calendar / tag icons), title 30, excerpt, "Read more" underlined | |
| **Sidebar** | Search input with icon, Categories list with counts, Recent Posts (80 px thumbnail + title + date) | |

Icons: `lucide-react` equivalents. Use `User`, `Search`, `Heart`, `ShoppingCart`, `SlidersHorizontal`, `LayoutGrid`, `List`, `Share2`, `ArrowLeftRight`, `Trash2`, `MapPin`, `Phone`, `Clock`, `Trophy`, `BadgeCheck`, `Package`, `Headset`, `ChevronRight`, `X`. Keep stroke 1.5–2 to match the line style.

## 4. Screen-by-screen notes

### 4.1 Home (`01-home.jpg`)
1. **Hero:** full-width image (716 px tall), with a right-aligned cream card (643×443) holding an eyebrow ("New Arrival"), display title in gold, text, and a BUY NOW primary button (222×74, uppercase, which links to `/shop`).
2. **Browse The Range:** h3 + subtitle, 3 tiles (381×480, radius 10) with labels Dining/Living/Bedroom. Each links to `/shop?room=<slug>`.
3. **Our Products:** h2 plus 8 `ProductCard`s (2 rows) and a "Show More" outline-primary button that links to `/shop`.
4. **50+ Beautiful rooms inspiration:** cream-light section. Left: copy + "Explore More" (to `/shop`). Right: Embla carousel. The active slide is large (404×582) with an info card ("01 — Bed Room", "Inner Peace", and a gold arrow button). It has next/prev arrows and dot indicators.
5. **#FuniroFurniture:** masonry-style static gallery of 9 images, which overflows at the edges on desktop.

### 4.2 Shop (`02-shop.jpg`)
- Banner → toolbar → 4×4 grid → pagination → feature strip.
- "Showing {from}–{to} of {total} results" comes from API pagination.
- The **Filter** button opens a left drawer (undesigned). It holds Category checkboxes, Room checkboxes, a price min/max, "On sale", "New", and Apply/Reset.
- The list view (undesigned) shows the image on the left (285 px) and the name, subtitle, rating, price and actions on the right. In list view the actions (Add to cart, Share, Compare, Like) are always visible under the text; a hover overlay there would cover the text.

### 4.3 Single product (`03-product.jpg`)
- Cream breadcrumb bar. Left: vertical thumbnails (76×80) and the main image (423×500) on cream. Right: title, price (muted 24), rating + divider + review count, short description, Size chips, Colour swatches, qty stepper, Add To Cart, + Compare, divider, meta table (SKU, Category, Tags, Share icons).
- Full-width divider, then tabs, then description paragraphs and 2 wide images (605×348 on cream).
- Related Products: 4 cards + Show More.
- Share icons: Lucide has no brand icons, so Facebook, LinkedIn and X are small black circles with "f", "in" and "X" rather than copied logos.

### 4.4 Cart drawer (`04-product-cart-drawer.jpg`)
- Opens on Add To Cart and from the header cart icon. The heart on the PDP turns red when wishlisted.

### 4.5 Comparison (`05-comparison.jpg`)
- Banner. Top row: "Go to Product page for more Products" + "View More" (to `/shop`), up to 3 product columns (image 280×177 on cream, name, price, rating + review count), and "Add A Product" with a gold "Choose a Product" dropdown.
- Spec table with group headings (General, Product, Dimensions, Warranty), a label column, and one column per product with vertical dividers. There is a gold "Add To Cart" button at the bottom of each column.

### 4.6 Cart (`06-cart.jpg`)
- Table header row on cream: Product, Price, Quantity, Subtotal. Each row has an image (108 px, cream), name (muted) with its size/colour, price (muted), a quantity control, the subtotal, and a gold trash icon. The design's plain quantity box is built as the compact `- n +` stepper (clearer, and each change is one request). Below 768 px rows become labelled cards.
- Cart Totals box (393×390, cream): Subtotal muted, Total in gold 20/500, and a "Check Out" outline-dark button.

### 4.7 Checkout (`07-checkout.jpg`)
- Left: "Billing details" with First/Last name side by side, then Company (optional), Country/Region select, Street, Town/City, Province select, ZIP, Phone, Email, and an Additional information textarea.
- Right: Product/Subtotal summary, Total in gold, a divider, payment radios with the helper text for the selected one, a privacy note with a bold "privacy policy" link, and a "Place order" outline-dark button.

### 4.8 Contact (`08-contact.jpg`)
- "Get In Touch With Us" + subtitle. Left: Address/Phone/Working Time with filled icons. Right: form with placeholders "Abc", "Abc@def.com", "This is an optional", "Hi! i'd like to ask about", and a gold Submit button (237×55, radius 5).

### 4.9 Blog (`09-blog.jpg`)
- Main column: 3 posts per page, with meta (Admin · date · category), title, excerpt and Read more. Sidebar: search, Categories (name + count), Recent Posts (5). Pagination as on the shop page.

## 5. Asset naming (output of `scripts/extract_design_assets.py`)

Generated by `make assets`: `scripts/extract_design_assets.py` plus the committed name map
`scripts/design_assets_map.json` (extracted-image key → target path). There are 48 files, 3.1 MB in total, each at most
1600 px on the long edge, WebP q80, and under 400 KB. Product cut-outs keep their transparency so they sit on `--color-cream`.

```
backend/media/
├── banners/      hero-home, page-banner
├── rooms/        dining, living, bedroom
├── inspirations/ inner-peace, morning-light, quiet-corner, soft-pastels
├── gallery/      funiro-01 … funiro-09                      (#FuniroFurniture grid, in design order)
├── products/     syltherine-1, leviosa-1, lolito-1, respira-1, grifo-1, muggo-1, pingky-1, potty-1,
│                 asgaard-sofa-1…4, asgaard-sofa-desc-1…2, outdoor-sofa-set-1, casaliving-wood-1,
│                 grey-sectional-1, nordic-sofa-set-1, cognac-leather-sofa-1, wingback-chair-1,
│                 mustard-armchair-1, oak-platform-bed-1
└── blog/         laptop-wood-desk, planner-hands, journal-coffee, notebook-pen, read-more-tiles,
                  laptop-cafe, laptop-plant, cafe-table
```
(All files are `.webp`.) The PDF has only about 20 distinct product photos, so the 32 seed products reuse images, as the design itself does.

**Brand mark:** `frontend/public/logo-mark.svg` is traced from the kit, so it is approximate. Replace it with the original vector from Figma when that is available.
