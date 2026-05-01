import { useState, useEffect } from 'react';
import {
  Button,
  Icon,
  SquareIconToggleButton,
  Tag,
  SelectableSingleTile,
  SelectableSingleTileGroup,
  TextField,
} from '@castandcrew/platform-ui';
import type { DrawerTimecard } from '../helpers/WeeklyTimecardPage.types';

import styles from '../WeeklyTimecardPage.module.css';

type TagColorScheme =
  | 'info'
  | 'critical'
  | 'neutral'
  | 'positive'
  | 'attention';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  pending_pa_review: 'PA Review',
  pending_upm_review: 'UPM Review',
  sent_to_cnc: 'Sent to C&C',
};

const STATUS_COLOR: Record<string, TagColorScheme> = {
  draft: 'neutral',
  pending_pa_review: 'attention',
  pending_upm_review: 'info',
  sent_to_cnc: 'positive',
};

function DrawerCard({ tc }: { tc: DrawerTimecard }) {
  return (
    <SelectableSingleTile
      value={String(tc.id)}
      className={styles.wtc_drawer__tile}
    >
      <div className={styles.wtc_drawer__tileTopRow}>
        <span className={styles.wtc_drawer__itemName}>{tc.name}</span>
        <Icon
          iconName='circle-info'
          familyVariant='regular'
          size='sm'
          className={styles.wtc_drawer__infoIcon}
        />
      </div>
      {tc.subtitle && (
        <span className={styles.wtc_drawer__itemSubtitle}>{tc.subtitle}</span>
      )}
      <div className={styles.wtc_drawer__tileBottomRow}>
        <Tag tagText='Ready for me' colorScheme='positive' />
      </div>
    </SelectableSingleTile>
  );
}

interface WeeklyTimecardDrawerProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  timecards: DrawerTimecard[];
}

export default function WeeklyTimecardDrawer({
  isOpen,
  onToggle,
  timecards,
}: WeeklyTimecardDrawerProps) {
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    if (timecards.length > 0 && !selectedId) {
      setSelectedId(
        String(timecards.find((tc) => tc.active)?.id ?? timecards[0].id),
      );
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
        <SquareIconToggleButton
          size='lg'
          iconName='arrow-left-from-line'
          aria-label='Collapse drawer'
          onClick={() => onToggle(false)}
        />
      </div>

      <div className={styles.wtc_drawer__titleRow}>
        <span className={`${styles.wtc_drawer__title} spotlight_label-base`}>
          Selected Timecards
        </span>
        <div className={styles.wtc_drawer__search}>
          <TextField
            startAdornment={<Icon iconName='magnifying-glass' size='sm' />}
            aria-label='Search timecards'
          />
          <SquareIconToggleButton iconName='bars-filter' aria-label='Filter' />
          <SquareIconToggleButton
            iconName='arrow-up-short-wide'
            aria-label='Sort'
          />
        </div>
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
          <Button
            buttonVariant='outlined'
            size='sm'
            className={styles.wtc_drawer__footerBtn}
          >
            Approve
          </Button>
          <Button
            buttonVariant='outlined'
            size='sm'
            className={styles.wtc_drawer__footerBtn}
          >
            Reject
          </Button>
        </div>
        <div className={styles.wtc_drawer__footerIcons}>
          <SquareIconToggleButton iconName='pen-to-square' aria-label='Edit' />
          <SquareIconToggleButton iconName='folder-open' aria-label='Move' />
          <SquareIconToggleButton
            iconName='arrow-down-to-line'
            aria-label='Download'
          />
        </div>
      </div>
    </aside>
  );
}
