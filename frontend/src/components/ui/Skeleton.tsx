import { cn } from '@/lib/cn';

import styles from './Skeleton.module.css';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  rounded?: boolean;
  className?: string;
}

/** A pulsing placeholder block shown while content loads. Decorative, so hidden from AT. */
export function Skeleton({ width = '100%', height = 16, rounded, className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(styles.skeleton, rounded && styles.rounded, className)}
      style={{ width, height }}
    />
  );
}
