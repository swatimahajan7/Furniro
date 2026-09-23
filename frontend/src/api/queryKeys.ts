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
    related: (slug: string, limit: number, offset: number) =>
      ['products', 'related', slug, limit, offset] as const,
    reviews: (slug: string, page: number) => ['products', 'reviews', slug, page] as const,
    compare: (ids: readonly number[]) => ['products', 'compare', ids] as const,
  },
  categories: ['categories'] as const,
  rooms: ['rooms'] as const,
  inspirations: ['inspirations'] as const,
};
