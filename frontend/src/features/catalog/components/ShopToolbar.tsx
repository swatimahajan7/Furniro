import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react';

import { Select } from '@/components/ui';
import { cn } from '@/lib/cn';

import type { ProductPage } from '@/api/types';

import { PAGE_SIZES, SORT_OPTIONS, type ShopParams } from '../shopParams';

import styles from './ShopToolbar.module.css';

export interface ShopToolbarProps {
  params: ShopParams;
  /** Paging info from the response on screen (not the URL), so the text always matches the grid. */
  pageInfo: Pick<ProductPage, 'page' | 'page_size' | 'total'> | undefined;
  activeFilterCount: number;
  onChange: (changes: Partial<ShopParams>) => void;
  onOpenFilters: () => void;
}

const results = (n: number) => `${n} result${n === 1 ? '' : 's'}`;

function resultsText(info: ShopToolbarProps['pageInfo']) {
  if (!info) return 'Loading results…';
  const { page, page_size: pageSize, total } = info;
  if (total === 0) return 'Showing 0 results';
  const from = (page - 1) * pageSize + 1;
  if (from > total) return `No results on page ${page} of ${results(total)}`;
  const to = Math.min(page * pageSize, total);
  return `Showing ${from}–${to} of ${results(total)}`;
}

/** The cream bar above the Shop grid (DESIGN_SPEC §3 ShopToolbar). */
export function ShopToolbar({
  params,
  pageInfo,
  activeFilterCount,
  onChange,
  onOpenFilters,
}: ShopToolbarProps) {
  return (
    <div className={styles.toolbar} data-testid="shop-toolbar">
      <div className={`container ${styles.inner}`}>
        <div className={styles.left}>
          <button
            type="button"
            className={styles.filter}
            onClick={onOpenFilters}
            aria-haspopup="dialog"
            data-testid="shop-filter-button"
          >
            <SlidersHorizontal size={22} aria-hidden="true" />
            Filter
            {activeFilterCount > 0 && (
              <span className={styles.count} data-testid="shop-filter-count">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className={styles.views} role="group" aria-label="View">
            <button
              type="button"
              className={cn(styles.view, params.view === 'grid' && styles.viewActive)}
              onClick={() => onChange({ view: 'grid' })}
              aria-pressed={params.view === 'grid'}
              aria-label="Grid view"
              data-testid="shop-view-grid"
            >
              <LayoutGrid size={22} />
            </button>
            <button
              type="button"
              className={cn(styles.view, params.view === 'list' && styles.viewActive)}
              onClick={() => onChange({ view: 'list' })}
              aria-pressed={params.view === 'list'}
              aria-label="List view"
              data-testid="shop-view-list"
            >
              <List size={22} />
            </button>
          </div>
          <span className={styles.divider} aria-hidden="true" />
          <p className={styles.results} aria-live="polite" data-testid="shop-results-text">
            {resultsText(pageInfo)}
          </p>
        </div>

        <div className={styles.right}>
          <Select
            label="Show"
            variant="compact"
            className={styles.control}
            value={String(params.pageSize)}
            onChange={(event) => onChange({ pageSize: Number(event.target.value) })}
            options={PAGE_SIZES.map((size) => ({ value: String(size), label: String(size) }))}
            data-testid="shop-page-size-select"
          />
          <Select
            label="Sort by"
            variant="compact"
            className={cn(styles.control, styles.sort)}
            value={params.sort}
            onChange={(event) => onChange({ sort: event.target.value as ShopParams['sort'] })}
            options={SORT_OPTIONS}
            data-testid="shop-sort-select"
          />
        </div>
      </div>
    </div>
  );
}
