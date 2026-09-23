import { z } from 'zod';

/** Login/register validation. Mirrors the backend rules (docs/API_CONTRACT.md §2.2). */
export const MESSAGES = {
  email: 'Enter a valid email address',
  password: 'Enter your password',
  passwordLength: 'Use at least 8 characters',
  passwordTooLong: 'Use 72 characters or fewer',
  passwordMix: 'Use at least one letter and one digit',
  confirm: 'The passwords do not match',
  firstName: 'Enter your first name',
  lastName: 'Enter your last name',
  nameTooLong: 'Use 50 characters or fewer',
} as const;

const email = z.string().trim().pipe(z.email(MESSAGES.email));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, MESSAGES.password).max(72, MESSAGES.passwordTooLong),
});

export const registerSchema = z
  .object({
    first_name: z.string().trim().min(1, MESSAGES.firstName).max(50, MESSAGES.nameTooLong),
    last_name: z.string().trim().min(1, MESSAGES.lastName).max(50, MESSAGES.nameTooLong),
    email,
    password: z
      .string()
      .min(8, MESSAGES.passwordLength)
      .max(72, MESSAGES.passwordTooLong)
      .refine((value) => /\p{L}/u.test(value) && /\d/.test(value), MESSAGES.passwordMix),
    /** Client-only: catches typos before the account exists. */
    confirm_password: z.string(),
  })
  .refine((values) => values.password === values.confirm_password, {
    message: MESSAGES.confirm,
    path: ['confirm_password'],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;

export const LOGIN_DEFAULTS: LoginValues = { email: '', password: '' };
export const REGISTER_DEFAULTS: RegisterValues = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  confirm_password: '',
};
