import { ChevronDown } from 'lucide-react';
import { useId } from 'react';

import styles from './AddProductSelect.module.css';

export interface AddProductOption {
  id: number;
  name: string;
}

export interface AddProductSelectProps {
  /** Products not yet compared (FR-CMP-03). */
  options: AddProductOption[];
  onSelect: (id: number) => void;
  isLoading?: boolean;
}

/** "Add A Product" with the gold "Choose a Product" dropdown (DESIGN_SPEC §4.5). */
export function AddProductSelect({ options, onSelect, isLoading = false }: AddProductSelectProps) {
  const id = useId();
  return (
    <div className={styles.wrap}>
      <label htmlFor={id} className={styles.label}>
        Add A Product
      </label>
      <div className={styles.control}>
        <select
          id={id}
          className={styles.select}
          value=""
          onChange={(event) => {
            if (event.target.value) onSelect(Number(event.target.value));
          }}
          disabled={isLoading || options.length === 0}
          data-testid="compare-add-select"
        >
          <option value="">{isLoading ? 'Loading products…' : 'Choose a Product'}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <ChevronDown className={styles.chevron} size={16} aria-hidden="true" />
      </div>
    </div>
  );
}
