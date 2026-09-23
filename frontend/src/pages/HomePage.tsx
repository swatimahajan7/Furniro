import { ComingSoon, PageShell } from '@/components/layout';

export default function HomePage() {
  return (
    <PageShell title="Home" banner={false}>
      <ComingSoon phase={3} what="The home page" />
    </PageShell>
  );
}
