import { createContext, use } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastApi {
  show: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

/** Shows a toast for 4 s (with a close button). Must be used under <ToastProvider>. */
export function useToast(): ToastApi {
  const api = use(ToastContext);
  if (!api) throw new Error('useToast must be used inside <ToastProvider>');
  return api;
}
