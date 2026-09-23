import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { apiFetch, type QueryParams } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import type { Category, Inspiration, ProductPage, Room } from '@/api/types';

/** A page of products. Keeps showing the previous page while the next one loads. */
export function useProducts(query: QueryParams) {
  return useQuery({
    queryKey: queryKeys.products.list(query),
    queryFn: ({ signal }) => apiFetch<ProductPage>('/products', { query, signal }),
    placeholderData: keepPreviousData,
  });
}

/** The 8 "Our Products" items on the home page. */
export function useFeaturedProducts() {
  return useProducts({ featured: true, page_size: 8 });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: ({ signal }) => apiFetch<Category[]>('/categories', { signal }),
  });
}

export function useRooms() {
  return useQuery({
    queryKey: queryKeys.rooms,
    queryFn: ({ signal }) => apiFetch<Room[]>('/rooms', { signal }),
  });
}

export function useInspirations() {
  return useQuery({
    queryKey: queryKeys.inspirations,
    queryFn: ({ signal }) => apiFetch<Inspiration[]>('/inspirations', { signal }),
  });
}
