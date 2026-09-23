import { ApiError, NetworkError } from '@/api/client';

/** A sentence to show the user for any failed request. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof NetworkError)
    return 'Could not reach the store. Check your connection and try again.';
  return 'Something went wrong. Please try again.';
}
