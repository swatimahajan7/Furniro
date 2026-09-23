import { ComingSoon, PageShell } from '@/components/layout';

export default function LoginPage() {
  return (
    <PageShell title="Log In" name="login">
      <ComingSoon phase={5} what="Signing in" />
    </PageShell>
  );
}
