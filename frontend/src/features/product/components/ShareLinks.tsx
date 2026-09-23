import styles from './ShareLinks.module.css';

export interface ShareLinksProps {
  url: string;
  title: string;
}

/**
 * Share to Facebook, LinkedIn and X (FR-PDP-05). Lucide no longer ships brand icons, so these
 * are simple letter marks rather than copied logos.
 */
export function ShareLinks({ url, title }: ShareLinksProps) {
  const u = encodeURIComponent(url);
  const links = [
    {
      id: 'facebook',
      mark: 'f',
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    },
    {
      id: 'linkedin',
      mark: 'in',
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    },
    {
      id: 'x',
      mark: 'X',
      label: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?url=${u}&text=${encodeURIComponent(title)}`,
    },
  ];
  return (
    <ul className={styles.links}>
      {links.map((link) => (
        <li key={link.id}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            aria-label={`Share on ${link.label} (opens in a new tab)`}
            data-testid={`pdp-share-${link.id}`}
          >
            <span aria-hidden="true">{link.mark}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
