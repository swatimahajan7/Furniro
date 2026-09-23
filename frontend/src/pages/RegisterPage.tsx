import { Navigate, useSearchParams } from 'react-router';

import { PageShell } from '@/components/layout';
import { useToast } from '@/components/ui';
import { RegisterForm, safeNext, useIsLoggedIn } from '@/features/auth';

import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const isLoggedIn = useIsLoggedIn();
  const toast = useToast();

  return (
    <PageShell
      title="Create Account"
      name="register"
      crumbs={[{ label: 'Home', to: '/' }, { label: 'Create Account' }]}
    >
      <div className={`container ${styles.page}`}>
        {isLoggedIn ? (
          <Navigate to={next} replace />
        ) : (
          <RegisterForm next={next} onSuccess={() => toast.success('Your account is ready.')} />
        )}
      </div>
    </PageShell>
  );
}
