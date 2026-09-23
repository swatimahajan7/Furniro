import { useState, type ReactNode } from 'react';

import { Breadcrumb, FeatureStrip, PageShell } from '@/components/layout';
import {
  Badge,
  Button,
  ButtonLink,
  Checkbox,
  Drawer,
  EmptyState,
  ErrorState,
  Input,
  Pagination,
  QuantityStepper,
  RadioGroup,
  Rating,
  Select,
  Skeleton,
  Spinner,
  Tabs,
  Textarea,
  useToast,
  type ButtonVariant,
} from '@/components/ui';
import { useHealth } from '@/features/health';
import { useMetaConfig } from '@/features/meta';
import { formatDate, formatPrice } from '@/lib/format';

import styles from './DevUiPage.module.css';

const COLORS = [
  'primary',
  'primary-hover',
  'hero-card',
  'cream',
  'cream-light',
  'card',
  'text',
  'text-body',
  'text-muted',
  'text-subtle',
  'text-strike',
  'sale',
  'new',
  'rating',
  'border',
  'input-border',
  'black',
  'white',
];

const TYPE_SCALE: [string, string][] = [
  ['display', 'Discover Our New Collection'],
  ['h1', 'Shop'],
  ['h2', 'Our Products'],
  ['h3', 'Browse The Range'],
  ['h4', 'Syltherine'],
  ['lg', 'Rp 2.500.000 → $250.00'],
  ['md', 'Body text: stylish cafe chair'],
  ['sm', 'Meta and breadcrumbs'],
  ['xs', 'Size chips, review counts'],
];

