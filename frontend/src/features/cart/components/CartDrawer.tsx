import { CircleX, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router';

import { ButtonLink, Drawer, EmptyState, ErrorState, Skeleton, useToast } from '@/components/ui';
import { errorMessage } from '@/lib/errors';
import { formatPrice } from '@/lib/format';
import { testIds } from '@/lib/testIds';

import { useCart, useRemoveCartItem } from '../api';
import { useCartDrawer } from '../cartDrawerStore';
import { lineOptions } from '../lineOptions';

import styles from './CartDrawer.module.css';

/** The slide-in "Shopping Cart" (DESIGN_SPEC §3 CartDrawer, screen 04). Mounted once in AppLayout. */
export function CartDrawer() {
  const { isOpen, close } = useCartDrawer();
  const cart = useCart();
  const remove = useRemoveCartItem();
  const toast = useToast();
  const items = cart.data?.items ?? [];

  const handleRemove = (itemId: number, name: string) =>
    remove.mutate(itemId, {
      onSuccess: () => toast.info(`${name} removed from your cart`),
      onError: (error) => toast.error(errorMessage(error)),
    });

  const footer =
    items.length > 0 && cart.data ? (
      <div className={styles.footer}>
        <p className={styles.subtotal}>
          <span>Subtotal</span>
          <span className={styles.amount} data-testid="cart-drawer-subtotal">
            {formatPrice(cart.data.subtotal_minor)}
          </span>
        </p>
        <div className={styles.buttons}>
          <ButtonLink
            to="/cart"
            variant="pill"
            size="sm"
            onClick={close}
            data-testid="cart-drawer-view-cart"
          >
            Cart
          </ButtonLink>
          <ButtonLink
            to="/checkout"
            variant="pill"
            size="sm"
            onClick={close}
            data-testid="cart-drawer-checkout"
          >
            Checkout
          </ButtonLink>
          <ButtonLink
            to="/compare"
            variant="pill"
            size="sm"
            onClick={close}
            data-testid="cart-drawer-comparison"
          >
            Comparison
          </ButtonLink>
        </div>
      </div>
    ) : undefined;

  return (
    <Drawer
      open={isOpen}
      onClose={close}
      title="Shopping Cart"
      footer={footer}
      data-testid="cart-drawer"
    >
      {cart.isPending ? (
        <div className={styles.loading} aria-busy="true">
          <Skeleton height={105} rounded />
          <Skeleton height={105} rounded />
        </div>
      ) : cart.isError ? (
        <ErrorState onRetry={() => void cart.refetch()} data-testid="cart-drawer-error" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Add something you love and it will show up here."
          action={
            <ButtonLink
              to="/shop"
              variant="outline-primary"
              size="sm"
              onClick={close}
              data-testid="cart-drawer-continue"
            >
              Continue shopping
            </ButtonLink>
          }
          data-testid="cart-drawer-empty"
        />
      ) : (
        <ul className={styles.items} data-testid="cart-drawer-items">
          {items.map((item) => {
            const ids = testIds.cartDrawerItem(item.id);
            const options = lineOptions(item);
            return (
              <li key={item.id} className={styles.item} data-testid={ids.root}>
                <Link to={`/product/${item.product.slug}`} onClick={close} className={styles.thumb}>
                  {item.product.image_url && (
                    <img
                      src={item.product.image_url}
                      alt=""
                      width={105}
                      height={105}
                      className={styles.image}
                    />
                  )}
                </Link>
                <div className={styles.details}>
                  <Link
                    to={`/product/${item.product.slug}`}
                    onClick={close}
                    className={styles.name}
                  >
                    {item.product.name}
                  </Link>
                  {options && <p className={styles.options}>{options}</p>}
                  <p className={styles.line}>
                    <span data-testid={`${ids.root}-qty`}>{item.quantity}</span>
                    <span aria-hidden="true"> X </span>
                    <span className="visuallyHidden"> at </span>
                    <span className={styles.price}>{formatPrice(item.unit_price_minor)}</span>
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => handleRemove(item.id, item.product.name)}
                  disabled={remove.isPending}
                  aria-label={`Remove ${item.product.name} from cart`}
                  data-testid={ids.remove}
                >
                  <CircleX size={20} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Drawer>
  );
}
