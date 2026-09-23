import { useApiHealth } from '@/features/health';

import styles from './PlaceholderPage.module.css';

/** Phase 0 landing page: proves fonts, tokens and the API proxy work. Replaced in Phase 2. */
export function PlaceholderPage() {
  const health = useApiHealth();

  return (
    <main className={styles.page} data-testid="page-placeholder">
      <div className={styles.card}>
        <div className={styles.brand}>
          <img src="/logo-mark.svg" alt="" width={50} height={32} />
          <span className={styles.wordmark}>Furniro</span>
        </div>

        <p className={styles.eyebrow}>New Arrival</p>
        <h1 className={styles.title}>Discover Our New Collection</h1>
        <p className={styles.lead}>
          The Furniro demo store is under construction. Phase 0 (foundation) is in place.
        </p>

        <p className={styles.status} data-testid="api-status" data-status={health.status}>
          <span className={styles.dot} aria-hidden="true" />
          {health.status === 'loading' && 'Checking API…'}
          {health.status === 'online' &&
            `API online · v${health.health.version} · database ${health.health.db}`}
          {health.status === 'offline' && 'API unreachable: start the backend with `make dev`'}
        </p>
      </div>
    </main>
  );
}
