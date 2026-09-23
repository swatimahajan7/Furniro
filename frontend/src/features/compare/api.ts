import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import type { CompareResponse } from '@/api/types';

import { useCompareStore } from './compareStore';

/** The comparison table for the stored IDs (FR-CMP-02). Idle while the list is empty. */
export function useComparison() {
  const ids = useCompareStore((state) => state.ids);
  return useQuery({
    queryKey: queryKeys.products.compare(ids),
    queryFn: ({ signal }) =>
      apiFetch<CompareResponse>('/products/compare', { query: { ids: ids.join(',') }, signal }),
    enabled: ids.length > 0,
    // Keep the old table on screen while a column is added or removed.
    placeholderData: keepPreviousData,
  });
}
