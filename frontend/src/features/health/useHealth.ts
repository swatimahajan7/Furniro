import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import type { Health } from '@/api/types';

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: ({ signal }) => apiFetch<Health>('/health', { signal }),
    staleTime: 0,
  });
}
