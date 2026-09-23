import { ComingSoon, PageShell } from '@/components/layout';

export default function AccountPage() {
  return (
    <PageShell title="My Account" name="account">
      <ComingSoon phase={5} what="Your account" />
    </PageShell>
  );
}
