import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiError, apiFetch } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import type { ProductDetail, RelatedProducts, Review, ReviewCreate, ReviewPage } from '@/api/types';

export const RELATED_PAGE_SIZE = 4;
export const REVIEWS_PAGE_SIZE = 5;

export function useProduct(slug: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(slug),
    queryFn: ({ signal }) =>
      apiFetch<ProductDetail>(`/products/${encodeURIComponent(slug)}`, { signal }),
    enabled: slug !== '',
  });
}

export const isNotFound = (error: unknown) => error instanceof ApiError && error.status === 404;

/** Related products, 4 at a time; "Show More" fetches the next 4 (FR-PDP-06). */
export function useRelatedProducts(slug: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.products.related(slug),
    queryFn: ({ signal, pageParam }) =>
      apiFetch<RelatedProducts>(`/products/${encodeURIComponent(slug)}/related`, {
        query: { limit: RELATED_PAGE_SIZE, offset: pageParam },
        signal,
      }),
    initialPageParam: 0,
    getNextPageParam: (last, pages) =>
      last.has_more ? pages.length * RELATED_PAGE_SIZE : undefined,
    enabled: slug !== '',
  });
}

/** Reviews, newest first, 5 per page with "Load more". */
export function useReviews(slug: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: queryKeys.products.reviews(slug),
    queryFn: ({ signal, pageParam }) =>
      apiFetch<ReviewPage>(`/products/${encodeURIComponent(slug)}/reviews`, {
        query: { page: pageParam, page_size: REVIEWS_PAGE_SIZE },
        signal,
      }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.total_pages ? last.page + 1 : undefined),
    enabled: enabled && slug !== '',
  });
}

/** Post a review (logged in, once per product). Refreshes the list and the product's rating. */
export function useCreateReview(slug: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: ReviewCreate) =>
      apiFetch<Review>(`/products/${encodeURIComponent(slug)}/reviews`, { method: 'POST', body }),
    // Rating and review count show on the page, on cards and in comparisons.
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.products.all }),
  });
}
