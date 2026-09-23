import { useFormContext } from 'react-hook-form';

import { Input, Select, Textarea } from '@/components/ui';
import { useLocations } from '@/features/meta';
import { testIds } from '@/lib/testIds';

import type { CheckoutValues } from '../schema';

import styles from './BillingFields.module.css';

const field = (name: keyof CheckoutValues) => testIds.field('checkout', name);

/** "Billing details" (DESIGN_SPEC §4.7). Province options depend on the chosen country. */
export function BillingFields() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CheckoutValues>();
  const locations = useLocations();
  const country = watch('country');
  const provinces = locations.data?.find((c) => c.code === country)?.provinces ?? [];

  const countryField = register('country');

  return (
    <fieldset className={styles.fields}>
      <legend className={styles.title}>Billing details</legend>
      <div className={styles.pair}>
        <Input
          label="First Name"
          autoComplete="given-name"
          error={errors.first_name?.message}
          {...register('first_name')}
          data-testid={field('first_name')}
        />
        <Input
          label="Last Name"
          autoComplete="family-name"
          error={errors.last_name?.message}
          {...register('last_name')}
          data-testid={field('last_name')}
        />
      </div>
      <Input
        label="Company Name (Optional)"
        autoComplete="organization"
        error={errors.company?.message}
        {...register('company')}
        data-testid={field('company')}
      />
      <Select
        label="Country / Region"
        autoComplete="country"
        options={(locations.data ?? []).map((c) => ({ value: c.code, label: c.name }))}
        disabled={!locations.data}
        error={errors.country?.message}
        {...countryField}
        onChange={(event) => {
          void countryField.onChange(event);
          // A province only makes sense within its country, so ask again.
          setValue('province', '', { shouldValidate: false });
        }}
        data-testid={field('country')}
      />
      <Input
        label="Street address"
        autoComplete="street-address"
        error={errors.street?.message}
        {...register('street')}
        data-testid={field('street')}
      />
      <Input
        label="Town / City"
        autoComplete="address-level2"
        error={errors.city?.message}
        {...register('city')}
        data-testid={field('city')}
      />
      <Select
        label="Province"
        autoComplete="address-level1"
        placeholder="Choose a province"
        options={provinces.map((p) => ({ value: p.code, label: p.name }))}
        disabled={!locations.data}
        error={errors.province?.message}
        {...register('province')}
        data-testid={field('province')}
      />
      <Input
        label="ZIP code"
        autoComplete="postal-code"
        error={errors.zip?.message}
        {...register('zip')}
        data-testid={field('zip')}
      />
      <Input
        label="Phone"
        type="tel"
        autoComplete="tel"
        error={errors.phone?.message}
        {...register('phone')}
        data-testid={field('phone')}
      />
      <Input
        label="Email address"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
        data-testid={field('email')}
      />
      <Textarea
        label="Additional information"
        hideLabel
        placeholder="Additional information"
        rows={2}
        error={errors.notes?.message}
        {...register('notes')}
        data-testid={field('notes')}
      />
    </fieldset>
  );
}
