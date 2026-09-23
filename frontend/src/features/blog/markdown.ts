export type Block =
  | { kind: 'heading'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'paragraph'; text: string };

/**
 * The Markdown subset the API promises (docs/API_CONTRACT.md §2.8): blank-line separated
 * paragraphs, `## ` headings and `- ` bullet lists. Text is rendered as text, never as HTML.
 */
export function parseContent(markdown: string): Block[] {
  return markdown
    .split(/\n\s*\n/)
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((block): Block => {
      if (block.startsWith('## ')) return { kind: 'heading', text: block.slice(3).trim() };
      const lines = block.split('\n').map((line) => line.trim());
      if (lines.every((line) => line.startsWith('- '))) {
        return { kind: 'list', items: lines.map((line) => line.slice(2).trim()) };
      }
      return { kind: 'paragraph', text: lines.join(' ') };
    });
}
