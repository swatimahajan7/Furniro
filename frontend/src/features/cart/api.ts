import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { ApiError, apiFetch } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import { useSession } from '@/api/session';
import type { Cart, CartItemAdd } from '@/api/types';

const isMissingCart = (error: unknown) =>
  error instanceof ApiError && error.code === 'CART_NOT_FOUND';

/** Create a fresh anonymous cart and remember its ID. */
async function createCart(): Promise<Cart> {
  const cart = await apiFetch<Cart>('/cart', { method: 'POST' });
  useSession.getState().setCartId(cart.id);
  return cart;
}

/**
 * Run a cart request, creating a cart first if there is none. If the stored cart no longer
 * exists (e.g. the database was reseeded), start a new one and retry once (GUIDELINES §4).
 */
async function withCart<T>(request: () => Promise<T>): Promise<T> {
  if (!useSession.getState().cartId) await createCart();
  try {
    return await request();
  } catch (error) {
    if (!isMissingCart(error)) throw error;
    await createCart();
    return request();
  }
}

function storeCart(client: QueryClient, cart: Cart) {
  client.setQueryData(queryKeys.cart(cart.id), cart);
}

/** The current cart, or null when there is none yet. Always fresh (staleTime 0). */
export function useCart() {
  const cartId = useSession((state) => state.cartId);
  return useQuery({
    queryKey: queryKeys.cart(cartId),
    queryFn: async ({ signal }) => {
      if (!cartId) return null;
      try {
        return await apiFetch<Cart>('/cart', { signal });
      } catch (error) {
        // A stale ID (e.g. after a reseed) is just "no cart yet".
        if (isMissingCart(error)) {
          useSession.getState().setCartId(null);
          return null;
        }
        throw error;
      }
    },
    staleTime: 0,
  });
}

export function useAddToCart() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (item: CartItemAdd) =>
      withCart(() => apiFetch<Cart>('/cart/items', { method: 'POST', body: item })),
    onSuccess: (cart) => storeCart(client, cart),
  });
}

export function useUpdateCartItem() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      apiFetch<Cart>(`/cart/items/${itemId}`, { method: 'PATCH', body: { quantity } }),
    onSuccess: (cart) => storeCart(client, cart),
  });
}

export function useRemoveCartItem() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (itemId: number) => apiFetch<Cart>(`/cart/items/${itemId}`, { method: 'DELETE' }),
    onSuccess: (cart) => storeCart(client, cart),
  });
}

/** After an order is placed the server empties the cart; mirror that without a refetch. */
export function markCartEmpty(client: QueryClient) {
  const cartId = useSession.getState().cartId;
  client.setQueryData<Cart | null>(queryKeys.cart(cartId), (cart) =>
    cart ? { ...cart, items: [], item_count: 0, subtotal_minor: 0, total_minor: 0 } : cart,
  );
}
