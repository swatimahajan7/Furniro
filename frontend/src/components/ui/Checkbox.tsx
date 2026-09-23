import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from 'react';

import { cn } from '@/lib/cn';

import styles from './fields.module.css';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'className'
> {
  label: ReactNode;
  className?: string;
  ref?: Ref<HTMLInputElement>;
  'data-testid'?: string;
}

export function Checkbox({ label, className, id: idProp, ...rest }: CheckboxProps) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <div className={cn(styles.check, className)}>
      <input id={id} type="checkbox" className={styles.checkInput} {...rest} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
