import { sessionStore } from '@/lib/storage';

/**
 * Guests need the checkout email to look an order up. Remember it for this browser tab so the
 * confirmation page survives a refresh, without putting the email in the URL.
 */
const KEY = 'furniro-recent-orders';

function read(): Record<string, string> {
  try {
    const raw = sessionStore.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function rememberOrderEmail(orderNumber: string, email: string): void {
  sessionStore.setItem(KEY, JSON.stringify({ ...read(), [orderNumber]: email }));
}

export function recallOrderEmail(orderNumber: string): string | null {
  return read()[orderNumber] ?? null;
}
