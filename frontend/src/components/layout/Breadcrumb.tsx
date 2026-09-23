import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';
import { Link } from 'react-router';

import { cn } from '@/lib/cn';

import styles from './Breadcrumb.module.css';

export interface Crumb {
  label: string;
  /** Omit on the current (last) page. */
  to?: string;
}

export interface BreadcrumbProps {
  items: Crumb[];
  /** "banner": centred under a page title · "bar": the cream strip on the product page */
  variant?: 'banner' | 'bar';
  className?: string;
  /** Base ID (default `breadcrumb`); items get `${base}-item-1…n`. */
  'data-testid'?: string;
}

/** The last item is the current page. */
export function Breadcrumb({
  items,
  variant = 'banner',
  className,
  'data-testid': testId = 'breadcrumb',
}: BreadcrumbProps) {
  const lastIndex = items.length - 1;
  const content = (
    <ol className={styles.list}>
      {items.map((item, index) => {
        const isCurrent = index === lastIndex;
        const itemTestId = `${testId}-item-${index + 1}`;
        return (
          <Fragment key={`${item.label}-${index}`}>
            {isCurrent && variant === 'bar' && <li className={styles.divider} aria-hidden="true" />}
            <li className={cn(styles.item, isCurrent && styles.current)}>
              {item.to && !isCurrent ? (
                <Link to={item.to} className={styles.link} data-testid={itemTestId}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isCurrent ? 'page' : undefined} data-testid={itemTestId}>
                  {item.label}
                </span>
              )}
            </li>
            {!isCurrent && (
              <li className={styles.separator} aria-hidden="true">
                <ChevronRight size={20} />
              </li>
            )}
          </Fragment>
        );
      })}
    </ol>
  );

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(styles.breadcrumb, styles[variant], className)}
      data-testid={testId}
    >
      {variant === 'bar' ? <div className="container">{content}</div> : content}
    </nav>
  );
}
