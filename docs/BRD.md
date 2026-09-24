# Furniro — Business Requirements Document (BRD)

| Item | Value |
|---|---|
| Product | Furniro online furniture store (web) |
| Document | Business Requirements Document, v1.0 |
| Date | 2026-09-24 |
| Status | Baseline. Phases 0–6 delivered; Phase 7 (hardening) in progress |
| Design source | `Furniro_Web_Design_UI_KIT.pdf`: 9 desktop frames, 1440 px wide ([screens](design/screens/)) |
| Related docs | [PLAN.md](../PLAN.md) (delivery plan and decisions) · [DESIGN_SPEC.md](DESIGN_SPEC.md) (visual spec) · [API_CONTRACT.md](API_CONTRACT.md) (REST contract) |

This document states **what** the business needs and **why**. It does not say how the system is built. The
implementation plan and phase status are in PLAN.md, and the exact API behaviour is in API_CONTRACT.md. When
this document and those disagree on a detail, the contract is the source of truth at runtime; fix whichever is wrong.

---

## 1. Executive summary

Furniro is a furniture retailer. It sells chairs, sofas, tables, beds, lighting and home decor. The Furniro UI kit
designs a 9-screen online store: home, shop, product, cart drawer, comparison, cart, checkout, contact and blog.
This project turns the design into a working web store with a real backend, so that every button in the design
does something.

A shopper can browse the catalog, filter and sort it, open a product, choose its size and colour, compare up to
three products, keep a wishlist, put items in a cart, and place an order as a guest or as a signed-in customer.
Customers can also read the blog, send a message through the contact form and join the newsletter.

The store is a **demo and reference build**. It takes no real payments and sends no real email. Catalog content
comes from fixed seed data. The app is built so that automated tests can be added later: stable test IDs and
deterministic data. No tests are delivered in this scope.

---

## 2. Business background and problem statement

| | |
|---|---|
| **Current state** | The Furniro design exists only as static frames in a PDF. It has sample copy (lorem ipsum, a speaker description on a sofa page), two price formats (`Rp 2.500.000` and `Rs. 250,000.00`), several typos, and screens that are implied but never designed (login, account, wishlist, order confirmation, blog post, filter panel). |
| **Problem** | A static design can't show the shopping journey, can't be demonstrated to stakeholders, and can't be used to practise or teach QA and development. |
| **Opportunity** | A complete, working store that looks like the design, with consistent data, clear business rules and a clean codebase. It can serve as a product demo, as a reference implementation, and as a target for future test automation. |

---

## 3. Business objectives and success measures

| ID | Objective | Success measure |
|---|---|---|
| BO-1 | Match the design closely | All 9 designed screens are built and match their frame at 1440 px when compared side by side. Each deviation is recorded with a reason (§11). |
| BO-2 | Make the whole shopping journey work | Browse → filter/sort → product → cart → checkout → order confirmation works for guests and signed-in customers. No control in the design is a dead end. |
| BO-3 | Support customer engagement | Wishlist, product comparison, reviews, blog, contact form and newsletter all work and store their data. |
| BO-4 | Work on any screen size | Every screen works at 360, 768, 1024 and 1440 px with no horizontal scrolling. |
| BO-5 | Be accessible and fast | Lighthouse ≥ 90 for Performance, Accessibility and Best Practices. WCAG 2.1 AA contrast. Everything can be done with a keyboard. |
| BO-6 | Be ready for future test automation | Every interactive element and repeated item has a stable `data-testid`. Seed data is deterministic. Every error has a machine-readable code. |
| BO-7 | Be a clean reference codebase | Typed and linted on both sides. The API contract and the frontend types can't drift apart (checked automatically). The docs are kept up to date. |

---

## 4. Scope

### 4.1 In scope

**Designed screens (from the PDF)**

| # | Screen | Design frame | Route |
|---|---|---|---|
| 1 | Home | `01-home.jpg` | `/` |
| 2 | Shop (catalog) | `02-shop.jpg` | `/shop` |
| 3 | Single product | `03-product.jpg` | `/product/:slug` |
| 4 | Cart drawer (over the product page) | `04-product-cart-drawer.jpg` | overlay |
| 5 | Product comparison | `05-comparison.jpg` | `/compare` |
| 6 | Cart | `06-cart.jpg` | `/cart` |
| 7 | Checkout | `07-checkout.jpg` | `/checkout` |
| 8 | Contact | `08-contact.jpg` | `/contact` |
| 9 | Blog | `09-blog.jpg` | `/blog` |

