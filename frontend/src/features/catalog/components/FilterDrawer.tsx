import { useState, type FormEvent } from 'react';

import { Button, Checkbox, Drawer, Input } from '@/components/ui';

import { useCategories, useRooms } from '../api';
import { type ShopParams } from '../shopParams';

import styles from './FilterDrawer.module.css';

export interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  params: ShopParams;
  onApply: (changes: Partial<ShopParams>) => void;
}

type Draft = Pick<ShopParams, 'categories' | 'rooms' | 'onSale' | 'isNew'> & {
  /** Whole dollars as typed; converted to cents on apply. */
  minDollars: string;
  maxDollars: string;
};

const toDollars = (cents: number | null) => (cents === null ? '' : String(Math.floor(cents / 100)));
const toCents = (dollars: string) =>
  /^\d+$/.test(dollars.trim()) ? Number(dollars.trim()) * 100 : null;

function draftFrom(params: ShopParams): Draft {
  return {
    categories: params.categories,
    rooms: params.rooms,
    onSale: params.onSale,
    isNew: params.isNew,
    minDollars: toDollars(params.minPrice),
    maxDollars: toDollars(params.maxPrice),
  };
}

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

/** Shop filters (undesigned; DESIGN_SPEC §4.2). Changes apply only when "Apply" is pressed. */
export function FilterDrawer({ open, onClose, params, onApply }: FilterDrawerProps) {
  const categories = useCategories();
  const rooms = useRooms();
  const [draft, setDraft] = useState<Draft>(() => draftFrom(params));
  const [openedFor, setOpenedFor] = useState(open);

  // Reset the draft from the URL each time the drawer opens.
  if (open !== openedFor) {
    setOpenedFor(open);
    if (open) setDraft(draftFrom(params));
  }

  const invalidPrice =
    (draft.minDollars !== '' && toCents(draft.minDollars) === null) ||
    (draft.maxDollars !== '' && toCents(draft.maxDollars) === null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (invalidPrice) return;
    onApply({
      categories: draft.categories,
      rooms: draft.rooms,
      onSale: draft.onSale,
      isNew: draft.isNew,
      minPrice: toCents(draft.minDollars),
      maxPrice: toCents(draft.maxDollars),
    });
    onClose();
  };

  const handleReset = () => {
    onApply({
      categories: [],
      rooms: [],
      onSale: false,
      isNew: false,
      minPrice: null,
      maxPrice: null,
    });
    onClose();
  };

  return (
    <Drawer open={open} onClose={onClose} title="Filter" side="left" data-testid="filter-drawer">
      <form className={styles.form} onSubmit={handleSubmit} noValidate data-testid="filter-form">
        <fieldset className={styles.group}>
          <legend className={styles.legend}>Category</legend>
          {categories.data?.map((category) => (
            <Checkbox
              key={category.slug}
              label={`${category.name} (${category.product_count})`}
              checked={draft.categories.includes(category.slug)}
              onChange={() =>
                setDraft((d) => ({ ...d, categories: toggle(d.categories, category.slug) }))
              }
              data-testid={`filter-category-${category.slug}`}
            />
          ))}
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.legend}>Room</legend>
          {rooms.data?.map((room) => (
            <Checkbox
              key={room.slug}
              label={room.name}
              checked={draft.rooms.includes(room.slug)}
              onChange={() => setDraft((d) => ({ ...d, rooms: toggle(d.rooms, room.slug) }))}
              data-testid={`filter-room-${room.slug}`}
            />
          ))}
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.legend}>Price (USD)</legend>
          <div className={styles.prices}>
            <Input
              label="Min $"
              inputMode="numeric"
              placeholder="0"
              value={draft.minDollars}
              onChange={(event) => setDraft((d) => ({ ...d, minDollars: event.target.value }))}
              error={
                draft.minDollars !== '' && toCents(draft.minDollars) === null
                  ? 'Whole dollars only'
                  : undefined
              }
              data-testid="filter-field-min-price"
            />
            <Input
              label="Max $"
              inputMode="numeric"
              placeholder="Any"
              value={draft.maxDollars}
              onChange={(event) => setDraft((d) => ({ ...d, maxDollars: event.target.value }))}
              error={
                draft.maxDollars !== '' && toCents(draft.maxDollars) === null
                  ? 'Whole dollars only'
                  : undefined
              }
              data-testid="filter-field-max-price"
            />
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.legend}>Offers</legend>
          <Checkbox
            label="On sale"
            checked={draft.onSale}
            onChange={() => setDraft((d) => ({ ...d, onSale: !d.onSale }))}
            data-testid="filter-on-sale"
          />
          <Checkbox
            label="New arrivals"
            checked={draft.isNew}
            onChange={() => setDraft((d) => ({ ...d, isNew: !d.isNew }))}
            data-testid="filter-is-new"
          />
        </fieldset>

        <div className={styles.buttons}>
          <Button type="submit" size="sm" disabled={invalidPrice} data-testid="filter-apply">
            Apply
          </Button>
          <Button
            type="button"
            variant="outline-primary"
            size="sm"
            onClick={handleReset}
            data-testid="filter-reset"
          >
            Reset
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
