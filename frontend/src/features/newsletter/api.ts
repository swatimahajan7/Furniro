import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';

import { ApiError, apiFetch } from '@/api/client';
import type { NewsletterSubscription } from '@/api/types';
import { useToast } from '@/components/ui';
import { errorMessage } from '@/lib/errors';

/** What the footer form should do next: clear the field, or show an error under it. */
export type SubscribeResult = { ok: true } | { ok: false; fieldError?: string };

/**
 * Footer newsletter sign-up (FR-NEWS-01). A duplicate email is not an error for the visitor:
 * they are told they are already on the list and the field is cleared.
 */
export function useSubscribe() {
  const toast = useToast();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (email: string) =>
      apiFetch<NewsletterSubscription>('/newsletter/subscribe', {
        method: 'POST',
        body: { email },
      }),
  });

  const subscribe = useCallback(
    async (email: string): Promise<SubscribeResult> => {
      try {
        await mutateAsync(email);
        toast.success('Thanks for subscribing! Look out for our next newsletter.');
        return { ok: true };
      } catch (error) {
        if (error instanceof ApiError && error.code === 'ALREADY_SUBSCRIBED') {
          toast.info('You are already subscribed to our newsletter.');
          return { ok: true };
        }
        if (error instanceof ApiError && error.code === 'VALIDATION_ERROR') {
          return { ok: false, fieldError: error.details[0]?.message ?? error.message };
        }
        toast.error(errorMessage(error));
        return { ok: false };
      }
    },
    [mutateAsync, toast],
  );

  return { subscribe, isSubscribing: isPending };
}
