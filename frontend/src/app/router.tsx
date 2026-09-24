import { createBrowserRouter, type LoaderFunctionArgs, type RouteObject } from 'react-router';

import { PageLoader } from '@/components/layout';
import { blogPostQuery } from '@/features/blog';
import { preloadMainImage, productQuery } from '@/features/product';
import NotFoundPage from '@/pages/NotFoundPage';
import RouteErrorPage from '@/pages/RouteErrorPage';

import { AppLayout } from './AppLayout';
import { queryClient } from './queryClient';

type PageModule = { default: React.ComponentType };

/** Lazy-load a page module so every route is its own chunk (GUIDELINES §5, §9). */
const page = (load: () => Promise<PageModule>): Pick<RouteObject, 'lazy'> => ({
  lazy: async () => ({ Component: (await load()).default }),
});

/**
 * Start a page's main request while its code chunk downloads, instead of after it renders
 * (a request waterfall). Never awaited, so navigation is not blocked; errors surface in the page.
 */
const prefetchProduct = ({ params }: LoaderFunctionArgs) => {
  if (params.slug) {
    // Also start the main image (the page's LCP) the moment the data lands.
    queryClient.fetchQuery(productQuery(params.slug)).then(preloadMainImage, () => undefined);
  }
  return null;
};
const prefetchBlogPost = ({ params }: LoaderFunctionArgs) => {
  if (params.slug) void queryClient.prefetchQuery(blogPostQuery(params.slug));
  return null;
};

const routes: RouteObject[] = [
  { index: true, ...page(() => import('@/pages/HomePage')) },
  { path: 'shop', ...page(() => import('@/pages/ShopPage')) },
  {
    path: 'product/:slug',
    loader: prefetchProduct,
    ...page(() => import('@/pages/ProductPage')),
  },
  { path: 'compare', ...page(() => import('@/pages/ComparePage')) },
  { path: 'cart', ...page(() => import('@/pages/CartPage')) },
  { path: 'checkout', ...page(() => import('@/pages/CheckoutPage')) },
  { path: 'order/:orderNumber', ...page(() => import('@/pages/OrderConfirmationPage')) },
  { path: 'blog', ...page(() => import('@/pages/BlogPage')) },
  {
    path: 'blog/:slug',
    loader: prefetchBlogPost,
    ...page(() => import('@/pages/BlogPostPage')),
  },
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
