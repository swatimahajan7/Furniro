import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { localStore } from '@/lib/storage';

import type { User } from './types';

/**
 * Who the API client talks to the server as. Lives in the API layer so `apiFetch` can attach
 * the headers without importing any feature.
 */
interface SessionState {
  /** The cart UUID, sent as `X-Cart-Id` (FR-CART-01). When logged in it is the user's cart. */
  cartId: string | null;
  /** JWT access token (AD-7), sent as `Authorization: Bearer`. */
  token: string | null;
  user: User | null;
  /** Set when the server rejected the token, so the app can explain and send the user to login. */
  expired: boolean;
  setCartId: (cartId: string | null) => void;
  logIn: (auth: { token: string; user: User; cartId: string | null }) => void;
  /** Forget the user and their cart; the next cart action starts a fresh guest cart. */
  logOut: (reason?: 'user' | 'expired') => void;
  acknowledgeExpiry: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      cartId: null,
      token: null,
      user: null,
      expired: false,
      setCartId: (cartId) => set({ cartId }),
      logIn: ({ token, user, cartId }) => set({ token, user, cartId, expired: false }),
      logOut: (reason = 'user') =>
        set({ token: null, user: null, cartId: null, expired: reason === 'expired' }),
      acknowledgeExpiry: () => set({ expired: false }),
    }),
    {
      name: 'furniro-session',
      storage: createJSONStorage(() => localStore),
      partialize: (state) => ({ cartId: state.cartId, token: state.token, user: state.user }),
    },
  ),
);
