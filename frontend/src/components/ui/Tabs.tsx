import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

import styles from './Tabs.module.css';

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  /** Controlled selected tab id; omit to let the component manage it. */
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  className?: string;
  /** Base ID: tabs get `${base}-tab-${id}`, panels `${base}-panel-${id}`. */
  'data-testid'?: string;
}

/** WAI-ARIA tabs: arrow keys, Home and End move between tabs. */
export function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  className,
  'data-testid': testId,
}: TabsProps) {
  const baseId = useId();
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.id ?? '');
  const selected = value ?? internal;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (id: string) => {
    setInternal(id);
    onChange?.(id);
  };

  const handleKeyDown = (event: KeyboardEvent, index: number) => {
    const last = items.length - 1;
    const next =
      event.key === 'ArrowRight'
        ? index === last
          ? 0
          : index + 1
        : event.key === 'ArrowLeft'
          ? index === 0
            ? last
            : index - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    const item = items[next];
    if (!item) return;
    select(item.id);
    tabRefs.current[next]?.focus();
  };

  const part = (kind: string, id: string) => (testId ? `${testId}-${kind}-${id}` : undefined);

  return (
    <div className={className} data-testid={testId}>
      <div role="tablist" className={styles.list}>
        {items.map((item, index) => {
          const isSelected = item.id === selected;
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={isSelected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={isSelected ? 0 : -1}
              className={cn(styles.tab, isSelected && styles.selected)}
              onClick={() => select(item.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              data-testid={part('tab', item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${baseId}-panel-${item.id}`}
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={item.id !== selected}
          tabIndex={0}
          className={styles.panel}
          data-testid={part('panel', item.id)}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
