import { parseContent } from '../markdown';

import styles from './Blog.module.css';

export function PostContent({ content }: { content: string }) {
  return (
    <div className={styles.content} data-testid="blog-article-content">
      {parseContent(content).map((block, index) => {
        // Blocks never reorder, so the position is a stable key here.
        const key = `${block.kind}-${index}`;
        if (block.kind === 'heading') return <h2 key={key}>{block.text}</h2>;
        if (block.kind === 'list') {
          return (
            <ul key={key}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        return <p key={key}>{block.text}</p>;
      })}
    </div>
  );
}
