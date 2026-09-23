import { useMutation, useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import type { Order } from '@/api/types';

import { rememberOrderEmail } from './recentOrders';
import type { CheckoutValues } from './schema';

/** Places the order from the current cart (the API client adds X-Cart-Id). */
export function usePlaceOrder() {
  return useMutation({
    mutationFn: ({ payment_method, ...billing }: CheckoutValues) =>
      apiFetch<Order>('/orders', {
        method: 'POST',
        body: {
          billing: {
            ...billing,
            company: billing.company || null,
            notes: billing.notes || null,
          },
          payment_method,
        },
      }),
    onSuccess: (order) => rememberOrderEmail(order.order_number, order.billing.email),
  });
}

/** Looks up an order with the email used at checkout (GET /orders/{n}?email=). */
export function useOrder(orderNumber: string, email: string | null) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderNumber, email ?? ''),
    queryFn: ({ signal }) =>
      apiFetch<Order>(`/orders/${encodeURIComponent(orderNumber)}`, { query: { email }, signal }),
    enabled: Boolean(orderNumber && email),
    staleTime: Infinity,
    retry: false,
  });
}
