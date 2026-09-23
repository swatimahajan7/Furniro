import type { ReactNode } from 'react';

import styles from './Blog.module.css';

/** Posts on the left, sidebar on the right (stacked below `lg`). */
export function BlogLayout({ children, sidebar }: { children: ReactNode; sidebar: ReactNode }) {
  return (
    <div className={`container ${styles.layout}`}>
      <div className={styles.main}>{children}</div>
      {sidebar}
    </div>
  );
}
