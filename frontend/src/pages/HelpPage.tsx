import { useParams } from 'react-router';

import { ComingSoon, PageShell } from '@/components/layout';

import NotFoundPage from './NotFoundPage';

/** Footer "Help" links. Unknown topics fall through to the 404 page. */
const TOPICS: Record<string, string> = {
  'payment-options': 'Payment Options',
  returns: 'Returns',
  'privacy-policy': 'Privacy Policy',
};

export default function HelpPage() {
  const { topic = '' } = useParams();
  const title = TOPICS[topic];
  if (!title) return <NotFoundPage />;
  return (
    <PageShell
      title={title}
      name={`help-${topic}`}
      crumbs={[{ label: 'Home', to: '/' }, { label: 'Help' }, { label: title }]}
      featureStrip
    >
      <ComingSoon phase={6} what={title} />
    </PageShell>
  );
}
