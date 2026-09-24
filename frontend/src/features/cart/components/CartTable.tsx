import { Trash2 } from 'lucide-react';
import { Link } from 'react-router';

import type { Cart } from '@/api/types';
import { QuantityStepper, useToast } from '@/components/ui';
import { errorMessage } from '@/lib/errors';
import { formatPrice } from '@/lib/format';
import { testIds } from '@/lib/testIds';
import { mediaSrcSet } from '@/lib/images';

import { useRemoveCartItem, useUpdateCartItem } from '../api';
import { lineOptions } from '../lineOptions';

import styles from './CartTable.module.css';

const MAX_LINE_QUANTITY = 10;

/** The /cart line table (DESIGN_SPEC §4.6). Rows stack into cards on small screens. */
export function CartTable({ cart }: { cart: Cart }) {
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const toast = useToast();
  const busy = update.isPending || remove.isPending;
  const onError = (error: unknown) => toast.error(errorMessage(error));

  return (
    <table className={styles.table} data-testid="cart-table">
      <thead className={styles.head}>
        <tr>
          <th scope="col" className={styles.productCol}>
            Product
          </th>
          <th scope="col">Price</th>
          <th scope="col">Quantity</th>
          <th scope="col">Subtotal</th>
          <th scope="col">
            <span className="visuallyHidden">Remove</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {cart.items.map((item) => {
          const ids = testIds.cartRow(item.id);
          const options = lineOptions(item);
          return (
            <tr key={item.id} className={styles.row} data-testid={ids.root}>
              <td className={styles.product}>
                <Link
                  to={`/product/${item.product.slug}`}
                  className={styles.thumb}
                  // Same target as the name link next to it: skip it for keyboard and screen readers.
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {item.product.image_url && (
                    <img
                      src={item.product.image_url}
                      srcSet={mediaSrcSet(item.product.image_url)}
                      sizes="108px"
                      alt=""
                      width={108}
                      height={108}
                      className={styles.image}
                    />
                  )}
                </Link>
                <div>
                  <Link
                    to={`/product/${item.product.slug}`}
                    className={styles.name}
                    data-testid={ids.link}
                  >
                    {item.product.name}
                  </Link>
                  {options && <p className={styles.options}>{options}</p>}
                </div>
              </td>
              <td className={styles.muted} data-label="Price">
                {formatPrice(item.unit_price_minor)}
              </td>
              <td data-label="Quantity">
                <QuantityStepper
                  value={item.quantity}
                  onChange={(quantity) => update.mutate({ itemId: item.id, quantity }, { onError })}
                  min={1}
                  // The server enforces min(10, stock) and its message is shown as a toast.
                  max={MAX_LINE_QUANTITY}
                  disabled={busy}
                  size="sm"
                  label={`Quantity of ${item.product.name}`}
                  data-testid={ids.qty}
                />
              </td>
              <td className={styles.subtotal} data-label="Subtotal" data-testid={ids.subtotal}>
                {formatPrice(item.line_total_minor)}
              </td>
              <td className={styles.removeCell}>
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() =>
                    remove.mutate(item.id, {
                      onSuccess: () => toast.info(`${item.product.name} removed from your cart`),
                      onError,
                    })
                  }
                  disabled={busy}
                  aria-label={`Remove ${item.product.name} from cart`}
                  data-testid={ids.remove}
                >
                  <Trash2 size={24} />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
