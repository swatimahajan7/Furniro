import { Heart, Menu, Search, ShoppingCart, User } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';

import { Button, Drawer, Input } from '@/components/ui';
import { cn } from '@/lib/cn';
import { testIds } from '@/lib/testIds';

import styles from './Header.module.css';
import { Logo } from './Logo';
import { MAIN_NAV } from './navigation';

const ICON_SIZE = 26;

/** Sticky site header: logo · main nav · account/search/wishlist/cart (DESIGN_SPEC §3). */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = query.trim();
    setSearchOpen(false);
    void navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
  };

  return (
    <header className={styles.header} data-testid="header">
      <div className={styles.inner}>
        <button
          type="button"
          className={cn(styles.iconButton, styles.menuButton)}
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          data-testid="header-menu-button"
        >
          <Menu size={ICON_SIZE} />
        </button>

        <Logo />

        <nav aria-label="Main" className={styles.nav}>
          {MAIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => cn(styles.navLink, isActive && styles.active)}
              data-testid={testIds.headerNav(item.label)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link
            to="/account"
            className={cn(styles.iconButton, styles.hideOnMobile)}
            aria-label="Account"
            data-testid="header-account-button"
          >
            <User size={ICON_SIZE} />
          </Link>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setSearchOpen(true)}
            aria-label="Search products"
            data-testid="header-search-button"
          >
            <Search size={ICON_SIZE} />
          </button>
          <Link
            to="/wishlist"
            className={cn(styles.iconButton, styles.hideOnMobile)}
            aria-label="Wishlist"
            data-testid="header-wishlist-button"
          >
            <Heart size={ICON_SIZE} />
          </Link>
          {/* Phase 4: opens the cart drawer and shows the item count (header-cart-count). */}
          <Link
            to="/cart"
            className={styles.iconButton}
            aria-label="Cart"
            data-testid="header-cart-button"
          >
            <ShoppingCart size={ICON_SIZE} />
          </Link>
        </div>
      </div>

      <Drawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Menu"
        side="left"
        data-testid="mobile-nav"
      >
        <nav aria-label="Mobile" className={styles.mobileNav}>
          {[
            ...MAIN_NAV,
            { label: 'Account', to: '/account' },
            { label: 'Wishlist', to: '/wishlist' },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => cn(styles.mobileLink, isActive && styles.active)}
              data-testid={testIds.mobileNav(item.label)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </Drawer>

      <Drawer
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        title="Search products"
        side="top"
        data-testid="search-drawer"
      >
        <form
          role="search"
          className={styles.searchForm}
          onSubmit={handleSearch}
          data-testid="search-form"
        >
          <Input
            label="Search products"
            hideLabel
            type="search"
            placeholder="Search sofas, chairs, lamps…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={styles.searchField}
            data-testid="search-field-q"
          />
          <Button type="submit" data-testid="search-submit">
            Search
          </Button>
        </form>
      </Drawer>
    </header>
  );
}
