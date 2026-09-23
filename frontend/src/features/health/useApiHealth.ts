import { useEffect, useState } from 'react';

import { apiFetch } from '@/api/client';
import type { Health } from '@/api/types';

export type ApiHealthState =
  { status: 'loading' } | { status: 'online'; health: Health } | { status: 'offline' };

/**
 * Phase 0 placeholder hook. Phase 2 replaces it with a TanStack Query hook, which is the
 * standard way to fetch data (frontend/GUIDELINES.md §3).
 */
export function useApiHealth(): ApiHealthState {
  const [state, setState] = useState<ApiHealthState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    apiFetch<Health>('/health')
      .then((health) => {
        if (!cancelled) setState({ status: 'online', health });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'offline' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
