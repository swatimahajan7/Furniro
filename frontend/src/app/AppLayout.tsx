import { Outlet, ScrollRestoration, useNavigation } from 'react-router';

import { Footer, Header } from '@/components/layout';
import { CartDrawer, useCart, useCartDrawer } from '@/features/cart';

import styles from './AppLayout.module.css';

/**
 * Root layout for every route: skip link, header, page, footer, and the cart drawer.
 * It lives in `app/` because it wires features (the cart) into the layout components.
 */
export function AppLayout() {
  const navigation = useNavigation();
  const cart = useCart();
  const openCart = useCartDrawer((state) => state.open);
  const isNavigating = navigation.state !== 'idle';

  return (
    <>
      <a href="#main-content" className={styles.skipLink} data-testid="skip-to-content">
        Skip to content
      </a>
      {isNavigating && (
        <div
          className={styles.progress}
          role="progressbar"
          aria-label="Loading page"
          data-testid="route-progress"
        />
      )}
      <Header cartCount={cart.data?.item_count ?? 0} onCartClick={openCart} />
      <main id="main-content" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      {/* Keyed by pathname so query-only changes (e.g. /shop?page=2) keep the scroll position. */}
      <ScrollRestoration getKey={(location) => location.pathname} />
    </>
  );
}
