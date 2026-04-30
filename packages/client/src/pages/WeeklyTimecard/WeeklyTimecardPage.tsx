import { useState, useEffect } from 'react';
import { GridTable } from '@castandcrew/platform-ui';
import type { ApiResponse, RosterResult } from '@scribe-timecards/shared';
import type { DrawerTimecard } from './helpers/WeeklyTimecardPage.types';
import { MAIN_TABLE_DATA, DAY_ROWS, HOURS_MARGIN, rosterToDrawerTimecard } from './helpers/WeeklyTimecardPage.data';
import { MAIN_COLUMNS } from './helpers/WeeklyTimecardPage.columns';
import WeeklyTimecardDrawer from './components/WeeklyTimecardDrawer';
import WeeklyTimecardHeader from './components/WeeklyTimecardHeader';
import { CommentsSection, AllowancesSection, BreakdownSection, HistorySection } from './components/WeeklyTimecardSections';
import styles from './WeeklyTimecardPage.module.css';

export default function WeeklyTimecardPage() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [timecards, setTimecards] = useState<DrawerTimecard[]>([]);

  useEffect(() => {
    fetch('/api/extract')
      .then((res) => res.json())
      .then(({ data }: ApiResponse<RosterResult>) => {
        setTimecards(data.employees.map(rosterToDrawerTimecard));
      });
  }, []);

  const totalHours = DAY_ROWS
    .reduce((sum, r) => sum + (parseFloat(r.hours) || 0), 0)
    .toFixed(2);

  return (
    <div className={styles.wtc_page}>
      <WeeklyTimecardDrawer isOpen={drawerOpen} onToggle={setDrawerOpen} timecards={timecards} />

      <div className={styles.wtc_content}>
        <WeeklyTimecardHeader />

        <div className={styles.wtc_tableWrapper}>
          <GridTable
            data={MAIN_TABLE_DATA}
            columns={MAIN_COLUMNS}
            enablePagination={false}
            enableSorting={false}
            cellSize='sm'
            showCellBorders={false}
            stickyHeader
          />
          <div className={styles.wtc_totalRow}>
            <span className={styles.wtc_totalLabel} style={{ marginLeft: HOURS_MARGIN }}>
              Total:
            </span>
            <span className={`spotlight_heading-sm ${styles.wtc_totalValue}`}>
              {totalHours}
            </span>
          </div>
        </div>

        <div className={styles.wtc_bottom}>
          <div className={styles.wtc_altTables}>
            <CommentsSection />
            <AllowancesSection />
            <BreakdownSection />
            <HistorySection />
          </div>
        </div>
      </div>
    </div>
  );
}
