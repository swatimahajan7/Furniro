/** Typed access to build-time configuration (see .env.example). */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  disableAnimations: import.meta.env.VITE_DISABLE_ANIMATIONS === 'true',
} as const;

/** True when animations must be off: env flag or `?e2e=1` in the URL (GUIDELINES §6.2). */
export function isE2eMode(search: string = window.location.search): boolean {
  return env.disableAnimations || new URLSearchParams(search).get('e2e') === '1';
}
