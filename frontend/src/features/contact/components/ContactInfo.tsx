import { Clock, MapPin, Phone, type LucideIcon } from 'lucide-react';

import styles from './Contact.module.css';

interface InfoItem {
  id: string;
  icon: LucideIcon;
  title: string;
  lines: string[];
}

/** The design's placeholder store details (DESIGN_SPEC §4.8). */
const ITEMS: InfoItem[] = [
  {
    id: 'address',
    icon: MapPin,
    title: 'Address',
    lines: ['236 5th SE Avenue, New York NY10000, United States'],
  },
  {
    id: 'phone',
    icon: Phone,
    title: 'Phone',
    lines: ['Mobile: +(84) 546-6789', 'Hotline: +(84) 456-6789'],
  },
  {
    id: 'hours',
    icon: Clock,
    title: 'Working Time',
    lines: ['Monday-Friday: 9:00 - 22:00', 'Saturday-Sunday: 9:00 - 21:00'],
  },
];

export function ContactInfo() {
  return (
    <ul className={styles.info} data-testid="contact-info">
      {ITEMS.map(({ id, icon: Icon, title, lines }) => (
        <li key={id} className={styles.infoItem} data-testid={`contact-info-${id}`}>
          <Icon className={styles.infoIcon} size={26} aria-hidden="true" />
          <div>
            <h3 className={styles.infoTitle}>{title}</h3>
            {lines.map((line) => (
              <p key={line} className={styles.infoLine}>
                {line}
              </p>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
