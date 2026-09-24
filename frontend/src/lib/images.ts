/** Responsive widths generated for every file in backend/media (`make assets-variants`). */
const VARIANT_WIDTHS = [240, 480, 640, 960] as const;
/** Media originals are at most 1600 px wide (scripts/extract_design_assets.py). */
const ORIGINAL_WIDTH = 1600;

/**
 * `srcset` for a `/media/*.webp` image: its 240–960w copies plus the original, so phones
 * download a fraction of the bytes. Anything else (SVGs, external URLs) gets no srcset.
 */
export function mediaSrcSet(url: string | null | undefined): string | undefined {
  if (!url || !/^\/media\/.+\.webp$/.test(url)) return undefined;
  const base = url.slice(0, -'.webp'.length);
  return [
    ...VARIANT_WIDTHS.map((width) => `${base}-${width}w.webp ${width}w`),
    `${url} ${ORIGINAL_WIDTH}w`,
  ].join(', ');
}
