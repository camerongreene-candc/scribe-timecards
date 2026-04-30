import { useState, useEffect } from 'react';
import {
  Button,
  Icon,
  SquareIconToggleButton,
  Tag,
  SelectableSingleTile,
  SelectableSingleTileGroup,
} from '@castandcrew/platform-ui';
import type { DrawerTimecard } from '../helpers/WeeklyTimecardPage.types';

import styles from '../WeeklyTimecardPage.module.css';

type TagColorScheme = 'info' | 'critical' | 'neutral' | 'positive' | 'attention';

const STATUS_LABEL: Record<string, string> = {
  draft:              'Draft',
  pending_pa_review:  'PA Review',
  pending_upm_review: 'UPM Review',
  sent_to_cnc:        'Sent to C&C',
};

const STATUS_COLOR: Record<string, TagColorScheme> = {
  draft:              'neutral',
  pending_pa_review:  'attention',
  pending_upm_review: 'info',
  sent_to_cnc:        'positive',
};

function DrawerCard({ tc }: { tc: DrawerTimecard }) {
  return (
    <SelectableSingleTile value={String(tc.id)} className={styles.wtc_drawer__tile}>
      <div className={styles.wtc_drawer__tileTopRow}>
        <span className={styles.wtc_drawer__itemName}>{tc.name}</span>
        <Icon iconName='circle-info' size='sm' className={styles.wtc_drawer__infoIcon} />
      </div>
      {tc.subtitle && (
        <span className={styles.wtc_drawer__itemSubtitle}>{tc.subtitle}</span>
      )}
      <div className={styles.wtc_drawer__tileBottomRow}>
        <Tag
          tagText={STATUS_LABEL[tc.status] ?? tc.status.replace(/_/g, ' ')}
          colorScheme={STATUS_COLOR[tc.status] ?? 'neutral'}
          size='sm'
        />
      </div>
    </SelectableSingleTile>
  );
}

interface WeeklyTimecardDrawerProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  timecards: DrawerTimecard[];
}

export default function WeeklyTimecardDrawer({ isOpen, onToggle, timecards }: WeeklyTimecardDrawerProps) {
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    if (timecards.length > 0 && !selectedId) {
      setSelectedId(String(timecards.find((tc) => tc.active)?.id ?? timecards[0].id));
    }
  }, [timecards]);

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
        <span className={styles.wtc_drawer__title}>Selected Timecards</span>
        <SquareIconToggleButton
          iconName='arrow-left-from-line'
          aria-label='Collapse drawer'
          onClick={() => onToggle(false)}
        />
      </div>

      <div className={styles.wtc_drawer__search}>
        <Icon iconName='magnifying-glass' size='sm' />
        <input
          className={styles.wtc_drawer__searchInput}
          placeholder='Search text'
          aria-label='Search timecards'
        />
        <SquareIconToggleButton iconName='filter' aria-label='Filter' />
        <SquareIconToggleButton iconName='bars-sort' aria-label='Sort' />
      </div>

      <div className={styles.wtc_drawer__list}>
        <SelectableSingleTileGroup
          label='Selected Timecards'
          value={selectedId}
          onChange={setSelectedId}
          className={styles.wtc_drawer__tileGroup}
        >
          {timecards.map((tc) => (
            <DrawerCard key={tc.id} tc={tc} />
          ))}
        </SelectableSingleTileGroup>
      </div>

      <div className={styles.wtc_drawer__footer}>
        <div className={styles.wtc_drawer__footerActions}>
          <Button buttonVariant='outlined' size='sm' className={styles.wtc_drawer__footerBtn}>
            Approve
          </Button>
          <Button buttonVariant='outlined' size='sm' className={styles.wtc_drawer__footerBtn}>
            Reject
          </Button>
        </div>
        <div className={styles.wtc_drawer__footerIcons}>
          <SquareIconToggleButton iconName='pen-to-square' aria-label='Edit' />
          <SquareIconToggleButton iconName='folder-open' aria-label='Move' />
          <SquareIconToggleButton iconName='arrow-down-to-line' aria-label='Download' />
        </div>
      </div>
    </aside>
  );
}
