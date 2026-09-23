import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useLocation } from 'react-router';

import { ApiError } from '@/api/client';
import { Button, Textarea } from '@/components/ui';
import { loginPath, useIsLoggedIn } from '@/features/auth';
import { applyApiErrors } from '@/lib/formErrors';
import { testIds } from '@/lib/testIds';

import { useCreateReview } from '../api';
import { REVIEW_DEFAULTS, reviewSchema, type ReviewValues } from '../schema';

import styles from './ReviewForm.module.css';
import { StarInput } from './StarInput';

const FIELDS = Object.keys(REVIEW_DEFAULTS);

/** "Write a review" under the Reviews tab. Guests get a login link instead (FR-PDP-04). */
export function ReviewForm({ slug }: { slug: string }) {
  const isLoggedIn = useIsLoggedIn();
  const { pathname, search } = useLocation();
  const create = useCreateReview(slug);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const form = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: REVIEW_DEFAULTS,
    reValidateMode: 'onChange',
  });

  if (!isLoggedIn) {
    return (
      <p className={styles.prompt} data-testid="review-login-prompt">
        <Link to={loginPath(`${pathname}${search}`)} data-testid="review-login-link">
          Log in
        </Link>{' '}
        to write a review.
      </p>
    );
  }
  if (isDone) {
    return (
      <p className={styles.prompt} role="status" data-testid="review-success">
        Thank you! Your review has been posted.
      </p>
    );
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await create.mutateAsync(values);
      setIsDone(true);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'ALREADY_REVIEWED') {
        setFormError('You have already reviewed this product.');
        return;
      }
      setFormError(applyApiErrors(error, form.setError, FIELDS));
    }
  });

  return (
    <form
      className={styles.form}
      onSubmit={(event) => void onSubmit(event)}
      noValidate
      aria-labelledby="review-form-title"
      data-testid="review-form"
    >
      <h3 id="review-form-title" className={styles.title}>
        Write a review
      </h3>
      <Controller
        control={form.control}
        name="rating"
        render={({ field, fieldState }) => (
          <StarInput
            value={field.value}
            onChange={field.onChange}
            inputRef={field.ref}
            error={fieldState.error?.message}
            data-testid={testIds.field('review', 'rating')}
          />
        )}
      />
      <Textarea
        label="Your review"
        rows={4}
        error={form.formState.errors.comment?.message}
        {...form.register('comment')}
        data-testid={testIds.field('review', 'comment')}
      />
      {formError && (
        <p className={styles.formError} role="alert" data-testid="review-form-error">
          {formError}
        </p>
      )}
      <Button
        type="submit"
        variant="outline-primary"
        className={styles.submit}
        isLoading={create.isPending}
        data-testid="review-submit"
      >
        Post Review
      </Button>
    </form>
  );
}
