import { useState, useMemo, useCallback } from 'react';
import {
  Button,
  GridTable,
  Card,
  DatePicker,
  Checkbox,
} from '@castandcrew/platform-ui';
import type { ColumnDef } from '@tanstack/react-table';
import type { EmployeeRow } from '../DailyTimesheets/helpers/DailyTimesheetPage.types';
import styles from './ReportsPage.module.css';

type ReportRow = { id: string; name: string };

const ROWS: ReportRow[] = [
  { id: 'hot-cost', name: 'Hot Cost Report' },
  { id: 'production-report', name: 'Production Report' },
];

export default function ReportsPage({ rows }: { rows: EmployeeRow[] }) {
  const today = new Date().toISOString().split('T')[0];

  const [hotCostDay, setHotCostDay] = useState(today);
  const [PRDay, setPRDay] = useState(today);
  const [includeSplits, setIncludeSplits] = useState(false);

  const handleProductionReportRun = useCallback(async () => {
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows }),
    });
    const csv = await res.text();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Hours+ Production Report.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [rows]);

  const columns = useMemo<ColumnDef<ReportRow, unknown>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Report Name',
        size: 240,
      },
      {
        id: 'dateRange',
        header: 'Date Range',
        cell: ({ row }) => {
          if (row.original.id === 'hot-cost') {
            return (
              <div className={styles.rpt_rangeCell}>
                <DatePicker
                  label='Day'
                  dateValue={hotCostDay}
                  onChange={(val) => setHotCostDay(val?.toString() ?? '')}
                />
                <Checkbox
                  label='Include Splits'
                  isChecked={includeSplits}
                  onChange={(e) => setIncludeSplits(e?.target.checked ?? false)}
                />
              </div>
            );
          }
          if (row.original.id === 'production-report') {
            return (
              <div className={styles.rpt_rangeCell}>
                <DatePicker
                  label='Day'
                  dateValue={PRDay}
                  onChange={(val) => setPRDay(val?.toString() ?? '')}
                />
              </div>
            );
          }
          return null;
        },
      },
      {
        id: 'action',
        header: 'Action',
        size: 160,
        cell: ({ row }) => {
          const isProductionReport = row.original.id === 'production-report';
          const isDisabled =
            (row.original.id === 'hot-cost' && !hotCostDay) ||
            (isProductionReport && !PRDay);
          return (
            <div className={styles.rpt_actionCell}>
              <Button
                isFullWidth
                buttonVariant='solid'
                isDisabled={isDisabled}
                onPress={isProductionReport ? handleProductionReportRun : undefined}
              >
                Run
              </Button>
            </div>
          );
        },
      },
    ],
    [hotCostDay, includeSplits, PRDay, handleProductionReportRun],
  );

  return (
    <div className={styles.rpt_page}>
      <Card>
        <div className={styles.rpt_tableWrapper}>
          <GridTable
            data={ROWS}
            columns={columns}
            enablePagination={false}
            enableSorting={false}
            isStriped
            cellSize='sm'
          />
        </div>
      </Card>
    </div>
  );
}
