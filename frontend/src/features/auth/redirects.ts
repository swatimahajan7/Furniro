/** Where a login sends the user back to (`?next=`). Only same-site paths are honoured. */
export function safeNext(raw: string | null, fallback = '/account'): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\'))
    return fallback;
  if (raw.startsWith('/login') || raw.startsWith('/register')) return fallback;
  return raw;
}

/** `/login?next=/current/path?query` */
export function loginPath(next: string): string {
  return `/login?next=${encodeURIComponent(next)}`;
}
