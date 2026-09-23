import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';

import { Input, useToast } from '@/components/ui';
import { testIds } from '@/lib/testIds';

import styles from './Footer.module.css';
import { COPYRIGHT_YEAR, HELP_NAV, MAIN_NAV, STORE_ADDRESS } from './navigation';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Footer() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();

  // Phase 6 connects this form to POST /newsletter/subscribe.
  const handleSubscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('Enter a valid email address');
      return;
    }
    setError(undefined);
    setEmail('');
    toast.info('Thanks! Newsletter sign-up opens soon.');
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
          {MAIN_NAV.map((item) => (
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
            onSubmit={handleSubscribe}
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
