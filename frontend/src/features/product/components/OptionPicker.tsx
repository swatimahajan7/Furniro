import { cn } from '@/lib/cn';

import styles from './OptionPicker.module.css';

export interface PickerOption {
  value: string;
  label: string;
  /** Colour swatch fill; omit for text chips (sizes). */
  hex?: string;
}

export interface OptionPickerProps {
  label: string;
  options: PickerOption[];
  value: string;
  onChange: (value: string) => void;
  /** Base ID: options get `${base}-${value in kebab-case}`. */
  'data-testid': string;
}

const kebab = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '-');

/** Size chips or colour swatches (DESIGN_SPEC §3 SizeChip / ColorSwatch). */
export function OptionPicker({
  label,
  options,
  value,
  onChange,
  'data-testid': testId,
}: OptionPickerProps) {
  const isColor = options.some((option) => option.hex);
  return (
    <div className={styles.picker}>
      <p className={styles.label} id={`${testId}-label`}>
        {label}
        {isColor && value && <span className={styles.current}>: {value}</span>}
      </p>
      <div className={styles.options} role="group" aria-labelledby={`${testId}-label`}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              className={cn(isColor ? styles.swatch : styles.chip, selected && styles.selected)}
              style={option.hex ? { backgroundColor: option.hex } : undefined}
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              aria-label={isColor ? option.label : `Size ${option.label}`}
              data-testid={`${testId}-${kebab(option.value)}`}
            >
              {!isColor && option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
