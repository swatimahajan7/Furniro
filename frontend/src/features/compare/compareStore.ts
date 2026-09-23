import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { localStore } from '@/lib/storage';

/** Matches `compare_limit` from GET /meta/config and the API's COMPARE_LIMIT_EXCEEDED rule. */
export const COMPARE_LIMIT = 3;

export type AddResult = 'added' | 'exists' | 'full';

interface CompareState {
  /** Product IDs in the order they were added (FR-CMP-01). */
  ids: number[];
  add: (id: number) => AddResult;
  remove: (id: number) => void;
  clear: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],
      add: (id) => {
        const { ids } = get();
        if (ids.includes(id)) return 'exists';
        if (ids.length >= COMPARE_LIMIT) return 'full';
        set({ ids: [...ids, id] });
        return 'added';
      },
      remove: (id) => set({ ids: get().ids.filter((existing) => existing !== id) }),
      clear: () => set({ ids: [] }),
    }),
    {
      name: 'furniro-compare',
      storage: createJSONStorage(() => localStore),
      partialize: (state) => ({ ids: state.ids }),
    },
  ),
);
