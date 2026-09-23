import { Component, type ErrorInfo, type ReactNode } from 'react';

import { ErrorState } from '@/components/ui';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Last-resort boundary for crashes outside the router (providers, layout). Route-level errors
 * are handled by RouteErrorPage via the router's errorElement.
 */
export class AppErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error', error, info.componentStack);
  }

  override render() {
    if (this.state.error) {
      return (
        <ErrorState
          title="Furniro hit a problem"
          message="Something unexpected happened. Reloading the page usually fixes it."
          onRetry={() => window.location.reload()}
          data-testid="app-error"
        />
      );
    }
    return this.props.children;
  }
}
