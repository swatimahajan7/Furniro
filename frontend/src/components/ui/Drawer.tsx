import { X } from 'lucide-react';
import { useEffect, useEffectEvent, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/cn';

import styles from './Drawer.module.css';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  hideTitle?: boolean;
  side?: 'left' | 'right' | 'top';
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** Base ID: the panel gets it, plus `${base}-close` and `${base}-backdrop`. */
  'data-testid'?: string;
}

/**
 * Modal side panel (cart drawer, mobile nav, filters, search). Traps focus, closes on Esc and
 * backdrop click, locks page scroll, and returns focus to whatever opened it.
 */
export function Drawer({
  open,
  onClose,
  title,
  hideTitle = false,
  side = 'right',
  children,
  footer,
  className,
  'data-testid': testId,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const close = useEffectEvent(onClose);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = panelRef.current;
    const focusables = () =>
      panel ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)) : [];
    (focusables()[0] ?? panel)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) {
        event.preventDefault();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) return null;

  const part = (name: string) => (testId ? `${testId}-${name}` : undefined);

  return createPortal(
    <div className={styles.root}>
      <div
        className={styles.backdrop}
        onClick={onClose}
        aria-hidden="true"
        data-testid={part('backdrop')}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(styles.panel, styles[side], className)}
        data-testid={testId}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={cn(styles.title, hideTitle && 'visuallyHidden')}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label={`Close ${title}`}
            data-testid={part('close')}
          >
            <X size={22} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
