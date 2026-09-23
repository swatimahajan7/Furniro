import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';

import { Input } from '@/components/ui';
import { testIds } from '@/lib/testIds';

import styles from './Footer.module.css';
import { COPYRIGHT_YEAR, FOOTER_NAV, HELP_NAV, STORE_ADDRESS } from './navigation';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface FooterProps {
  /**
   * Sends the sign-up (wired in AppLayout, which owns the feature). Resolves to whether the field
   * should be cleared, plus an optional error to show under it.
   */
  onSubscribe: (email: string) => Promise<{ ok: boolean; fieldError?: string }>;
  isSubscribing: boolean;
}

export function Footer({ onSubscribe, isSubscribing }: FooterProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();

  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubscribing) return;
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setError('Enter a valid email address');
      return;
    }
    setError(undefined);
    const result = await onSubscribe(value);
    if (result.ok) setEmail('');
    else if (result.fieldError) setError(result.fieldError);
  };

  return (
    <footer className={styles.footer} data-testid="footer">
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <p className={styles.brandName}>Furniro.</p>
          <address className={styles.address} data-testid="footer-address">
            {STORE_ADDRESS.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
        </div>

        <nav aria-labelledby="footer-links" className={styles.column}>
          <h2 id="footer-links" className={styles.heading}>
            Links
          </h2>
          {FOOTER_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={styles.link}
              data-testid={testIds.footerLink(item.label)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <nav aria-labelledby="footer-help" className={styles.column}>
          <h2 id="footer-help" className={styles.heading}>
            Help
          </h2>
          {HELP_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={styles.link}
              data-testid={testIds.footerLink(item.label)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.column}>
          <h2 className={styles.heading}>Newsletter</h2>
          <form
            className={styles.newsletter}
            onSubmit={(event) => void handleSubscribe(event)}
            noValidate
            data-testid="footer-newsletter"
          >
            <Input
              label="Email address"
              hideLabel
              type="email"
              variant="underline"
              placeholder="Enter Your Email Address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={error}
              autoComplete="email"
              className={styles.newsletterField}
              data-testid="footer-newsletter-email"
            />
            <button
              type="submit"
              className={styles.subscribe}
              aria-disabled={isSubscribing || undefined}
              aria-busy={isSubscribing || undefined}
              data-testid="footer-newsletter-subscribe"
            >
              SUBSCRIBE
            </button>
          </form>
        </div>
      </div>

      <div className="container">
        <p className={styles.copyright} data-testid="footer-copyright">
          {COPYRIGHT_YEAR} Furniro. All rights reserved
        </p>
      </div>
    </footer>
  );
}
