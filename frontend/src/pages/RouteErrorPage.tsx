import { isRouteErrorResponse, useRouteError } from 'react-router';

import { ErrorState } from '@/components/ui';

import NotFoundPage from './NotFoundPage';

/** Router errorElement: 404 responses show the not-found page, anything else a retry. */
export default function RouteErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;

  console.error('Route error', error);
  return (
    <div className="container" data-testid="page-route-error">
      <title>Something went wrong | Furniro</title>
      <ErrorState
        message="This page failed to load. It may be a connection problem; please try again."
        onRetry={() => window.location.reload()}
        data-testid="route-error"
      />
    </div>
  );
}