const VARIANTS: ButtonVariant[] = [
  'primary',
  'outline-primary',
  'outline-dark',
  'pill',
  'light',
  'link',
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

/** /dev/ui: every design token and UI primitive on one page (dev builds only). */
export default function DevUiPage() {
  const toast = useToast();
  const health = useHealth();
  const meta = useMetaConfig();
  const [qty, setQty] = useState(1);
  const [payment, setPayment] = useState('bank_transfer');
  const [drawer, setDrawer] = useState<'left' | 'right' | 'top' | null>(null);

  return (
    <PageShell
      title="UI Gallery"
      name="dev-ui"
      crumbs={[{ label: 'Home', to: '/' }, { label: 'UI Gallery' }]}
    >
      <div className={`container ${styles.page}`}>
        <Section title="API">
          <p data-testid="dev-api-status">
            {health.isPending && 'Checking API…'}
            {health.isError && 'API unreachable'}
            {health.data &&
              `API ${health.data.status} · v${health.data.version} · db ${health.data.db}`}
            {meta.data &&
              ` · currency ${meta.data.currency.code} · page sizes ${meta.data.page_size_options.join('/')}`}
          </p>
          <p>
            formatPrice(25000) = <strong>{formatPrice(25000)}</strong> · formatPrice(250000) ={' '}
            <strong>{formatPrice(250000)}</strong> · formatDate ={' '}
            <strong>{formatDate('2022-10-14T00:00:00Z')}</strong>
          </p>
        </Section>

        <Section title="Colour tokens">
          <ul className={styles.swatches}>
            {COLORS.map((name) => (
              <li key={name} className={styles.swatch}>
                <span className={styles.chip} style={{ backgroundColor: `var(--color-${name})` }} />
                <code>--color-{name}</code>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Type scale">
          {TYPE_SCALE.map(([token, sample]) => (
            <p key={token} className={styles.typeRow} style={{ fontSize: `var(--text-${token})` }}>
              <code className={styles.typeToken}>--text-{token}</code> {sample}
            </p>
          ))}
        </Section>

        <Section title="Buttons">
          {VARIANTS.map((variant) => (
            <div key={variant} className={styles.row}>
              <code className={styles.label}>{variant}</code>
              <Button variant={variant} size="sm">
                Small
              </Button>
              <Button variant={variant}>Medium</Button>
              {variant === 'primary' && (
                <Button variant={variant} size="lg" uppercase>
                  Buy now
                </Button>
              )}
              <Button variant={variant} disabled>
                Disabled
              </Button>
              <Button variant={variant} isLoading>
                Loading
              </Button>
            </div>
          ))}
          <div className={styles.row}>
            <code className={styles.label}>ButtonLink</code>
            <ButtonLink to="/shop" variant="outline-primary" data-testid="dev-show-more">
              Show More
            </ButtonLink>
          </div>
        </Section>

        <Section title="Form fields">
          <div className={styles.formGrid}>
            <Input label="First Name" placeholder="Abc" data-testid="dev-field-first-name" />
            <Input
              label="Email address"
              defaultValue="abc@"
              error="Enter a valid email address"
              data-testid="dev-field-email"
            />
            <Select
              label="Country / Region"
              defaultValue="LK"
              options={[
                { value: 'LK', label: 'Sri Lanka' },
                { value: 'IN', label: 'India' },
                { value: 'US', label: 'United States' },
              ]}
              data-testid="dev-field-country"
            />
            <Select
              label="Sort by"
              variant="compact"
              defaultValue="default"
              options={[
                { value: 'default', label: 'Default' },
                { value: 'price_asc', label: 'Price: low to high' },
              ]}
              data-testid="dev-sort-select"
            />
            <Textarea
              label="Message"
              placeholder="Hi! I’d like to ask about"
              data-testid="dev-field-message"
            />
            <div className={styles.stack}>
              <Checkbox label="On sale" data-testid="dev-filter-on-sale" />
              <Checkbox label="New arrivals" defaultChecked data-testid="dev-filter-new" />
              <RadioGroup
                legend="Payment method"
                name="payment"
                value={payment}
                onChange={setPayment}
                showDescription="selected"
                options={[
                  {
                    value: 'bank_transfer',
                    label: 'Direct Bank Transfer',
                    description:
                      'Make your payment directly into our bank account. Your order ships once the funds clear.',
                  },
                  {
                    value: 'cod',
                    label: 'Cash On Delivery',
                    description: 'Pay when your furniture arrives.',
                  },
                ]}
                data-testid="dev-payment"
              />
            </div>
            <Input
              label="Newsletter"
              hideLabel
              variant="underline"
              placeholder="Enter Your Email Address"
              data-testid="dev-newsletter"
            />
          </div>
        </Section>

        <Section title="Badges, rating, quantity">
          <div className={styles.row}>
            <Badge variant="sale">-30%</Badge>
            <Badge variant="new">New</Badge>
            <Rating value={4.5} data-testid="dev-rating" />
            <Rating value={3} size={16} />
            <QuantityStepper value={qty} onChange={setQty} max={5} data-testid="dev-qty" />
            <QuantityStepper value={qty} onChange={setQty} size="sm" />
          </div>
        </Section>

        <Section title="Pagination and tabs">
          <Pagination
            page={2}
            totalPages={4}
            hrefFor={(n) => `/dev/ui?page=${n}`}
            data-testid="dev-pagination"
          />
          <Tabs
            data-testid="dev-tabs"
            items={[
              {
                id: 'description',
                label: 'Description',
                content: <p>Embodying the raw, wayward spirit…</p>,
              },
              {
                id: 'info',
                label: 'Additional Information',
                content: <p>Spec table goes here.</p>,
              },
              { id: 'reviews', label: 'Reviews [5]', content: <p>Reviews list goes here.</p> },
            ]}
          />
        </Section>

        <Section title="Overlays">
          <div className={styles.row}>
            <Button
              variant="outline-dark"
              size="sm"
              onClick={() => setDrawer('right')}
              data-testid="dev-open-drawer-right"
            >
              Right drawer
            </Button>
            <Button variant="outline-dark" size="sm" onClick={() => setDrawer('left')}>
              Left drawer
            </Button>
            <Button variant="outline-dark" size="sm" onClick={() => setDrawer('top')}>
              Top drawer
            </Button>
            <Button
              variant="pill"
              size="sm"
              onClick={() => toast.success('Added to cart')}
              data-testid="dev-toast-success"
            >
              Success toast
            </Button>
            <Button
              variant="pill"
              size="sm"
              onClick={() => toast.error('Could not reach the server')}
            >
              Error toast
            </Button>
            <Button variant="pill" size="sm" onClick={() => toast.info('Link copied')}>
              Info toast
            </Button>
          </div>
          <Drawer
            open={drawer !== null}
            onClose={() => setDrawer(null)}
            side={drawer ?? 'right'}
            title="Shopping Cart"
            footer={
              <div className={styles.row}>
                <Button variant="pill" size="sm">
                  Cart
                </Button>
                <Button variant="pill" size="sm">
                  Checkout
                </Button>
                <Button variant="pill" size="sm">
                  Comparison
                </Button>
              </div>
            }
            data-testid="dev-drawer"
          >
            <p>Drawer content. Tab cycles inside, Esc closes, focus returns to the opener.</p>
          </Drawer>
        </Section>

        <Section title="Loading, empty and error states">
          <div className={styles.row}>
            <Spinner label="Loading" />
            <div className={styles.skeletons}>
              <Skeleton height={180} rounded />
              <Skeleton width="60%" />
              <Skeleton width="40%" />
            </div>
          </div>
          <div className={styles.states}>
            <EmptyState title="Your cart is empty" message="Find something you love in the shop." />
            <ErrorState onRetry={() => toast.info('Retrying…')} data-testid="dev-error-state" />
          </div>
        </Section>

        <Section title="Breadcrumb bar">
          <Breadcrumb
            variant="bar"
            data-testid="dev-breadcrumb-bar"
            items={[
              { label: 'Home', to: '/' },
              { label: 'Shop', to: '/shop' },
              { label: 'Asgaard sofa' },
            ]}
          />
        </Section>
      </div>
      <FeatureStrip />
    </PageShell>
  );
}
