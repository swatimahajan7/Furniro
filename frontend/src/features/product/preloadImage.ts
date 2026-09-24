import type { ProductDetail } from '@/api/types';
import { mediaSrcSet } from '@/lib/images';

/** `sizes` of the gallery's main image; the preload must match it to fetch the same file. */
export const MAIN_IMAGE_SIZES = '(min-width: 1024px) 423px, 100vw';

/**
 * Ask the browser for the product's main image as soon as the product data arrives, before the
 * page has rendered (it is the page's LCP element). Safe to call more than once per image.
 */
export function preloadMainImage(product: ProductDetail) {
  const url = product.images.find((image) => image.kind === 'gallery')?.url ?? product.image_url;
  if (!url || document.head.querySelector(`link[rel="preload"][href="${CSS.escape(url)}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  const srcSet = mediaSrcSet(url);
  if (srcSet) {
    link.imageSrcset = srcSet;
    link.imageSizes = MAIN_IMAGE_SIZES;
  }
  link.fetchPriority = 'high';
  document.head.append(link);
}
