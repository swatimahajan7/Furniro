import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { useIsLoggedIn } from '../api';
import { loginPath } from '../redirects';

/** Guards /account and /wishlist: guests go to login and come back afterwards. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const isLoggedIn = useIsLoggedIn();
  const location = useLocation();
  if (!isLoggedIn) return <Navigate to={loginPath(location.pathname + location.search)} replace />;
  return children;
}
