import { Inbox, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import styles from './StateMessage.module.css';

export interface EmptyStateProps {
  title: string;
  message?: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export function EmptyState({
  title,
  message,
  icon: Icon = Inbox,
  action,
  className,
  'data-testid': testId,
}: EmptyStateProps) {
  return (
    <div className={cn(styles.state, className)} data-testid={testId}>
      <Icon className={styles.icon} size={48} strokeWidth={1.5} aria-hidden="true" />
      <h2 className={styles.title}>{title}</h2>
      {message && <p className={styles.message}>{message}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
