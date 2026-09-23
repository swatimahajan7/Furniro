import { z } from 'zod';

/** Review form (FR-PDP-04). Mirrors ReviewCreate: rating 1–5, comment 10–1000 characters. */
export const MESSAGES = {
  rating: 'Choose a rating from 1 to 5 stars',
  commentShort: 'Write at least 10 characters',
  commentLong: 'Use 1000 characters or fewer',
} as const;

export const reviewSchema = z.object({
  rating: z.number(MESSAGES.rating).int().min(1, MESSAGES.rating).max(5, MESSAGES.rating),
  comment: z.string().trim().min(10, MESSAGES.commentShort).max(1000, MESSAGES.commentLong),
});

export type ReviewValues = z.infer<typeof reviewSchema>;

export const REVIEW_DEFAULTS: ReviewValues = { rating: 0, comment: '' };
