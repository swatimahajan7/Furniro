import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/api/client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Catalog data changes rarely; cart/orders override this with 0 (GUIDELINES §9).
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      // Never retry client errors (4xx); retry other failures once.
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status < 500) && failureCount < 1,
    },
    mutations: { retry: false },
  },
});
