const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** The only place money becomes text. `minor` is US cents: formatPrice(250000) → "$2,500.00". */
export function formatPrice(minor: number): string {
  return priceFormatter.format(minor / 100);
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Design date style, fixed locale and timezone so output is stable: "14 Oct 2022". */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}
