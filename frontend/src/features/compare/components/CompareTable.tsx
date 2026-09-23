import type { ReactNode } from 'react';
import { Link } from 'react-router';

import type { CompareResponse, ProductSummary } from '@/api/types';
import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';
import { testIds } from '@/lib/testIds';

import styles from './CompareTable.module.css';
import { CompareColumnHead } from './CompareColumnHead';

export interface CompareTableProps {
  data: CompareResponse;
  onRemove: (product: ProductSummary) => void;
  onAddToCart: (product: ProductSummary) => void;
  /** The product whose Add To Cart is in flight, if any. */
  addingId: number | null;
  /** The "Add A Product" picker; its column is left out when the list is full. */
  addSlot?: ReactNode;
  /** Dims the table while the next comparison loads over it. */
  isRefreshing?: boolean;
}

/** DESIGN_SPEC §4.5: products as columns, spec groups as row groups, "—" for missing values. */
export function CompareTable({
  data,
  onRemove,
  onAddToCart,
  addingId,
  addSlot,
  isRefreshing = false,
}: CompareTableProps) {
  const { products, groups } = data;
  const extra = addSlot ? <td className={styles.cell} /> : null;

  return (
    <div className={styles.scroll}>
      <table
        className={cn(styles.table, isRefreshing && styles.refreshing)}
        aria-busy={isRefreshing || undefined}
        data-testid="compare-table"
        data-count={products.length}
      >
        <caption className="visuallyHidden">Product comparison</caption>
        <thead>
          <tr className={styles.headRow}>
            <td className={styles.intro}>
              <p className={styles.introText}>Go to Product page for more Products</p>
              <Link to="/shop" className={styles.viewMore} data-testid="compare-view-more">
                View More
              </Link>
            </td>
            {products.map((product) => (
              <CompareColumnHead key={product.id} product={product} onRemove={onRemove} />
            ))}
            {addSlot && <td className={styles.addCell}>{addSlot}</td>}
          </tr>
        </thead>
        {groups.map((group) => (
          <tbody key={group.name} data-testid={testIds.compareGroup(group.name)}>
            <tr>
              <th scope="rowgroup" className={styles.group}>
                {group.name}
              </th>
              {products.map((product) => (
                <td key={product.id} className={styles.cell} />
              ))}
              {extra}
            </tr>
            {group.rows.map((row) => (
              <tr key={row.label} data-testid={testIds.compareRow(row.label)}>
                <th scope="row" className={styles.label}>
                  {row.label}
                </th>
                {products.map((product, index) => (
                  <td key={product.id} className={styles.cell}>
                    {row.values[index] ?? <span aria-label="Not specified">—</span>}
                  </td>
                ))}
                {extra}
              </tr>
            ))}
          </tbody>
        ))}
        <tfoot>
          <tr>
            <td />
            {products.map((product) => (
              <td key={product.id} className={cn(styles.cell, styles.buy)}>
                <Button
                  className={styles.addToCart}
                  onClick={() => onAddToCart(product)}
                  disabled={!product.in_stock}
                  isLoading={addingId === product.id}
                  aria-label={`Add ${product.name} to cart`}
                  data-testid={testIds.compareColumn(product.slug).addToCart}
                >
                  {product.in_stock ? 'Add To Cart' : 'Out of stock'}
                </Button>
              </td>
            ))}
            {extra}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
