import { ComingSoon, PageShell } from '@/components/layout';

export default function AboutPage() {
  return (
    <PageShell title="About" featureStrip>
      <ComingSoon phase={6} what="The About page" />
    </PageShell>
  );
}