Shared on every page: header, page banner with breadcrumb, feature strip, footer.

**Screens the design implies but does not draw**, built from the existing visual components only:
About, Login, Register, Account (profile and order history), Wishlist, Search, Order confirmation, Blog post,
Shop filter panel, Shop list view, Help pages (Payment options, Returns, Privacy policy), and Not found (404).

### 4.2 Out of scope

| Item | Reason |
|---|---|
| Real payment processing | Demo. The chosen method (bank transfer or cash on delivery) is recorded only. |
| Real email (order confirmation, contact replies, newsletter sends) | Demo. Messages and sign-ups are stored and logged. |
| Admin back office (catalog, orders, content management) | Catalog and content come from seed files. An admin API may follow later. |
| Tax, shipping rates, coupons and promotions | Shipping is always free and there is no tax, so the total equals the subtotal. |
| Order status workflow (shipping, delivery, cancellation, returns processing) | Orders are created as `pending` and stay there. |
| Password reset, email verification, social login | Not in the design. |
| Multiple currencies and languages | USD and English only (§11). |
| Production infrastructure (CDN, scaling, payment compliance) | Demo. Runs locally or with Docker Compose. |
| Automated tests of any kind, test-only endpoints, deliberate-defect switches | Decision D-4/D-5 in PLAN.md §12. |

---

## 5. Stakeholders and users

### 5.1 Stakeholders

| Stakeholder | Interest |
|---|---|
| Product owner | Scope, priorities, sign-off of each phase |
| Design owner | The build matches the UI kit; the deviations are acceptable |
| Development team | Clear, stable requirements and business rules |
| QA / test automation engineers (future) | Traceable requirements, stable test IDs, deterministic data |
| Demo audience | A believable, complete shopping experience |

### 5.2 User roles

| Role | Description | Can do |
|---|---|---|
| **Guest shopper** | Not signed in | Browse, search, filter, compare, use a cart, check out, look up an order with its number and email, read the blog, contact the store, subscribe to the newsletter |
| **Registered customer** | Signed in | Everything a guest can do, plus: a wishlist, posting reviews, an account page with order history, checkout prefilled from the profile, a cart that follows them across devices |
| **Store operator** | Business staff (no UI in this scope) | Maintains catalog and content through seed data; reads contact messages and newsletter sign-ups in the database |

Demo accounts: `demo@furniro.test` / `Demo@1234` (has 2 past orders and 3 liked products) and
`empty@furniro.test` / `Demo@1234` (no history).

---

## 6. Assumptions, constraints and dependencies

**Assumptions**
- A1. Shoppers use a current desktop or mobile browser (latest two versions of Chrome, Firefox, Safari and Edge).
- A2. The design frames are desktop only. Tablet and mobile layouts are worked out from the same components.
- A3. The catalog is small (32 products) and changes only by editing seed data.
- A4. The design's contact details (address, phone numbers, opening hours) are placeholders and are kept as drawn.

**Constraints**
- C1. The visual style must use only the design's colours, type sizes and spacing (DESIGN_SPEC §2). Undesigned screens can't introduce new visual patterns.
- C2. Money is handled as whole US cents everywhere and shown in one format: `$2,500.00`.
- C3. The store must run with zero setup on SQLite and in a production-like setup on PostgreSQL 16.
- C4. The design PDF is 158 MB, so the images are extracted once and stored as optimised WebP files.

**Dependencies**
- D1. The design images in the PDF, which provide product, room, blog and gallery photos (about 20 distinct product photos, so products share images as the design does).
- D2. The country and province lists for checkout (Sri Lanka, India, United States).

---

## 7. Business process flows

### 7.1 Browse to order (guest)
1. The shopper lands on Home, or opens Shop from the header.
2. They narrow the catalog with filters, sorting, search and paging.
3. They open a product, pick a size, colour and quantity, and click **Add To Cart**. The cart drawer opens.
4. From the drawer they go to **Cart** to review and change quantities, or straight to **Checkout**.
5. They fill in billing details, pick a payment method and click **Place order**.
6. The store checks stock, creates the order, reduces stock, empties the cart and shows the **Order confirmation** page with the order number.
7. Later, the shopper can look the order up again with its order number and the email used at checkout.

