import { useState, useEffect, useMemo } from 'react';
import { GridTable } from '@castandcrew/platform-ui';
import type { ExtractionResult } from '@scribe-timecards/shared';
import type { ColumnDef } from '@tanstack/react-table';
import type { EmployeeRow } from './helpers/DailyTimesheetPage.types';
import { timecardToRow } from './helpers/DailyTimesheetPage.data';
import { makeDefaultColumns, ADDITIONAL_FIELD_DEFS, makeTF } from './helpers/DailyTimesheetPage.columns';
import DailyTimesheetHeader from './components/DailyTimesheetHeader';
import styles from './DailyTimesheetPage.module.css';

export default function DailyTimesheetPage() {
  const [rows, setRows] = useState<EmployeeRow[]>([]);
  const [extraCols, setExtraCols] = useState<Set<string>>(new Set());
  useEffect(() => {
    fetch('/api/extract')
      .then((res) => res.json())
      .then(({ data }: { data: ExtractionResult }) => {
        const newRows = data.timecards.map(timecardToRow);
        setRows(newRows);
        const populated = new Set<string>();
        for (const row of newRows) {
          for (const { id } of ADDITIONAL_FIELD_DEFS) {
            if (row[id as keyof EmployeeRow]) populated.add(id);
          }
        }
        setExtraCols(populated);
      });
  }, []);

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
        <DailyTimesheetHeader
          extraCols={extraCols}
          onExtraColsChange={setExtraCols}
          onExtractComplete={() => {}}
        />

        <div className={styles.dts_tableWrapper}>
          <GridTable<EmployeeRow>
            data={rows}
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
