import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { apiFetch } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import { useSession } from '@/api/session';
import type { AuthToken, Cart, LoginIn, RegisterIn } from '@/api/types';

export const useCurrentUser = () => useSession((state) => state.user);
export const useIsLoggedIn = () => useSession((state) => state.token !== null);

/** Queries that belong to one user; dropped on logout so nothing lingers in memory. */
export function forgetUserData(client: QueryClient) {
  client.removeQueries({ queryKey: queryKeys.orders.all });
  client.removeQueries({ queryKey: ['wishlist'] });
}

/**
 * Store the session, first moving the guest cart into the user's cart (FR-CART-01). The merge
 * sends the new token explicitly, so the session flips to "logged in" in one step. A failed
 * merge never blocks logging in; the user's cart then loads on the next cart action.
 */
async function startSession(client: QueryClient, auth: AuthToken) {
  const cart = await apiFetch<Cart>('/cart/merge', {
    method: 'POST',
    headers: { Authorization: `Bearer ${auth.access_token}` },
  }).catch(() => null);
  forgetUserData(client);
  useSession
    .getState()
    .logIn({ token: auth.access_token, user: auth.user, cartId: cart?.id ?? null });
  if (cart) client.setQueryData(queryKeys.cart(cart.id), cart);
}

export function useLogin() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: LoginIn) => {
      const auth = await apiFetch<AuthToken>('/auth/login', { method: 'POST', body });
      await startSession(client, auth);
      return auth.user;
    },
  });
}

export function useRegister() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: RegisterIn) => {
      const auth = await apiFetch<AuthToken>('/auth/register', { method: 'POST', body });
      await startSession(client, auth);
      return auth.user;
    },
  });
}

/** Log out locally (tokens are stateless). The next cart action starts a new guest cart. */
export function useLogout() {
  const client = useQueryClient();
  return useCallback(() => {
    useSession.getState().logOut('user');
    forgetUserData(client);
  }, [client]);
}
