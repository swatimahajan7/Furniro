import { ComingSoon, PageShell } from '@/components/layout';

export default function BlogPage() {
  return (
    <PageShell title="Blog" featureStrip>
      <ComingSoon phase={6} what="The blog" />
    </PageShell>
  );
}
