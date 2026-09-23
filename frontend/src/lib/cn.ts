/** Joins class names, skipping falsy values: cn(styles.a, isOn && styles.b). */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
