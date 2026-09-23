/** The `aria-describedby` target for a field: its error text if shown, otherwise its hint. */
export function describedBy(id: string, hint?: string, error?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}
