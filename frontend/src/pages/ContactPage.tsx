import { PageShell } from '@/components/layout';
import { ContactForm, ContactInfo } from '@/features/contact';

import styles from './ContactPage.module.css';

export default function ContactPage() {
  return (
    <PageShell title="Contact" featureStrip>
      <section className={`container ${styles.page}`} aria-labelledby="contact-title">
        <header className={styles.intro}>
          <h2 id="contact-title" className={styles.title}>
            Get In Touch With Us
          </h2>
          <p className={styles.lead}>
            For more information about our products and services, please feel free to drop us an
            email. Our staff are always there to help you out. Do not hesitate!
          </p>
        </header>
        <div className={styles.layout}>
          <ContactInfo />
          <ContactForm />
        </div>
      </section>
    </PageShell>
  );
}
