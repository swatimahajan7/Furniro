import { TriangleAlert } from 'lucide-react';

import { cn } from '@/lib/cn';

import { Button } from './Button';
import styles from './StateMessage.module.css';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  /** Base ID: the retry button gets `${base}-retry`. */
  'data-testid'?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this content. Please check your connection and try again.',
  onRetry,
  className,
  'data-testid': testId = 'error-state',
}: ErrorStateProps) {
  return (
    <div className={cn(styles.state, className)} role="alert" data-testid={testId}>
      <TriangleAlert className={styles.icon} size={48} strokeWidth={1.5} aria-hidden="true" />
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.message}>{message}</p>
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
