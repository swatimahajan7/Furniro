/** Site navigation shared by the header, mobile menu and footer. */
export interface NavItem {
  label: string;
  to: string;
}

export const MAIN_NAV: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export const HELP_NAV: NavItem[] = [
  { label: 'Payment Options', to: '/help/payment-options' },
  { label: 'Returns', to: '/help/returns' },
  { label: 'Privacy Policies', to: '/help/privacy-policy' },
];

export const STORE_ADDRESS = ['400 University Drive Suite 200 Coral', 'Gables,', 'FL 33134 USA'];

/** Fixed rather than `new Date()` so rendered output is deterministic (GUIDELINES §6.3). */
export const COPYRIGHT_YEAR = 2026;
