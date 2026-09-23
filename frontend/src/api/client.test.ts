import { describe, expect, it, vi } from 'vitest';

import { ApiError, apiFetch } from './client';

function respond(status: number, body: unknown, headers: Record<string, string> = {}) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json', ...headers },
    }),
  );
}

describe('apiFetch', () => {
  it('prefixes the API base URL and returns the parsed body', async () => {
    respond(200, { ok: true });

    await expect(apiFetch('/health')).resolves.toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith('/api/v1/health', expect.any(Object));
  });

  it('throws ApiError built from the error envelope', async () => {
    respond(
      404,
      { error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found', request_id: 'r1' } },
      { 'X-Request-Id': 'r1' },
    );

    const error = await apiFetch('/products/nope').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 404,
      code: 'PRODUCT_NOT_FOUND',
      message: 'Product not found',
      requestId: 'r1',
    });
  });

  it('falls back to an HTTP_<status> code when the body is not an envelope', async () => {
    respond(503, { status: 'degraded' });

    await expect(apiFetch('/health')).rejects.toMatchObject({ status: 503, code: 'HTTP_503' });
  });
});
