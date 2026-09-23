import { createBrowserRouter, type RouteObject } from 'react-router';

import { AppLayout, PageLoader } from '@/components/layout';
import NotFoundPage from '@/pages/NotFoundPage';
import RouteErrorPage from '@/pages/RouteErrorPage';

type PageModule = { default: React.ComponentType };

/** Lazy-load a page module so every route is its own chunk (GUIDELINES §5, §9). */
const page = (load: () => Promise<PageModule>): Pick<RouteObject, 'lazy'> => ({
  lazy: async () => ({ Component: (await load()).default }),
});

const routes: RouteObject[] = [
  { index: true, ...page(() => import('@/pages/HomePage')) },
  { path: 'shop', ...page(() => import('@/pages/ShopPage')) },
  { path: 'product/:slug', ...page(() => import('@/pages/ProductPage')) },
  { path: 'compare', ...page(() => import('@/pages/ComparePage')) },
  { path: 'cart', ...page(() => import('@/pages/CartPage')) },
  { path: 'checkout', ...page(() => import('@/pages/CheckoutPage')) },
  { path: 'order/:orderNumber', ...page(() => import('@/pages/OrderConfirmationPage')) },
  { path: 'blog', ...page(() => import('@/pages/BlogPage')) },
  { path: 'blog/:slug', ...page(() => import('@/pages/BlogPostPage')) },
  { path: 'contact', ...page(() => import('@/pages/ContactPage')) },
  { path: 'about', ...page(() => import('@/pages/AboutPage')) },
  { path: 'help/:topic', ...page(() => import('@/pages/HelpPage')) },
  { path: 'login', ...page(() => import('@/pages/LoginPage')) },
  { path: 'register', ...page(() => import('@/pages/RegisterPage')) },
  { path: 'account', ...page(() => import('@/pages/AccountPage')) },
  { path: 'wishlist', ...page(() => import('@/pages/WishlistPage')) },
  // Design-system gallery: development builds only (PLAN.md Phase 2).
  ...(import.meta.env.DEV ? [{ path: 'dev/ui', ...page(() => import('@/pages/DevUiPage')) }] : []),
  // Not lazy: the error page renders it too, so it is in the main bundle anyway.
  { path: '*', Component: NotFoundPage },
];

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    // Only reached if the layout itself fails; page errors are caught one level down.
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <PageLoader />,
    children: [
      {
        // Pathless boundary: a failing page renders its error inside the header/footer layout.
        errorElement: <RouteErrorPage />,
        children: routes,
      },
    ],
  },
]);
