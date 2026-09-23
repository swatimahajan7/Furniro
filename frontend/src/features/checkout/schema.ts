import { z } from 'zod';

/**
 * Checkout validation (FR-CHK-01). Mirrors the backend's BillingIn rules (lengths and the
 * ZIP/phone patterns) so both sides agree; all user-facing messages live here.
 */
export const MESSAGES = {
  firstName: 'Enter your first name',
  lastName: 'Enter your last name',
  tooLong: (max: number) => `Use ${max} characters or fewer`,
  country: 'Choose a country',
  street: 'Enter your street address',
  city: 'Enter your town or city',
  province: 'Choose a province',
  zip: 'Enter a valid ZIP / postal code',
  phone: 'Enter a valid phone number',
  email: 'Enter a valid email address',
  paymentMethod: 'Choose a payment method',
} as const;

const required = (message: string, max: number) =>
  z.string().trim().min(1, message).max(max, MESSAGES.tooLong(max));

const optional = (max: number) => z.string().trim().max(max, MESSAGES.tooLong(max));

export const checkoutSchema = z.object({
  first_name: required(MESSAGES.firstName, 50),
  last_name: required(MESSAGES.lastName, 50),
  company: optional(100),
  country: z.string().length(2, MESSAGES.country),
  street: required(MESSAGES.street, 200),
  city: required(MESSAGES.city, 80),
  province: z.string().min(1, MESSAGES.province).max(10),
  zip: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9][A-Za-z0-9 -]{1,8}[A-Za-z0-9]$/, MESSAGES.zip),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9 ()-]{5,18}[0-9]$/, MESSAGES.phone),
  email: z.string().trim().pipe(z.email(MESSAGES.email)),
  notes: optional(500),
  payment_method: z.enum(['bank_transfer', 'cod'], MESSAGES.paymentMethod),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;

export const CHECKOUT_DEFAULTS: CheckoutValues = {
  first_name: '',
  last_name: '',
  company: '',
  // The design shows Sri Lanka / Western Province preselected.
  country: 'LK',
  street: '',
  city: '',
  province: 'WP',
  zip: '',
  phone: '',
  email: '',
  notes: '',
  payment_method: 'bank_transfer',
};
