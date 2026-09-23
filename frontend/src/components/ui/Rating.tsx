import { Star, StarHalf } from 'lucide-react';

import { cn } from '@/lib/cn';

import styles from './Rating.module.css';

export interface RatingProps {
  /** 0–5; rounded to the nearest half star for display. */
  value: number;
  size?: number;
  className?: string;
  'data-testid'?: string;
}

export function Rating({ value, size = 20, className, 'data-testid': testId }: RatingProps) {
  const halves = Math.round(Math.min(Math.max(value, 0), 5) * 2);
  return (
    <span
      className={cn(styles.rating, className)}
      role="img"
      aria-label={`Rated ${value.toFixed(1)} out of 5`}
      data-testid={testId}
      data-value={value}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const kind = halves >= star * 2 ? 'full' : halves === star * 2 - 1 ? 'half' : 'empty';
        return (
          <span key={star} className={styles.star}>
            <Star size={size} className={kind === 'full' ? styles.filled : styles.empty} />
            {kind === 'half' && (
              <StarHalf size={size} className={cn(styles.filled, styles.overlay)} />
            )}
          </span>
        );
      })}
    </span>
  );
}
