import { useMutation } from '@tanstack/react-query';

import { apiFetch } from '@/api/client';
import type { ContactReceipt } from '@/api/types';

import type { ContactValues } from './schema';

export function useSendContactMessage() {
  return useMutation({
    mutationFn: ({ subject, ...values }: ContactValues) =>
      apiFetch<ContactReceipt>('/contact', {
        method: 'POST',
        body: { ...values, subject: subject || null },
      }),
  });
}
