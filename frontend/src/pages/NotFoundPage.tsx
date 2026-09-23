import { SearchX } from 'lucide-react';

import { PageShell } from '@/components/layout';
import { ButtonLink, EmptyState } from '@/components/ui';

export default function NotFoundPage() {
  return (
    <PageShell title="Page Not Found" name="not-found">
      <div className="container">
        <EmptyState
          icon={SearchX}
          title="We couldn’t find that page"
          message="The link may be broken, or the page may have moved."
          action={
            <ButtonLink to="/" variant="primary" data-testid="not-found-home">
              Back to home
            </ButtonLink>
          }
          data-testid="not-found"
        />
      </div>
    </PageShell>
  );
}
