import { Link } from 'react-router';

import { cn } from '@/lib/cn';

import { HELP_TOPICS, type HelpTopic } from '../helpTopics';

import styles from './Content.module.css';

/** A help topic, followed by links to the other topics and the contact page. */
export function InfoArticle({ topic }: { topic: HelpTopic }) {
  return (
    <div className={styles.help}>
      <article className={styles.prose} data-testid={`help-article-${topic.slug}`}>
        <p className={styles.intro}>{topic.intro}</p>
        {topic.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
            {section.list && (
              <ul>
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>
      <nav className={styles.helpNav} aria-labelledby="help-nav-title" data-testid="help-nav">
        <h2 id="help-nav-title" className={styles.helpNavTitle}>
          Help topics
        </h2>
        {HELP_TOPICS.map((item) => (
          <Link
            key={item.slug}
            to={`/help/${item.slug}`}
            className={cn(styles.helpLink, item.slug === topic.slug && styles.helpLinkActive)}
            aria-current={item.slug === topic.slug ? 'page' : undefined}
            data-testid={`help-nav-${item.slug}`}
          >
            {item.title}
          </Link>
        ))}
        <p className={styles.helpContact}>
          Still stuck?{' '}
          <Link to="/contact" data-testid="help-contact-link">
            Contact us
          </Link>
        </p>
      </nav>
    </div>
  );
}
