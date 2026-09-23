import { LogOut } from 'lucide-react';

import type { User } from '@/api/types';
import { Button } from '@/components/ui';
import { formatDate } from '@/lib/format';

import styles from './Account.module.css';

export interface ProfileCardProps {
  user: User;
  onLogout: () => void;
}

export function ProfileCard({ user, onLogout }: ProfileCardProps) {
  return (
    <section
      className={styles.profile}
      aria-labelledby="profile-title"
      data-testid="account-profile"
    >
      <h2 id="profile-title" className={styles.heading}>
        Profile
      </h2>
      <dl className={styles.facts}>
        <dt>Name</dt>
        <dd data-testid="account-name">
          {user.first_name} {user.last_name}
        </dd>
        <dt>Email</dt>
        <dd data-testid="account-email">{user.email}</dd>
        <dt>Member since</dt>
        <dd data-testid="account-member-since">{formatDate(user.created_at)}</dd>
      </dl>
      <Button variant="outline-dark" size="sm" onClick={onLogout} data-testid="account-logout">
        <LogOut size={16} aria-hidden="true" /> Log Out
      </Button>
    </section>
  );
}
