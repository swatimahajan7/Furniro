import type { ButtonHTMLAttributes, Ref } from 'react';
import { Link, type LinkProps } from 'react-router';

import { cn } from '@/lib/cn';

import styles from './Button.module.css';
import { Spinner } from './Spinner';

/**
 * Variants from DESIGN_SPEC §3:
 * primary (gold fill) · outline-primary ("Show More") · outline-dark ("Add To Cart", "Check Out")
 * pill (cart drawer) · light (white button on the product-card overlay) · link ("Read more")
 */
export type ButtonVariant =
  'primary' | 'outline-primary' | 'outline-dark' | 'pill' | 'light' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  uppercase?: boolean;
}

const variantClass: Record<ButtonVariant, string | undefined> = {
  primary: styles.primary,
  'outline-primary': styles.outlinePrimary,
  'outline-dark': styles.outlineDark,
  pill: styles.pill,
  light: styles.light,
  link: styles.link,
};

function buttonClassName(
  { variant = 'primary', size = 'md', fullWidth, uppercase }: ButtonStyleProps,
  className?: string,
) {
  return cn(
    styles.button,
    variantClass[variant],
    variant !== 'link' && styles[size],
    fullWidth && styles.fullWidth,
    uppercase && styles.uppercase,
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps {
  isLoading?: boolean;
  ref?: Ref<HTMLButtonElement>;
  'data-testid'?: string;
}

export function Button({
  variant,
  size,
  fullWidth,
  uppercase,
  isLoading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, fullWidth, uppercase }, className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

export interface ButtonLinkProps extends LinkProps, ButtonStyleProps {
  'data-testid'?: string;
}

/** A router link that looks like a button (e.g. "BUY NOW", "Show More"). */
export function ButtonLink({
  variant,
  size,
  fullWidth,
  uppercase,
  className,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonClassName({ variant, size, fullWidth, uppercase }, className)}
      {...rest}
    />
  );
}
