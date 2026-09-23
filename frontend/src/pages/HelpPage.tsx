import { useParams } from 'react-router';

import { PageShell } from '@/components/layout';
import { findHelpTopic, InfoArticle } from '@/features/content';

import NotFoundPage from './NotFoundPage';

/** Footer "Help" links. Unknown topics fall through to the 404 page. */
export default function HelpPage() {
  const { topic: slug = '' } = useParams();
  const topic = findHelpTopic(slug);
  if (!topic) return <NotFoundPage />;
  return (
    <PageShell
      title={topic.title}
      name={`help-${topic.slug}`}
      crumbs={[{ label: 'Home', to: '/' }, { label: 'Help' }, { label: topic.title }]}
      featureStrip
    >
      <div className="container">
        <InfoArticle topic={topic} />
      </div>
    </PageShell>
  );
}
