/**
 * Builders for dynamic data-testid values (frontend/GUIDELINES.md §6).
 * Static IDs can be written inline; anything with a slug or ID qualifier goes through here
 * so the spelling stays consistent across components.
 */

/** API field name → kebab-case ("first_name" → "first-name"). */
const kebab = (value: string | number) =>
  String(value)
    .replace(/_/g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();

export const testIds = {
  page: (name: string) => `page-${kebab(name)}`,

  field: (form: string, name: string) => `${form}-field-${kebab(name)}`,
  fieldError: (form: string, name: string) => `${form}-error-${kebab(name)}`,

  headerNav: (label: string) => `header-nav-${kebab(label)}`,
  footerLink: (label: string) => `footer-link-${kebab(label)}`,
  mobileNav: (label: string) => `mobile-nav-${kebab(label)}`,

  pagination: (base: string) => ({
    root: base,
    page: (n: number) => `${base}-page-${n}`,
    previous: `${base}-previous`,
    next: `${base}-next`,
  }),

  productCard: (slug: string) => {
    const base = `product-card-${slug}`;
    return {
      root: base,
      link: `${base}-link`,
      name: `${base}-name`,
      price: `${base}-price`,
      oldPrice: `${base}-old-price`,
      badge: `${base}-badge`,
      addToCart: `${base}-add-to-cart`,
      share: `${base}-share`,
      compare: `${base}-compare`,
      like: `${base}-like`,
    };
  },

  cartDrawerItem: (id: number) => ({
    root: `cart-drawer-item-${id}`,
    remove: `cart-drawer-item-${id}-remove`,
  }),

  cartRow: (id: number) => ({
    root: `cart-row-${id}`,
    qty: `cart-row-${id}-qty`,
    subtotal: `cart-row-${id}-subtotal`,
    remove: `cart-row-${id}-remove`,
  }),

  compareColumn: (slug: string) => ({
    root: `compare-column-${slug}`,
    remove: `compare-column-${slug}-remove`,
    addToCart: `compare-column-${slug}-add-to-cart`,
  }),
} as const;
