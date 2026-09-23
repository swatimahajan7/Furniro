import { z } from 'zod';

/** Contact form (FR-CON-01). Mirrors ContactCreate: name 2–80, email, subject ≤120, message 10–2000. */
export const MESSAGES = {
  nameShort: 'Enter your name (at least 2 characters)',
  nameLong: 'Use 80 characters or fewer',
  email: 'Enter a valid email address',
  subjectLong: 'Use 120 characters or fewer',
  messageShort: 'Write at least 10 characters',
  messageLong: 'Use 2000 characters or fewer',
} as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, MESSAGES.nameShort).max(80, MESSAGES.nameLong),
  email: z.string().trim().pipe(z.email(MESSAGES.email)),
  subject: z.string().trim().max(120, MESSAGES.subjectLong),
  message: z.string().trim().min(10, MESSAGES.messageShort).max(2000, MESSAGES.messageLong),
});

export type ContactValues = z.infer<typeof contactSchema>;

export const CONTACT_DEFAULTS: ContactValues = { name: '', email: '', subject: '', message: '' };
