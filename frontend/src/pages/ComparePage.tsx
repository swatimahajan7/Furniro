import { ArrowLeftRight } from 'lucide-react';

import { PageShell } from '@/components/layout';
import { Button, EmptyState, ErrorState, Skeleton, useToast } from '@/components/ui';
import { useProductActions, useProducts } from '@/features/catalog';
import {
  AddProductSelect,
  COMPARE_LIMIT,
  CompareTable,
  useCompareStore,
  useComparison,
} from '@/features/compare';

import styles from './ComparePage.module.css';

/** Every product fits in one page (32), so the picker can list them all (FR-CMP-03). */
const ALL_PRODUCTS = { page_size: 32, sort: 'name_asc' } as const;

export default function ComparePage() {
  const ids = useCompareStore((state) => state.ids);
  const add = useCompareStore((state) => state.add);
  const remove = useCompareStore((state) => state.remove);
  const clear = useCompareStore((state) => state.clear);
  const comparison = useComparison();
  const catalog = useProducts(ALL_PRODUCTS);
  const actions = useProductActions();
  const toast = useToast();

  const options = (catalog.data?.items ?? [])
    .filter((product) => !ids.includes(product.id))
    .map((product) => ({ id: product.id, name: product.name }));
  const picker = (
    <AddProductSelect options={options} onSelect={add} isLoading={catalog.isPending} />
  );

  let content;
  if (ids.length === 0) {
    content = (
      <div className={styles.empty}>
        <EmptyState
          icon={ArrowLeftRight}
          title="Nothing to compare yet"
          message={`Pick up to ${COMPARE_LIMIT} products to see their specs side by side.`}
          data-testid="compare-empty"
        />
        <div className={styles.emptyPicker}>{picker}</div>
      </div>
    );
  } else if (comparison.isError) {
    content = (
      <div className={styles.empty}>
        <ErrorState
          message="We could not load this comparison. A product may no longer be available."
          onRetry={() => void comparison.refetch()}
          data-testid="compare-error"
        />
        <Button variant="outline-dark" size="sm" onClick={clear} data-testid="compare-clear">
          Start over
        </Button>
      </div>
    );
  } else if (!comparison.data) {
    content = (
      <div aria-busy="true" data-testid="compare-loading">
        <Skeleton height={640} rounded />
      </div>
    );
  } else {
    const isFull = ids.length >= COMPARE_LIMIT;
    content = (
      <>
        <CompareTable
          data={comparison.data}
          onRemove={(product) => {
            remove(product.id);
            toast.info(`${product.name} removed from the comparison`);
          }}
          onAddToCart={(product) => void actions.addToCart(product)}
          addingId={actions.addingId}
          addSlot={isFull ? undefined : picker}
          isRefreshing={comparison.isPlaceholderData}
        />
        {isFull && (
          <p className={styles.full} data-testid="compare-full">
            You are comparing the maximum of {COMPARE_LIMIT} products. Remove one to add another.
          </p>
        )}
      </>
    );
  }

  return (
    <PageShell
      title="Product Comparison"
      name="compare"
      crumbs={[{ label: 'Home', to: '/' }, { label: 'Comparison' }]}
      featureStrip
    >
      <div className={`container ${styles.page}`}>{content}</div>
    </PageShell>
  );
}
