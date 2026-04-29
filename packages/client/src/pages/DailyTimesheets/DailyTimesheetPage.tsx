import { useState, useMemo } from 'react';
import { GridTable } from '@castandcrew/platform-ui';
import type { ColumnDef } from '@tanstack/react-table';
import type { EmployeeRow } from './helpers/DailyTimesheetPage.types';
import { SAMPLE_ROWS } from './helpers/DailyTimesheetPage.data';
import { makeDefaultColumns, ADDITIONAL_FIELD_DEFS, makeTF } from './helpers/DailyTimesheetPage.columns';
import DailyTimesheetHeader from './components/DailyTimesheetHeader';
import styles from './DailyTimesheetPage.module.css';

export default function DailyTimesheetPage() {
  const [extraCols, setExtraCols] = useState<Set<string>>(new Set());

  const columns = useMemo<ColumnDef<EmployeeRow, unknown>[]>(
    () => [
      ...makeDefaultColumns(),
      ...ADDITIONAL_FIELD_DEFS.filter((f) => extraCols.has(f.id)).map((f) => makeTF(f.id, f.label)),
    ],
    [extraCols],
  );

  return (
    <div className={styles.dts_page}>
      <div className={styles.dts_content}>
        <DailyTimesheetHeader extraCols={extraCols} onExtraColsChange={setExtraCols} />

        <div className={styles.dts_tableWrapper}>
          <GridTable<EmployeeRow>
            data={SAMPLE_ROWS}
            columns={columns}
            enableSorting
            enablePagination={false}
            stickyHeader
            cellSize='sm'
            showCellBorders={false}
            className={styles.dts_table}
            containerClassName={styles.dts_tableScroll}
          />
        </div>
      </div>
    </div>
  );
}
