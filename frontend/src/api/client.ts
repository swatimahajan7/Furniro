import { env } from '@/lib/env';

import { useSession } from './session';
import type { ErrorResponse } from './types';

/** A non-2xx API response, parsed from the error envelope (docs/API_CONTRACT.md §1.3). */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: NonNullable<ErrorResponse['error']['details']>;
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
    this.details = details ?? [];
    this.requestId = requestId;
  }
}

/** Network failure (no response at all), so UIs can say "check your connection". */
export class NetworkError extends Error {
  constructor(cause: unknown) {
    super('Network request failed', { cause });
    this.name = 'NetworkError';
  }
}

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | readonly QueryValue[]>;

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  /** Appended as a query string; arrays become repeated keys (?category=a&category=b). */
  query?: QueryParams;
  /** Serialised as JSON. */
  body?: unknown;
}

export function buildQueryString(query: QueryParams = {}): string {
  const params = new URLSearchParams();
  for (const [key, raw] of Object.entries(query)) {
    const values: readonly QueryValue[] = Array.isArray(raw) ? raw : [raw as QueryValue];
    for (const value of values) {
      if (value !== undefined && value !== null && value !== '') params.append(key, String(value));
    }
  }
  const text = params.toString();
  return text ? `?${text}` : '';
}

function isErrorResponse(body: unknown): body is ErrorResponse {
  return typeof body === 'object' && body !== null && 'error' in body;
}

/**
 * The single way the app talks to the API. Attaches `X-Cart-Id` from the session store (the
 * Authorization header joins it in Phase 5). Components call feature hooks, never this directly.
 */
export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { query, body, headers, ...init } = options;
  const requestHeaders = new Headers(headers);
  requestHeaders.set('Accept', 'application/json');
  const { cartId } = useSession.getState();
  if (cartId && !requestHeaders.has('X-Cart-Id')) requestHeaders.set('X-Cart-Id', cartId);
  if (body !== undefined) requestHeaders.set('Content-Type', 'application/json');

  let response: Response;
  try {
    response = await fetch(`${env.apiBaseUrl}${path}${buildQueryString(query)}`, {
      ...init,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new NetworkError(error);
  }

  if (response.status === 204) return undefined as T;
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const requestId = response.headers.get('X-Request-Id');
    if (isErrorResponse(payload)) {
      const { code, message, details } = payload.error;
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

  // Trust boundary: the response shape is guaranteed by the OpenAPI contract (AD-2).
  return payload as T;
}
