import { Link } from 'react-router';

import { cn } from '@/lib/cn';
import { testIds } from '@/lib/testIds';

import styles from './Pagination.module.css';

export interface PaginationProps {
  page: number;
  totalPages: number;
  /** Builds the URL for a page, so every page is a real, shareable link (FR-CAT-07). */
  hrefFor: (page: number) => string;
  /** How many numbered pages to show at once. */
  window?: number;
  className?: string;
  'data-testid'?: string;
}

function visiblePages(page: number, totalPages: number, size: number): number[] {
  const count = Math.min(size, totalPages);
  const start = Math.min(Math.max(page - Math.floor(count / 2), 1), totalPages - count + 1);
  return Array.from({ length: count }, (_, i) => start + i);
}

/** Numbered squares plus Previous/Next (DESIGN_SPEC §3). Renders nothing for a single page. */
export function Pagination({
  page,
  totalPages,
  hrefFor,
  window = 3,
  className,
  'data-testid': testId = 'pagination',
}: PaginationProps) {
  if (totalPages <= 1) return null;
  const ids = testIds.pagination(testId);
  return (
    <nav
      aria-label="Pagination"
      className={cn(styles.pagination, className)}
      data-testid={ids.root}
    >
      {page > 1 && (
        <Link
          to={hrefFor(page - 1)}
          className={cn(styles.item, styles.wide)}
          data-testid={ids.previous}
        >
          Previous
        </Link>
      )}
      {visiblePages(page, totalPages, window).map((n) => (
        <Link
          key={n}
          to={hrefFor(n)}
          className={cn(styles.item, n === page && styles.active)}
          aria-current={n === page ? 'page' : undefined}
          aria-label={`Page ${n}`}
          data-testid={ids.page(n)}
        >
          {n}
        </Link>
      ))}
      {page < totalPages && (
        <Link
          to={hrefFor(page + 1)}
          className={cn(styles.item, styles.wide)}
          data-testid={ids.next}
        >
          Next
        </Link>
      )}
    </nav>
  );
}
