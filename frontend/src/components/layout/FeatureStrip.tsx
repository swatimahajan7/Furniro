import { BadgeCheck, Headset, Package, Trophy } from 'lucide-react';

import styles from './FeatureStrip.module.css';

const FEATURES = [
  { id: 'quality', icon: Trophy, title: 'High Quality', text: 'crafted from top materials' },
  { id: 'warranty', icon: BadgeCheck, title: 'Warranty Protection', text: 'Over 2 years' },
  { id: 'shipping', icon: Package, title: 'Free Shipping', text: 'Order over $150' },
  { id: 'support', icon: Headset, title: '24 / 7 Support', text: 'Dedicated support' },
];

/** The cream "High Quality · Warranty · Free Shipping · Support" band above the footer. */
export function FeatureStrip() {
  return (
    <section className={styles.strip} aria-label="Why shop with us" data-testid="feature-strip">
      <ul className={`container ${styles.list}`}>
        {FEATURES.map(({ id, icon: Icon, title, text }) => (
          <li key={id} className={styles.item} data-testid={`feature-${id}`}>
            <Icon className={styles.icon} size={60} strokeWidth={1.4} aria-hidden="true" />
            <div>
              <p className={styles.title}>{title}</p>
              <p className={styles.text}>{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
