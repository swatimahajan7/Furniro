/**
 * Browser storage that never throws (private windows and blocked storage throw on access).
 * Reads fall back to null and writes are ignored when storage is unavailable.
 */
function safe(kind: 'localStorage' | 'sessionStorage'): Storage | null {
  try {
    const store = window[kind];
    const probe = '__furniro_probe__';
    store.setItem(probe, probe);
    store.removeItem(probe);
    return store;
  } catch {
    return null;
  }
}

function wrap(kind: 'localStorage' | 'sessionStorage') {
  return {
    getItem(key: string): string | null {
      try {
        return safe(kind)?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    setItem(key: string, value: string): void {
      try {
        safe(kind)?.setItem(key, value);
      } catch {
        /* storage full or blocked: keep going without persistence */
      }
    },
    removeItem(key: string): void {
      try {
        safe(kind)?.removeItem(key);
      } catch {
        /* ignore */
      }
    },
  };
}

export const localStore = wrap('localStorage');
export const sessionStore = wrap('sessionStorage');