### 7.2 Sign in during shopping
1. A guest has items in the cart and clicks **Like** on a product, or opens Account or Wishlist.
2. They are sent to **Login** (or Register) and returned to the page they came from afterwards.
3. Their guest cart is merged into their customer cart. Quantities that would go over the stock limit are reduced rather than causing an error.
4. The liked product is saved to their wishlist. Checkout is now prefilled, and new orders appear in their order history.

### 7.3 Compare products
1. The shopper clicks **Compare** on up to 3 products (on cards, the product page, or the cart drawer's **Comparison** button).
2. The comparison page shows the products side by side, grouped by General, Product, Dimensions and Warranty.
3. They can add a product from the **Add A Product** list, remove one, or add any of them to the cart.

### 7.4 Content and engagement
- Read the blog: list → filter by category or search → read a post.
- Send a message through the contact form, which is stored and confirmed on screen.
- Subscribe to the newsletter from the footer on any page.

---

## 8. Functional requirements

Priority uses MoSCoW: **M**ust, **S**hould, **C**ould. The IDs match PLAN.md §3, so future test cases can trace
to them. "Design" names the frame the requirement comes from; *implied* means the design suggests it but does not draw it.

### 8.1 Global layout and navigation

| ID | Requirement | Priority | Design |
|---|---|---|---|
| FR-NAV-01 | The header shows the Furniro logo, the main navigation (Home, Shop, About, Contact) with the current page highlighted, and icons for account, search, wishlist and cart. It stays at the top of the page while scrolling. | M | all |
| FR-NAV-02 | The cart icon shows the number of units in the cart and opens the cart drawer. | M | 04 |
| FR-NAV-03 | The search icon opens a search box. Submitting it shows matching products on the Shop page. | M | implied |
| FR-NAV-04 | On small screens the navigation collapses into a menu button that opens a side drawer. | M | implied |
| FR-NAV-05 | Inner pages show a banner with the page title and a breadcrumb ("Home › Shop"). The product page uses a cream breadcrumb bar instead ("Home › Shop › Asgaard sofa"). | M | 02–09 |
| FR-NAV-06 | The feature strip shows four promises: High Quality, Warranty Protection (over 2 years), Free Shipping (order over $150) and 24/7 Support. It is information only. | M | 02, 05–09 |
| FR-NAV-07 | The footer shows the brand and address, Links (Home, Shop, About, Contact, Blog), Help (Payment Options, Returns, Privacy Policies), the newsletter sign-up and the copyright line. Every link opens a working page. | M | all |
| FR-NAV-08 | An unknown address shows a friendly "page not found" page with a way back. | M | implied |

### 8.2 Home

| ID | Requirement | Priority | Design |
|---|---|---|---|
| FR-HOME-01 | "Our Products" shows 8 featured products, with a **Show More** button that opens the Shop. | M | 01 |
| FR-HOME-02 | The hero shows the "New Arrival" card, "Discover Our New Collection" and a **BUY NOW** button that opens the Shop. | M | 01 |
| FR-HOME-03 | "Browse The Range" shows three room tiles (Dining, Living, Bedroom). Each opens the Shop filtered to that room. | M | 01 |
| FR-HOME-04 | "50+ Beautiful rooms inspiration" shows a slider of inspiration rooms from the store's data (number, room, title, image), with next/previous arrows and dots. **Explore More** opens the Shop, and each slide links to a relevant catalog view. | M | 01 |
| FR-HOME-05 | "#FuniroFurniture" shows the 9-photo "Share your setup" gallery. | M | 01 |

### 8.3 Catalog (Shop)

| ID | Requirement | Priority | Design |
|---|---|---|---|
| FR-CAT-01 | The catalog is paged. The page size can be 8, 16, 24 or 32 (16 by default). "Showing X–Y of Z results" is always correct. | M | 02 |
| FR-CAT-02 | Sort by: Default, Price low → high, Price high → low, Newest, Name A → Z. | M | 02 |
| FR-CAT-03 | Filter by category (Sofas, Chairs, Tables, Beds, Lighting, Decor), room (Dining, Living, Bedroom), price range, "On sale", "New" and a search keyword. Filters are chosen in a Filter panel with Apply and Reset. | M | 02 (panel implied) |
| FR-CAT-04 | The shopper can switch between grid view and list view. | M | 02 (list implied) |
| FR-CAT-05 | A product card shows the image, name, subtitle and price. An on-sale product shows a red `-X%` badge and the old price struck through. A new product shows a teal `New` badge. Other products show no badge. | M | 01, 02 |
| FR-CAT-06 | Hovering over (or focusing) a card shows **Add to cart**, **Share** (copies the product link and confirms it), **Compare** and **Like**. On touch screens and in list view these actions are always visible. | M | 01, 02 |
| FR-CAT-07 | Filters, sort, page, page size and view are part of the page address, so any view can be bookmarked and shared. Invalid values fall back to the defaults. | M | implied |
| FR-CAT-08 | When nothing matches, the page says so and offers **Clear filters**. A page number past the end says so and links back. | M | implied |
| FR-CAT-09 | Page numbers and **Next** appear under the grid. **Next** is hidden on the last page. | M | 02 |

### 8.4 Product detail

| ID | Requirement | Priority | Design |
|---|---|---|---|
| FR-PDP-01 | The gallery shows up to 4 thumbnails. Clicking one shows it as the main image. | M | 03 |
| FR-PDP-02 | The page shows the name, price, star rating with the number of reviews, a short description, SKU, category and tags. | M | 03 |
| FR-PDP-03 | If the product has sizes or colours, the shopper must pick one of each before adding to the cart. The first of each is preselected. | M | 03 |
| FR-PDP-04 | Quantity stepper: minimum 1, maximum the lower of 10 and the stock available. | M | 03 |
| FR-PDP-05 | Low stock and out of stock are shown clearly. An out-of-stock product can't be added to the cart. | M | implied |
| FR-PDP-06 | **Add To Cart** adds the chosen options and quantity and opens the cart drawer. | M | 03, 04 |
| FR-PDP-07 | **+ Compare** adds the product to the comparison list. A heart button adds it to or removes it from the wishlist. | M | 03 |
| FR-PDP-08 | Share to Facebook, LinkedIn and X. | S | 03 |
| FR-PDP-09 | Tabs: **Description** (text and images), **Additional Information** (specification table) and **Reviews [N]** (list, newest first, with "Load more"). | M | 03 |
| FR-PDP-10 | Signed-in customers can post one review per product (1–5 stars and a comment). Guests are asked to sign in. The product's average rating and review count update straight away. | M | 03 (form implied) |
| FR-PDP-11 | "Related Products" shows 4 products from the same category (not the current one). **Show More** loads 4 more on the same page. | M | 03 |
| FR-PDP-12 | An unknown product address shows a "product not found" page. | M | implied |

### 8.5 Cart

| ID | Requirement | Priority | Design |
|---|---|---|---|
| FR-CART-01 | Every visitor has a cart that is kept on the server and survives a page reload. A guest's cart moves to their account when they sign in. | M | 04, 06 |
| FR-CART-02 | The shopper can add items, change quantities and remove items. The same product with the same size and colour is one line; adding it again increases the quantity. | M | 04, 06 |
| FR-CART-03 | The cart drawer slides in from the right and lists each item (image, name, "quantity × price", remove), the subtotal, and **Cart**, **Checkout** and **Comparison** buttons. It closes on Esc, on the close button, or on a click outside it. | M | 04 |
| FR-CART-04 | The cart page shows a table (Product, Price, Quantity, Subtotal, remove) and a Cart Totals box (Subtotal, Total, **Check Out**). On small screens each row becomes a card. | M | 06 |
| FR-CART-05 | All subtotals and totals are calculated by the store, never by the browser, using current prices. | M | 04, 06 |
| FR-CART-06 | An empty cart shows a message and a **Continue shopping** button. | M | implied |

### 8.6 Checkout and orders

| ID | Requirement | Priority | Design |
|---|---|---|---|
| FR-CHK-01 | Billing form with First name, Last name, Company (optional), Country/Region, Street address, Town/City, Province, ZIP code, Phone, Email address and Additional information (optional). Errors are shown next to each field, both before sending and when the store rejects a value. | M | 07 |
| FR-CHK-02 | The Country list offers Sri Lanka (default, as designed), India and the United States. The Province list changes with the chosen country. | M | 07 |
| FR-CHK-03 | Payment method: **Direct Bank Transfer** or **Cash On Delivery**. The explanation for the selected method is shown under it. | M | 07 |
| FR-CHK-04 | The order summary lists each product with its quantity and subtotal, then the Subtotal and the Total. | M | 07 |
| FR-CHK-05 | **Place order** creates the order, keeps a copy of each product's name, price and image as they were at that moment, reduces stock, empties the cart and opens the order confirmation page. Clicking twice does not create two orders. | M | 07 |
| FR-CHK-06 | Guests can check out. Signed-in customers get the form prefilled, and the order is added to their history. | M | implied |
| FR-CHK-07 | An empty cart can't be checked out; the shopper is sent to the cart page. | M | implied |
| FR-CHK-08 | If stock has run out for any line since it was added, no order is placed, and the shopper is told which item is affected. | M | implied |
| FR-ORD-01 | The order confirmation page shows the order number (`FUR-000123`), items, totals, billing details and payment method. It still works after a page refresh. | M | implied |
| FR-ORD-02 | Anyone can look up an order with its order number and checkout email. The owner can open it while signed in without the email. | M | implied |

### 8.7 Compare

| ID | Requirement | Priority | Design |
|---|---|---|---|
| FR-CMP-01 | The shopper can compare up to **3** products. The list is kept in the browser and survives a reload. Adding a fourth, or one already in the list, shows a message. | M | 05 |
| FR-CMP-02 | The comparison table is grouped into General, Product, Dimensions and Warranty. A value a product doesn't have is shown as "—". | M | 05 |
| FR-CMP-03 | Each column shows the image, name, price, rating and review count, and has an **Add To Cart** button. | M | 05 |
| FR-CMP-04 | "Add A Product" lists the products not yet compared. Each column can be removed. "View More" opens the Shop. | M | 05 |
| FR-CMP-05 | An empty comparison page explains how to add products. | M | implied |

### 8.8 Accounts and wishlist

| ID | Requirement | Priority | Design |
|---|---|---|---|
| FR-AUTH-01 | Customers can register (first name, last name, email, password), sign in and sign out. | M | implied |
| FR-AUTH-02 | The Account page shows the profile, a paged order history (newest first) and a sign-out button. | M | implied |
| FR-AUTH-03 | Pages that need an account send guests to sign in, then return them to where they were. | M | implied |
| FR-AUTH-04 | When a session expires, the customer is told and sent to sign in. | M | implied |
| FR-WISH-01 | The wishlist needs an account. **Like** on a card, or the heart on the product page, adds or removes the product at once. A guest who clicks Like is sent to sign in and returned. | M | 01–03 |
| FR-WISH-02 | The Wishlist page shows liked products, most recent first, as product cards. | M | implied |

### 8.9 Content and forms

| ID | Requirement | Priority | Design |
|---|---|---|---|
| FR-BLOG-01 | The blog list shows 3 posts per page, each with author, date, category, image, title, excerpt and **Read more**, followed by page numbers. | M | 09 |
| FR-BLOG-02 | The blog sidebar has a search box, the categories with their post counts, and the 5 most recent posts. Category, search and page are part of the page address. | M | 09 |
| FR-BLOG-03 | A blog post page shows the full post and the same sidebar. An unknown post shows "not found". | M | implied |
| FR-CON-01 | The contact page shows the address, phone numbers and working hours, and a form with Your name, Email address, Subject (optional) and Message. A sent message is stored and a thank-you message is shown. | M | 08 |
| FR-NEWS-01 | The footer newsletter form checks the email address and subscribes it. An address that is already subscribed gets a friendly "already subscribed" message, not an error. | M | all |
| FR-INFO-01 | About page and three help pages (Payment options, Returns, Privacy policy) with short placeholder text. The checkout's "privacy policy" link opens the privacy page. | M | implied |

---

## 9. Business rules

| ID | Rule |
|---|---|
| BR-01 | **Currency.** All prices are in US dollars and shown as `$2,500.00`. They are stored as whole cents. |
| BR-02 | **Design prices converted.** Card prices in the design are divided by 10,000 (Rp 2.500.000 → $250.00). Product, cart and checkout prices are divided by 100 (Rs. 250,000.00 → $2,500.00). The ratios between prices stay the same. |
| BR-03 | **Discount badge.** The discount is `(old price − price) ÷ old price`, rounded half up to a whole percent. It is always calculated, never typed in. For example, $250 against $350 shows **-29%**. |
| BR-04 | **Quantity limit.** Each cart line can hold at most the lower of 10 and the stock available. Asking for more is refused with a message such as "Only 10 of Asgaard sofa can be added (requested 13)", and the cart is left as it was. |
| BR-05 | **Options.** If a product has sizes or colours, one of each must be chosen from the product's own list. |
| BR-06 | **Cart merge on sign-in.** Matching lines add up and are then reduced to the quantity limit. Out-of-stock lines are dropped. Signing in never fails because of the cart. |
| BR-07 | **Cart privacy.** A customer's cart can be reached only while signed in as that customer, never by its ID alone. |
| BR-08 | **Totals.** Shipping is free and there is no tax, so Total = Subtotal. "Order over $150" is information only. |
| BR-09 | **Stock at order time.** Stock is checked again when the order is placed. If any line is short, nothing is ordered. A placed order reduces stock. |
| BR-10 | **Order snapshot.** An order keeps each product's name, price and image as they were when it was placed. Later catalog changes don't alter it. |
| BR-11 | **Order number.** `FUR-` followed by the order ID padded to 6 digits (`FUR-000001`). |
| BR-12 | **Order lookup privacy.** A wrong email, someone else's order, and an order number that doesn't exist all give the same "not found" answer, so order numbers can't be guessed. |
| BR-13 | **Payment.** Only the chosen method (bank transfer or cash on delivery) is recorded. No money is taken. New orders have the status "pending". |
| BR-14 | **Compare limit.** At most 3 products can be compared at once. |
| BR-15 | **Reviews.** One review per customer per product. Rating 1–5 stars, comment 10–1,000 characters. The reviewer is shown as "First L." (for example "Dina P."). The average rating is shown to one decimal place. |
| BR-16 | **Passwords.** 8–72 characters, with at least one letter and one digit. Stored hashed, never in plain text. |
| BR-17 | **Emails.** Emails are case-insensitive for sign-in, registration and newsletter duplicates. |
| BR-18 | **Sign-in errors.** A wrong password and an unknown email give the same message, so accounts can't be probed. |
| BR-19 | **Sessions.** A session lasts 24 hours. Signing out ends it on the device. |
| BR-20 | **Billing validation.** Names 1–50 characters; company up to 100; street 1–200; city 1–80; ZIP 3–10 letters, digits, spaces or hyphens; phone 7–20 digits, spaces or `()-` with an optional leading `+`; a valid email; notes up to 500. The province must belong to the chosen country. |
| BR-21 | **Contact form.** Name 2–80 characters, a valid email, subject optional (up to 120), message 10–2,000 characters. |
| BR-22 | **Blog.** Posts are listed newest first, 3 per page. Search matches the title and excerpt, ignoring case. |

---

## 10. Data requirements

### 10.1 Business entities

| Entity | Key information |
|---|---|
| Product | Name, subtitle, SKU, price, old price (if on sale), new flag, featured flag, stock, category, room, tags, sizes, colours, images, description, specifications grouped as General/Product/Dimensions/Warranty |
| Category / Room | Sofas, Chairs, Tables, Beds, Lighting, Decor / Dining, Living, Bedroom |
| Review | Product, customer, rating, comment, date |
| Cart / Cart line | Owner (guest or customer); product, size, colour, quantity |
| Order / Order line | Order number, status, payment method, billing details, date; snapshot of each line |
| Customer | Name, email, password (hashed), wishlist |
| Inspiration room | Number, room, title, image, link |
| Blog post / Blog category | Title, excerpt, content, cover image, author, category, publish date |
| Contact message | Name, email, subject, message, date received |
| Newsletter subscriber | Email, date subscribed |

### 10.2 Seed (demo) data

The same data is loaded every time, so demos and future tests can rely on it.

| Data | Amount and notes |
|---|---|
| Products | 32, so the Shop shows "Showing 1–16 of 32" on 2 pages, as designed. Each has 1–4 images and a full set of specifications. The 8 design products (Syltherine, Leviosa, Lolito, Respira, Grifo, Muggo, Pingky, Potty) are featured on Home. |
| Out of stock | One product (`cornice`), so the out-of-stock state can be seen. |
| Reviews | 80 in total, 0–5 per product. Asgaard sofa has exactly 5 (5, 5, 5, 4, 4), matching "5 Customer Review", with an average of 4.6. |
| Blog | 24 posts in 5 categories, matching the design's counts: Crafts 2, Design 8, Handmade 7, Interior 1, Wood 6. The 5 newest use the design's titles. |
| Inspiration rooms | 4 |
| Customers | The 2 demo accounts (§5.2) |
| Locations | Sri Lanka (9 provinces), India (29 states), United States (50 states and DC) |

Placing orders reduces stock. Resetting the seed data returns the catalog to this baseline.

---

## 11. Design decisions and deviations

The design has some inconsistencies. These are the business decisions taken (full list in PLAN.md §2.2):

| Design issue | Decision |
|---|---|
| Prices appear in two currencies and formats (`Rp 2.500.000`, `Rs. 250,000.00`) | US dollars everywhere, converted as in BR-02. |
| The brand is spelled Furniro, "Funiro." and "furino" | **Furniro** in the header and footer. The hashtag #FuniroFurniture stays as designed. |
| Typos: "Short by", "reverved", "65 GK", "Ser icev" | Corrected: "Sort by", "reserved", "65 KG". |
| The product description is about a speaker | Realistic furniture copy in the seed data. |
| Checkout shows "Direct Bank Transfer" twice | Two options: Direct Bank Transfer and Cash On Delivery. |
| The mug, bed set and flower pot cards show sofa photos | Use the matching photos from the PDF. The sofa photos become extra catalog products. |
| The Syltherine badge says -30%, but the prices give 28.6% | The badge is calculated, so it shows -29%. The prices stay as designed. |
| The comparison page shows ratings of 4.7 and 4.2 | Ratings come from real reviews (Asgaard sofa: 4.6 from 5 reviews). |
| The cart page quantity is a plain number box | A `- n +` stepper, the same as on the product page. |
| The blog has no link anywhere in the design | **Blog** is added to the footer's Links column. The header stays as designed. |
| The blog shows 2022 dates and lorem ipsum | Posts are dated 2026 and have short furniture-care text. |
| "Order over 150 $" | Shown as "Order over $150". Information only (BR-08). |

Additions beyond the design, built from existing components: a wishlist heart next to "+ Compare" on the product
page, a remove button on each comparison column, and a demo-account hint on the Login page.

---

## 12. Non-functional requirements

| ID | Area | Requirement |
|---|---|---|
| NFR-01 | Fidelity | Designed screens match their frame at 1440 px. Only the design's colours, type sizes and spacing are used. |
| NFR-02 | Responsive | Every screen works at 360, 768, 1024 and 1440 px with no horizontal scrolling. The product grid shows 4, 3, 2 or 1 columns depending on width. |
| NFR-03 | Accessibility | WCAG 2.1 AA: keyboard access to everything, visible focus, focus kept inside open drawers and returned when they close, labelled form fields, errors announced, AA contrast, and animation turned off for users who ask for reduced motion. |
| NFR-04 | Performance | Lighthouse ≥ 90 for Performance, Accessibility and Best Practices. Initial JavaScript ≤ 200 KB gzipped. Each page loads its own code. Images are optimised WebP files, sized for the screen and loaded as needed. |
| NFR-05 | Resilience | Every page has loading, empty and error states. Network failures offer **Try again**. |
| NFR-06 | Security | Passwords are hashed (bcrypt). Sessions use signed tokens that expire. Production refuses to start with weak secrets. Error messages never reveal internals. BR-07, BR-12 and BR-18 prevent data from being probed. |
| NFR-07 | Data integrity | Money is whole cents end to end. Totals are calculated on the server. Stock is locked and checked again when an order is placed. |
| NFR-08 | Traceability | Every response carries a request ID that can be quoted in bug reports. Every error carries a machine-readable code (see API_CONTRACT §1.3). |
| NFR-09 | Testability | Every interactive element and repeated item has a stable `data-testid` (frontend/GUIDELINES.md §6). Seed data is deterministic. The API is documented at `/docs`. |
| NFR-10 | Portability | Runs locally on SQLite with one command, and as a full stack (PostgreSQL, API, web) with Docker Compose. |
| NFR-11 | Maintainability | Strict typing and linting on both sides. The frontend's API types are generated from the backend, and a check fails if they drift. |
| NFR-12 | Browser support | The latest two versions of Chrome, Firefox, Safari and Edge, on desktop and mobile. |

---

## 13. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| No automated tests, so regressions can slip through | Medium | Strict typing, the contract check, and a manual walkthrough of affected screens before each phase sign-off. Test IDs are ready for when tests are added. |
| Undesigned screens drift from the design's style | Medium | Build them only from existing components and compare them with the nearest designed screen. |
| The frontend and API disagree | Medium | Types are generated from the API, and a drift check runs in CI. |
| SQLite and PostgreSQL behave differently | Low | No database-specific SQL. Checks run on both before sign-off. |
| Few distinct product photos (about 20 for 32 products) | Low | Products reuse photos, as the design itself does. |

---

## 14. Traceability: design screen → requirements

| Screen | Requirements | Delivered |
|---|---|---|
| 01 Home | FR-HOME-01…05, FR-CAT-05/06, FR-NAV-01…07 | Phase 3 |
| 02 Shop | FR-CAT-01…09, FR-NAV-06 | Phase 3 |
| 03 Single product | FR-PDP-01…12, FR-WISH-01 | Phases 3–5 |
| 04 Cart drawer | FR-CART-01…03, FR-CART-05, FR-NAV-02 | Phase 4 |
| 05 Comparison | FR-CMP-01…05 | Phase 5 |
| 06 Cart | FR-CART-02, FR-CART-04…06 | Phase 4 |
| 07 Checkout | FR-CHK-01…08 | Phase 4 |
| 08 Contact | FR-CON-01 | Phase 6 |
| 09 Blog | FR-BLOG-01…03 | Phase 6 |
| Footer (all) | FR-NAV-07, FR-NEWS-01, FR-INFO-01 | Phases 2, 6 |
| Implied screens | FR-NAV-03/04/08, FR-ORD-01/02, FR-AUTH-01…04, FR-WISH-02, FR-INFO-01 | Phases 2–6 |
| All screens | NFR-01…12 | Phase 7 (in progress) |

---

## 15. Acceptance criteria (samples)

Each requirement is accepted when it works as written on all four screen widths with no browser console errors.
These key scenarios are the sign-off walkthrough.

| # | Given | When | Then |
|---|---|---|---|
| AC-01 | The Shop at its defaults | The page loads | 16 products appear, "Showing 1–16 of 32 results" is shown, and there are 2 pages |
| AC-02 | The Shop | The shopper picks "Price low → high" and page size 8 | Products are in rising price order, there are 4 pages, and the address holds both choices |
| AC-03 | The Syltherine card | It is shown | It has a red **-29%** badge, $250.00, and $350.00 struck through |
| AC-04 | The Asgaard sofa page | The shopper sets quantity 2 and clicks Add To Cart | The drawer opens with "2 × $2,500.00", the subtotal is $5,000.00, and the header badge shows 2 |
| AC-05 | A cart line at the limit of 10 | The shopper tries to add 3 more | The request is refused with the "Only 10 … can be added" message and the cart is unchanged |
| AC-06 | A guest with one item in the cart | They check out with valid details and bank transfer | An order `FUR-…` is shown, the cart is empty, and the product's stock has dropped |
| AC-07 | The checkout form | The shopper submits it with the email missing and a 2-character ZIP | The order is not placed and both fields show an error |
| AC-08 | A guest | They click Like on a card | They are sent to sign in, and afterwards return to the same page with the product in their wishlist |
| AC-09 | A guest cart with 2 items | The guest signs in as the demo customer | Both items are in the customer's cart |
| AC-10 | 3 products in the comparison | The shopper tries to add a fourth | A message says the limit is 3, and the list is unchanged |
| AC-11 | The blog | The shopper picks "Design" | 8 posts are available over 3 pages, and "Design" is marked as selected |
| AC-12 | The footer | The shopper subscribes an email that is already subscribed, in different letter case | They see "already subscribed", not an error |
| AC-13 | An order number from another browser | Someone looks it up with a wrong email | They see the same "not found" message as for an unknown number |

---

## 16. Glossary

| Term | Meaning |
|---|---|
| BRD | Business Requirements Document (this document) |
| PDP | Product detail page |
| Cart drawer | The panel that slides in from the right showing the cart |
| Featured product | One of the 8 products shown in "Our Products" on Home |
| Seed data | The fixed demo data loaded into the store |
| Snapshot | The copy of product details kept in an order when it is placed |
| `data-testid` | A stable label on a page element that future automated tests can use to find it |
| MoSCoW | Priority scale: Must, Should, Could, Won't |

---

## 17. Approval

| Role | Name | Date | Decision |
|---|---|---|---|
| Product owner | | | |
| Design owner | | | |
| Development lead | | | |
