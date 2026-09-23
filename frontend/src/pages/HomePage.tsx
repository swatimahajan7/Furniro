import { PageShell } from '@/components/layout';
import { BrowseRange, Hero, InspirationSlider, OurProducts, SetupGallery } from '@/features/home';

export default function HomePage() {
  return (
    <PageShell title="Home" banner={false} srHeading={false}>
      <Hero />
      <BrowseRange />
      <OurProducts />
      <InspirationSlider />
      <SetupGallery />
    </PageShell>
  );
}
