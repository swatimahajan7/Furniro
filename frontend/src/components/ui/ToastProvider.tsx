import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

import { ToastContext, type ToastApi, type ToastVariant } from './toastContext';
import styles from './ToastProvider.module.css';

const DURATION_MS = 4000;
const ICONS = { success: CircleCheck, error: CircleAlert, info: Info } as const;

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // A counter, not random IDs, so the UI stays deterministic (GUIDELINES §6.3).
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, variant }]);
      window.setTimeout(() => dismiss(id), DURATION_MS);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (message) => show(message, 'success'),
      error: (message) => show(message, 'error'),
      info: (message) => show(message, 'info'),
    }),
    [show],
  );

  return (
    <ToastContext value={api}>
      {children}
      <div className={styles.region} role="status" aria-live="polite" data-testid="toast-region">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.variant];
          return (
            <div
              key={toast.id}
              className={cn(styles.toast, styles[toast.variant])}
              data-testid={`toast-${toast.variant}`}
            >
              <Icon size={20} aria-hidden="true" />
              <p className={styles.message}>{toast.message}</p>
              <button
                type="button"
                className={styles.close}
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                data-testid="toast-close"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext>
  );
}
