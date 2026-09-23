import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { localStore } from '@/lib/storage';

/**
 * Who the API client talks to the server as. Lives in the API layer so `apiFetch` can attach
 * the headers without importing any feature. Phase 5 adds the auth token here.
 */
interface SessionState {
  /** Anonymous cart UUID, sent as `X-Cart-Id` (FR-CART-01). */
  cartId: string | null;
  setCartId: (cartId: string | null) => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      cartId: null,
      setCartId: (cartId) => set({ cartId }),
    }),
    {
      name: 'furniro-session',
      storage: createJSONStorage(() => localStore),
      partialize: (state) => ({ cartId: state.cartId }),
    },
  ),
);
