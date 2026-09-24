import { Breadcrumb, type Crumb } from './Breadcrumb';
import styles from './PageBanner.module.css';
import { mediaSrcSet } from '@/lib/images';

export interface PageBannerProps {
  title: string;
  /** Defaults to Home › {title}. */
  crumbs?: Crumb[];
  /** The small logo mark above the title (the Shop banner in the design has none). */
  showMark?: boolean;
}

/** Blurred photo banner with the page title (h1) and breadcrumb (DESIGN_SPEC §3). */
export function PageBanner({ title, crumbs, showMark = true }: PageBannerProps) {
  return (
    <section className={styles.banner} data-testid="page-banner">
      <img
        className={styles.image}
        width={1440}
        height={316}
        src="/media/banners/page-banner.webp"
        srcSet={mediaSrcSet('/media/banners/page-banner.webp')}
        sizes="100vw"
        alt=""
      />
      <div className={styles.content}>
        {showMark && (
          <img className={styles.mark} src="/logo-mark.svg" alt="" width={77} height={50} />
        )}
        <h1 className={styles.title} data-testid="page-title">
          {title}
        </h1>
        <Breadcrumb items={crumbs ?? [{ label: 'Home', to: '/' }, { label: title }]} />
      </div>
    </section>
  );
}
