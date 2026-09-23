import { zodResolver } from '@hookform/resolvers/zod';
import { CircleCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button, Input, Textarea } from '@/components/ui';
import { applyApiErrors } from '@/lib/formErrors';
import { testIds } from '@/lib/testIds';

import { useSendContactMessage } from '../api';
import { CONTACT_DEFAULTS, contactSchema, type ContactValues } from '../schema';

import styles from './Contact.module.css';

const FIELDS = Object.keys(CONTACT_DEFAULTS);
const field = (name: keyof ContactValues) => testIds.field('contact', name);

/** Name, email, optional subject, message; placeholders as designed (DESIGN_SPEC §4.8). */
export function ContactForm() {
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: CONTACT_DEFAULTS,
    reValidateMode: 'onChange',
  });
  const send = useSendContactMessage();
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await send.mutateAsync(values);
      setSentTo(values.email);
      form.reset(CONTACT_DEFAULTS);
    } catch (error) {
      setFormError(applyApiErrors(error, form.setError, FIELDS));
    }
  });

  if (sentTo) {
    return (
      <div className={styles.success} role="status" data-testid="contact-success">
        <CircleCheck className={styles.successIcon} size={40} aria-hidden="true" />
        <h3 className={styles.successTitle}>Thank you for your message!</h3>
        <p>
          We will get back to you at <strong>{sentTo}</strong> within one working day.
        </p>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => setSentTo(null)}
          data-testid="contact-send-another"
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      className={styles.form}
      onSubmit={(event) => void onSubmit(event)}
      noValidate
      aria-label="Contact form"
      data-testid="contact-form"
    >
      <Input
        label="Your name"
        placeholder="Abc"
        autoComplete="name"
        error={errors.name?.message}
        {...form.register('name')}
        data-testid={field('name')}
      />
      <Input
        label="Email address"
        type="email"
        placeholder="Abc@def.com"
        autoComplete="email"
        error={errors.email?.message}
        {...form.register('email')}
        data-testid={field('email')}
      />
      <Input
        label="Subject"
        placeholder="This is an optional"
        error={errors.subject?.message}
        {...form.register('subject')}
        data-testid={field('subject')}
      />
      <Textarea
        label="Message"
        placeholder="Hi! i'd like to ask about"
        rows={4}
        error={errors.message?.message}
        {...form.register('message')}
        data-testid={field('message')}
      />
      {formError && (
        <p className={styles.formError} role="alert" data-testid="contact-form-error">
          {formError}
        </p>
      )}
      <Button
        type="submit"
        className={styles.submit}
        isLoading={send.isPending}
        data-testid="contact-submit"
      >
        Submit
      </Button>
    </form>
  );
}
