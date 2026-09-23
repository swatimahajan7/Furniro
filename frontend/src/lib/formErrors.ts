import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

import { ApiError } from '@/api/client';

import { errorMessage } from './errors';

/**
 * Put a failed request's `details[]` onto the matching form fields (GUIDELINES §4) and focus
 * the first one. Returns the message for a form-level alert, or null when every problem was
 * shown next to a field.
 */
export function applyApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly string[],
  /** API field name → form field name, e.g. "billing.email" → "email". */
  toField: (apiField: string) => string = (name) => name,
): string | null {
  if (!(error instanceof ApiError) || error.details.length === 0) return errorMessage(error);
  let focused = false;
  const unmatched: string[] = [];
  for (const detail of error.details) {
    const name = toField(detail.field ?? '');
    if (!fields.includes(name)) {
      unmatched.push(detail.message);
      continue;
    }
    setError(name as Path<T>, { message: detail.message }, { shouldFocus: !focused });
    focused = true;
  }
  if (unmatched.length > 0) return unmatched.join(' ');
  return focused ? null : error.message;
}
