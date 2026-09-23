import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';

import { ApiError } from '@/api/client';
import { Button, Input } from '@/components/ui';
import { applyApiErrors } from '@/lib/formErrors';
import { testIds } from '@/lib/testIds';

import { useRegister } from '../api';
import { REGISTER_DEFAULTS, registerSchema, type RegisterValues } from '../schema';

import styles from './AuthForm.module.css';

const FIELDS = Object.keys(REGISTER_DEFAULTS);
const field = (name: keyof RegisterValues) => testIds.field('register', name);

export interface RegisterFormProps {
  next: string;
  onSuccess: () => void;
}

export function RegisterForm({ next, onSuccess }: RegisterFormProps) {
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: REGISTER_DEFAULTS,
    reValidateMode: 'onChange',
  });
  const register = useRegister();
  const [formError, setFormError] = useState<string | null>(null);
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit(async ({ confirm_password: _confirm, ...values }) => {
    setFormError(null);
    try {
      await register.mutateAsync(values);
      onSuccess();
    } catch (error) {
      if (error instanceof ApiError && error.code === 'EMAIL_ALREADY_REGISTERED') {
        form.setError('email', { message: error.message }, { shouldFocus: true });
        return;
      }
      setFormError(applyApiErrors(error, form.setError, FIELDS));
    }
  });

  return (
    <form
      className={styles.card}
      onSubmit={(event) => void onSubmit(event)}
      noValidate
      aria-labelledby="register-title"
      data-testid="register-form"
    >
      <h2 id="register-title" className={styles.title}>
        Create an account
      </h2>
      <p className={styles.intro}>Save products you like and see all your orders in one place.</p>
      <div className={styles.pair}>
        <Input
          label="First Name"
          autoComplete="given-name"
          error={errors.first_name?.message}
          {...form.register('first_name')}
          data-testid={field('first_name')}
        />
        <Input
          label="Last Name"
          autoComplete="family-name"
          error={errors.last_name?.message}
          {...form.register('last_name')}
          data-testid={field('last_name')}
        />
      </div>
      <Input
        label="Email address"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...form.register('email')}
        data-testid={field('email')}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters, with a letter and a digit"
        error={errors.password?.message}
        {...form.register('password')}
        data-testid={field('password')}
      />
      <Input
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        error={errors.confirm_password?.message}
        {...form.register('confirm_password')}
        data-testid={field('confirm_password')}
      />
      {formError && (
        <p className={styles.formError} role="alert" data-testid="register-form-error">
          {formError}
        </p>
      )}
      <Button
        type="submit"
        className={styles.submit}
        isLoading={register.isPending}
        data-testid="register-submit"
      >
        Create Account
      </Button>
      <p className={styles.switch}>
        Already have an account?{' '}
        <Link to={`/login?next=${encodeURIComponent(next)}`} data-testid="register-login-link">
          Log in
        </Link>
      </p>
    </form>
  );
}
