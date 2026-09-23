import { Navigate, useSearchParams } from 'react-router';

import { PageShell } from '@/components/layout';
import { useToast } from '@/components/ui';
import { LoginForm, safeNext, useIsLoggedIn } from '@/features/auth';

import styles from './AuthPage.module.css';

export default function LoginPage() {
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const isLoggedIn = useIsLoggedIn();
  const toast = useToast();

  return (
    <PageShell
      title="Log In"
      name="login"
      crumbs={[{ label: 'Home', to: '/' }, { label: 'Log In' }]}
    >
      <div className={`container ${styles.page}`}>
        {/* Already logged in, or just did: go where the user was heading (?next=). */}
        {isLoggedIn ? (
          <Navigate to={next} replace />
        ) : (
          <LoginForm next={next} onSuccess={() => toast.success('Welcome back!')} />
        )}
      </div>
    </PageShell>
  );
}
