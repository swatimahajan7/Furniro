import { PageShell } from '@/components/layout';
import { AboutContent } from '@/features/content';

export default function AboutPage() {
  return (
    <PageShell title="About" featureStrip>
      <div className="container">
        <AboutContent />
      </div>
    </PageShell>
  );
}
