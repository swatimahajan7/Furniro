import type { ProductDetail } from '@/api/types';

import styles from './SpecTable.module.css';

const GROUP_ORDER = ['General', 'Product', 'Dimensions', 'Warranty'];

/** "Additional Information": specs grouped General / Product / Dimensions / Warranty. */
export function SpecTable({ specs }: { specs: ProductDetail['specs'] }) {
  const groups = GROUP_ORDER.map((name) => ({
    name,
    rows: specs.filter((spec) => spec.group === name),
  })).filter((group) => group.rows.length > 0);

  if (groups.length === 0)
    return <p className={styles.none}>No additional information for this product.</p>;

  return (
    <div className={styles.groups} data-testid="pdp-specs">
      {groups.map((group) => (
        <table key={group.name} className={styles.table}>
          <caption className={styles.caption}>{group.name}</caption>
          <tbody>
            {group.rows.map((spec) => (
              <tr
                key={spec.label}
                data-testid={`pdp-spec-${spec.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <th scope="row" className={styles.label}>
                  {spec.label}
                </th>
                <td className={styles.value}>{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  );
}
