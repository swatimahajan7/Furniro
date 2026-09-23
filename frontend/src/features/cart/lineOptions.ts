/** "Size L · Black" for a cart or order line; empty when the product has no options. */
export function lineOptions(line: { size?: string | null; color?: string | null }): string {
  return [line.size && `Size ${line.size}`, line.color].filter(Boolean).join(' · ');
}
