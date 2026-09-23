import { Spinner } from '@/components/ui';

import styles from './PageLoader.module.css';

/** Full-page loading state while a route's code or data loads. */
export function PageLoader() {
  return (
    <div className={styles.loader} data-testid="page-loader">
      <Spinner size="lg" label="Loading page" />
    </div>
  );
}
