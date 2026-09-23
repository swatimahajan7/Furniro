import { SearchX, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { PageShell } from '@/components/layout';
import { Button, ButtonLink, EmptyState, ErrorState, Pagination } from '@/components/ui';
import {
  countActiveFilters,
  FilterDrawer,
  ProductGrid,
  ShopToolbar,
  toApiQuery,
  useProducts,
  useShopParams,
} from '@/features/catalog';

import styles from './ShopPage.module.css';

export default function ShopPage() {
  const { params, update, hrefForPage } = useShopParams();
  const products = useProducts(toApiQuery(params));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const activeFilters = countActiveFilters(params);

  // Changing page scrolls back to the top of the results; filters and sort keep the position.
  const previousPage = useRef(params.page);
  useEffect(() => {
    if (previousPage.current !== params.page) {
      resultsRef.current?.scrollIntoView({ block: 'start' });
      previousPage.current = params.page;
    }
  }, [params.page]);

  const data = products.data;
  const clearFilters = () =>
    update({
      categories: [],
      rooms: [],
      onSale: false,
      isNew: false,
      minPrice: null,
      maxPrice: null,
      q: '',
    });

  let content;
  if (products.isError) {
    content = <ErrorState onRetry={() => void products.refetch()} data-testid="shop-error" />;
  } else if (data && data.total === 0) {
    content = (
      <EmptyState
        icon={SearchX}
        title="No products match"
        message="Try removing a filter or searching for something else."
        action={
          <Button
            variant="outline-primary"
            size="sm"
            onClick={clearFilters}
            data-testid="shop-clear-filters"
          >
            Clear filters
          </Button>
        }
        data-testid="shop-empty"
      />
    );
  } else if (data && data.items.length === 0) {
    content = (
      <EmptyState
        title={`There is no page ${params.page}`}
        message={`These results end at page ${data.total_pages}.`}
        action={
          <ButtonLink
            to={hrefForPage(1)}
            variant="outline-primary"
            size="sm"
            data-testid="shop-first-page"
          >
            Go to page 1
          </ButtonLink>
        }
        data-testid="shop-page-out-of-range"
      />
    );
  } else {
    content = (
      <>
        <ProductGrid
          products={data?.items}
          isLoading={products.isPending}
          skeletonCount={params.pageSize > 16 ? 16 : params.pageSize}
          view={params.view}
          isRefreshing={products.isPlaceholderData}
          data-testid="shop-products"
        />
        {data && (
          <Pagination
            page={params.page}
            totalPages={data.total_pages}
            hrefFor={hrefForPage}
            className={styles.pagination}
            data-testid="shop-pagination"
          />
        )}
      </>
    );
  }

  return (
    <PageShell title="Shop" showMark={false} featureStrip>
      <div ref={resultsRef} className={styles.anchor}>
        <ShopToolbar
          params={params}
          pageInfo={data}
          activeFilterCount={activeFilters}
          onChange={update}
          onOpenFilters={() => setFiltersOpen(true)}
        />
      </div>
      <section className={`container ${styles.results}`} aria-label="Products">
        {params.q && (
          <p className={styles.search} data-testid="shop-search-summary">
            Results for “{params.q}”
            <button
              type="button"
              className={styles.clearSearch}
              onClick={() => update({ q: '' })}
              aria-label="Clear search"
              data-testid="shop-search-clear"
            >
              <X size={16} />
            </button>
          </p>
        )}
        {content}
      </section>
      <FilterDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        params={params}
        onApply={update}
      />
    </PageShell>
  );
}
