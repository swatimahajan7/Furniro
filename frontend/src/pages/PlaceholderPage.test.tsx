import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PlaceholderPage } from './PlaceholderPage';

function mockFetchOnce(status: number, body: unknown) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

describe('PlaceholderPage', () => {
  it('shows the hero title', () => {
    mockFetchOnce(200, { status: 'ok', version: '0.1.0', db: 'ok' });
    render(<PlaceholderPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Discover Our New Collection' }),
    ).toBeInTheDocument();
  });

  it('reports the API as online with its version', async () => {
    mockFetchOnce(200, { status: 'ok', version: '0.1.0', db: 'ok' });
    render(<PlaceholderPage />);

    const status = await screen.findByText(/API online · v0\.1\.0 · database ok/);
    expect(status).toHaveAttribute('data-status', 'online');
  });

  it('reports the API as unreachable when the request fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'));
    render(<PlaceholderPage />);

    const status = await screen.findByText(/API unreachable/);
    expect(status).toHaveAttribute('data-status', 'offline');
  });
});
