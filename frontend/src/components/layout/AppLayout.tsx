import { Outlet, ScrollRestoration, useNavigation } from 'react-router';

import styles from './AppLayout.module.css';
import { Footer } from './Footer';
import { Header } from './Header';

/** Root layout for every route: skip link, header, page, footer. */
export function AppLayout() {
  const navigation = useNavigation();
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
      <Header />
      <main id="main-content" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      {/* Keyed by pathname so query-only changes (e.g. /shop?page=2) keep the scroll position. */}
      <ScrollRestoration getKey={(location) => location.pathname} />
    </>
  );
}
