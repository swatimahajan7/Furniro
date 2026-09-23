import { useSearchParams } from 'react-router';

import { PageShell } from '@/components/layout';
import { useToast } from '@/components/ui';
import { OrderHistory, ProfileCard } from '@/features/account';
import { RequireAuth, useCurrentUser, useLogout } from '@/features/auth';

import styles from './AccountPage.module.css';

function Account() {
  const user = useCurrentUser();
  const logout = useLogout();
  const toast = useToast();
  const [params] = useSearchParams();
  const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1);

  if (!user) return null;
  return (
    <div className={`container ${styles.page}`}>
      <ProfileCard
        user={user}
        onLogout={() => {
          logout();
          toast.info('You have been logged out.');
        }}
      />
      <section className={styles.orders} aria-labelledby="orders-title">
        <h2 id="orders-title" className={styles.heading}>
          My orders
        </h2>
        <OrderHistory page={page} hrefFor={(n) => (n === 1 ? '/account' : `/account?page=${n}`)} />
      </section>
    </div>
  );
}

export default function AccountPage() {
  return (
    <PageShell
      title="My Account"
      name="account"
      crumbs={[{ label: 'Home', to: '/' }, { label: 'My Account' }]}
    >
      <RequireAuth>
        <Account />
      </RequireAuth>
    </PageShell>
  );
}
