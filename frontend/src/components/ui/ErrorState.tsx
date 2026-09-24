import { TriangleAlert } from 'lucide-react';

import { cn } from '@/lib/cn';

import { Button } from './Button';
import styles from './StateMessage.module.css';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  /** Small inline version for side panels and page sections: no heading, small icon. */
  compact?: boolean;
  className?: string;
  /** Base ID: the retry button gets `${base}-retry`. */
  'data-testid'?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this content. Please check your connection and try again.',
  onRetry,
  compact = false,
  className,
  'data-testid': testId = 'error-state',
}: ErrorStateProps) {
  return (
    <div
      className={cn(styles.state, compact && styles.compact, className)}
      role="alert"
      data-testid={testId}
    >
      <TriangleAlert
        className={styles.icon}
        size={compact ? 24 : 48}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      {compact ? (
        <p className={styles.message}>{message}</p>
      ) : (
        <>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.message}>{message}</p>
        </>
      )}
      {onRetry && (
        <div className={styles.action}>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={onRetry}
            data-testid={`${testId}-retry`}
          >
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
