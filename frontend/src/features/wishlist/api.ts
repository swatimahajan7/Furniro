import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { apiFetch } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import { useSession } from '@/api/session';
import type { ProductSummary } from '@/api/types';
import { useToast } from '@/components/ui';
import { loginPath } from '@/features/auth';
import { errorMessage } from '@/lib/errors';

const useUserId = () => useSession((state) => state.user?.id ?? null);

/** The logged-in user's liked products, newest first. Idle (no request) for guests. */
export function useWishlist() {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.wishlist(userId),
    queryFn: ({ signal }) => apiFetch<ProductSummary[]>('/wishlist', { signal }),
    enabled: userId !== null,
    staleTime: 0,
  });
}

/** Whether a product is liked; false for guests and while the wishlist loads. */
export function useIsLiked(productId: number) {
  const wishlist = useWishlist();
  return wishlist.data?.some((p) => p.id === productId) ?? false;
}

interface Toggle {
  product: ProductSummary;
  like: boolean;
}

function useToggleMutation() {
  const client = useQueryClient();
  const userId = useUserId();
  const key = queryKeys.wishlist(userId);
  return useMutation({
    mutationFn: ({ product, like }: Toggle) =>
      apiFetch<void>(`/wishlist/${product.id}`, { method: like ? 'PUT' : 'DELETE' }),
    // Optimistic (GUIDELINES §3): the heart flips at once and rolls back on failure.
    onMutate: async ({ product, like }) => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<ProductSummary[]>(key);
      client.setQueryData<ProductSummary[]>(key, (list = []) => {
        const rest = list.filter((p) => p.id !== product.id);
        return like ? [product, ...rest] : rest;
      });
      return { previous };
    },
    onError: (_error, _vars, context) => client.setQueryData(key, context?.previous),
    onSettled: () => client.invalidateQueries({ queryKey: key }),
  });
}

/**
 * Like/unlike a product (FR-WISH-01). Guests are sent to login and brought back to this page.
 */
export function useToggleLike() {
  const isLoggedIn = useSession((state) => state.token !== null);
  const { mutate } = useToggleMutation();
  const toast = useToast();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const client = useQueryClient();
  const userId = useUserId();

  return useCallback(
    (product: ProductSummary) => {
      if (!isLoggedIn) {
        toast.info('Log in to save products to your wishlist.');
        void navigate(loginPath(pathname + search));
        return;
      }
      const list = client.getQueryData<ProductSummary[]>(queryKeys.wishlist(userId)) ?? [];
      const like = !list.some((p) => p.id === product.id);
      mutate(
        { product, like },
        {
          onSuccess: () =>
            like
              ? toast.success(`${product.name} added to your wishlist`)
              : toast.info(`${product.name} removed from your wishlist`),
          onError: (error) => toast.error(errorMessage(error)),
        },
      );
    },
    [isLoggedIn, toast, navigate, pathname, search, client, userId, mutate],
  );
}
