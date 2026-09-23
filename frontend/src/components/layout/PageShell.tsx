import type { ReactNode } from 'react';

import { testIds } from '@/lib/testIds';

import type { Crumb } from './Breadcrumb';
import { FeatureStrip } from './FeatureStrip';
import { PageBanner } from './PageBanner';

export interface PageShellProps {
  /** Used for <title>, the banner heading and the `page-<name>` test ID. */
  title: string;
  /** Test-ID name when it differs from the title, e.g. "product" for a product page. */
  name?: string;
  /** Set false for pages without the photo banner (home, product detail). */
  banner?: boolean;
  /**
   * Without a banner there is no visible h1, so a screen-reader-only one is rendered.
   * Set false once the page renders its own h1 (e.g. the product title).
   */
  srHeading?: boolean;
  crumbs?: Crumb[];
  showMark?: boolean;
  /** The cream feature band above the footer, where the design shows it. */
  featureStrip?: boolean;
  children: ReactNode;
}

/** Page frame shared by every route: document title, banner, content, optional feature strip. */
export function PageShell({
  title,
  name,
  banner = true,
  srHeading = true,
  crumbs,
  showMark,
  featureStrip = false,
  children,
}: PageShellProps) {
  return (
    <div data-testid={testIds.page(name ?? title)}>
      <title>{`${title} | Furniro`}</title>
      {banner ? (
        <PageBanner title={title} crumbs={crumbs} showMark={showMark} />
      ) : (
        srHeading && <h1 className="visuallyHidden">{title}</h1>
      )}
      {children}
      {featureStrip && <FeatureStrip />}
    </div>
  );
}
