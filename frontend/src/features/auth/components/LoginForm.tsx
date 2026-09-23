import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';

import { Button, Input } from '@/components/ui';
import { applyApiErrors } from '@/lib/formErrors';
import { testIds } from '@/lib/testIds';

import { useLogin } from '../api';
import { LOGIN_DEFAULTS, loginSchema, type LoginValues } from '../schema';

import styles from './AuthForm.module.css';

const FIELDS = Object.keys(LOGIN_DEFAULTS);
const field = (name: keyof LoginValues) => testIds.field('login', name);

export interface LoginFormProps {
  /** Where the register link should keep sending the user afterwards. */
  next: string;
  onSuccess: () => void;
}

export function LoginForm({ next, onSuccess }: LoginFormProps) {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: LOGIN_DEFAULTS,
    reValidateMode: 'onChange',
  });
  const login = useLogin();
  const [formError, setFormError] = useState<string | null>(null);
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login.mutateAsync(values);
      onSuccess();
    } catch (error) {
      setFormError(applyApiErrors(error, form.setError, FIELDS));
    }
  });

  return (
    <form
      className={styles.card}
      onSubmit={(event) => void onSubmit(event)}
      noValidate
      aria-labelledby="login-title"
      data-testid="login-form"
    >
      <h2 id="login-title" className={styles.title}>
        Log in
      </h2>
      <p className={styles.hint} data-testid="login-demo-hint">
        Demo account: <strong>demo@furniro.test</strong> / <strong>Demo@1234</strong>
      </p>
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
        autoComplete="current-password"
        error={errors.password?.message}
        {...form.register('password')}
        data-testid={field('password')}
      />
      {formError && (
        <p className={styles.formError} role="alert" data-testid="login-form-error">
          {formError}
        </p>
      )}
      <Button
        type="submit"
        className={styles.submit}
        isLoading={login.isPending}
        data-testid="login-submit"
      >
        Log In
      </Button>
      <p className={styles.switch}>
        New to Furniro?{' '}
        <Link to={`/register?next=${encodeURIComponent(next)}`} data-testid="login-register-link">
          Create an account
        </Link>
      </p>
    </form>
  );
}
