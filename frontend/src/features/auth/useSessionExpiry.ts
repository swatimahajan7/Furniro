import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { useSession } from '@/api/session';
import { useToast } from '@/components/ui';

import { forgetUserData } from './api';
import { loginPath } from './redirects';

/**
 * The API client ends the session when the server rejects the token (GUIDELINES §4). This
 * explains why and sends the user to log in, returning them to where they were.
 */
export function useSessionExpiry() {
  const expired = useSession((state) => state.expired);
  const client = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (!expired) return;
    useSession.getState().acknowledgeExpiry();
    forgetUserData(client);
    toast.info('Your session has ended. Please log in again.');
    if (pathname !== '/login') void navigate(loginPath(pathname + search), { replace: true });
  }, [expired, client, toast, navigate, pathname, search]);
}
