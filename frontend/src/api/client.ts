import { env } from '@/lib/env';

import type { ErrorResponse } from './types';

/** A non-2xx API response, parsed from the error envelope (docs/API_CONTRACT.md §1.3). */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ErrorResponse['error']['details'];
  readonly requestId: string | null;

  constructor(
    status: number,
    code: string,
    message: string,
    details: ErrorResponse['error']['details'] = null,
    requestId: string | null = null,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

function isErrorResponse(body: unknown): body is ErrorResponse {
  return typeof body === 'object' && body !== null && 'error' in body;
}

/**
 * Minimal fetch wrapper. Phase 2 extends it with auth/cart headers and query serialisation
 * (frontend/GUIDELINES.md §4).
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers: { Accept: 'application/json', ...init.headers },
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const requestId = response.headers.get('X-Request-Id');
    if (isErrorResponse(body)) {
      const { code, message, details } = body.error;
      throw new ApiError(response.status, code, message, details ?? null, requestId);
    }
    throw new ApiError(
      response.status,
      `HTTP_${response.status}`,
      response.statusText || 'Request failed',
      null,
      requestId,
    );
  }

  return body as T;
}
