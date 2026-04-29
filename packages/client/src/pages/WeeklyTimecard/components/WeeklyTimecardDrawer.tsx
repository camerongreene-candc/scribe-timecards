import { Icon, SquareIconToggleButton, TextField } from '@castandcrew/platform-ui';
import type { DrawerTimecard } from '../helpers/WeeklyTimecardPage.types';
import { DRAWER_TIMECARDS } from '../helpers/WeeklyTimecardPage.data';
import styles from '../WeeklyTimecardPage.module.css';

function DrawerTimecardItem({ tc }: { tc: DrawerTimecard }) {
  return (
    <div className={`${styles.wtc_drawer__item} ${tc.active ? styles['wtc_drawer__item--active'] : ''}`}>
      <span className={styles.wtc_drawer__itemName}>{tc.name}</span>
      <span className={`${styles.wtc_drawer__status} ${styles[`wtc_drawer__status--${tc.status}` as keyof typeof styles]}`}>
        {tc.status.replace(/_/g, ' ')}
      </span>
    </div>
  );
}

interface WeeklyTimecardDrawerProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

export default function WeeklyTimecardDrawer({ isOpen, onToggle }: WeeklyTimecardDrawerProps) {
  if (!isOpen) {
    return (
      <aside className={styles.wtc_drawer__minified}>
        <SquareIconToggleButton
          iconName='arrow-right-from-line'
          aria-label='Expand drawer'
          onClick={() => onToggle(true)}
        />
      </aside>
    );
  }

  return (
    <aside className={styles.wtc_drawer}>
      <div className={styles.wtc_drawer__header}>
        <span className={styles.wtc_drawer__title}>Timecards</span>
        <div className={styles.wtc_drawer__headerActions}>
          <SquareIconToggleButton iconName='arrow-down-to-line' aria-label='Download report' />
          <SquareIconToggleButton iconName='people-arrows'      aria-label='Move timecards'  />
          <SquareIconToggleButton
            iconName='arrow-left-from-line'
            aria-label='Collapse drawer'
            onClick={() => onToggle(false)}
          />
        </div>
      </div>

      <div className={styles.wtc_drawer__search}>
        <Icon iconName='magnifying-glass' size='sm' />
        <TextField
          placeholder='Search timecards…'
          inputProps={{ 'aria-label': 'Search timecards' }}
          className={styles.wtc_drawer__searchInput}
          size='sm'
        />
      </div>

      <div className={styles.wtc_drawer__list}>
        {DRAWER_TIMECARDS.map((tc) => (
          <DrawerTimecardItem key={tc.id} tc={tc} />
        ))}
      </div>
    </aside>
  );
}
