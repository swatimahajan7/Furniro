import type { QueryParams } from './client';

/**
 * Every TanStack Query key in one place, so invalidation is predictable
 * (e.g. invalidate `queryKeys.products.all` after a review changes a rating).
 */
export const queryKeys = {
  health: ['health'] as const,
  meta: {
    config: ['meta', 'config'] as const,
    locations: ['meta', 'locations'] as const,
  },
  products: {
    all: ['products'] as const,
    list: (params: QueryParams) => ['products', 'list', params] as const,
    detail: (slug: string) => ['products', 'detail', slug] as const,
    /** Infinite queries: pages are tracked inside the query, not in the key. */
    related: (slug: string) => ['products', 'related', slug] as const,
    reviews: (slug: string) => ['products', 'reviews', slug] as const,
    compare: (ids: readonly number[]) => ['products', 'compare', ids] as const,
  },
  cart: (cartId: string | null) => ['cart', cartId] as const,
  /** User-scoped keys carry the user id, so logging in or out never shows someone else's data. */
  orders: {
    all: ['orders'] as const,
    detail: (orderNumber: string, email: string, userId: number | null) =>
      ['orders', 'detail', orderNumber, email, userId] as const,
    mine: (userId: number | null, page: number) => ['orders', 'mine', userId, page] as const,
  },
  wishlist: (userId: number | null) => ['wishlist', userId] as const,
  categories: ['categories'] as const,
  rooms: ['rooms'] as const,
  inspirations: ['inspirations'] as const,
};
