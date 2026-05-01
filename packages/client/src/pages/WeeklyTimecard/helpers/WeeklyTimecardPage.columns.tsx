import React from 'react';
import { Button, AutocompleteInput, TextField } from '@castandcrew/platform-ui';
import type { ColumnDef } from '@tanstack/react-table';
import type { DayRow, CommentRow, AllowanceRow, BreakdownRow, HistoryRow } from './WeeklyTimecardPage.types';
import { SELECT_OPTIONS } from './WeeklyTimecardPage.data';
import styles from '../WeeklyTimecardPage.module.css';

const CALC_COL_IDS   = new Set(['callTime', 'wrap', 'hours']);
const SELECT_COL_IDS = new Set(['workLoc', 'dayType', 'epi', 'loc']);

const TABLE_COLUMNS = [
  { id: 'workLoc',   label: 'Work Loc' },
  { id: 'dayType',   label: 'Day Type'  },
  { id: 'callTime',  label: 'Call Time' },
  { id: 'wrap',      label: 'Wrap'      },
  { id: 'hours',     label: 'Hours'     },
  { id: 'account',   label: 'Account'   },
  { id: 'epi',       label: 'Epi'       },
  { id: 'ser',       label: 'Ser'       },
  { id: 'loc',       label: 'Loc'       },
  { id: 'set',       label: 'Set'       },
  { id: 'ff1',       label: 'FF1'       },
  { id: 'ff2',       label: 'FF2'       },
];

export const MAIN_COLUMNS: ColumnDef<DayRow, unknown>[] = [
  {
    id: 'day',
    enableSorting: false,
    header: () => (
      <Button buttonVariant='solid' size='xs'>Edit Days / Times</Button>
    ),
    cell: ({ row }) => {
      if (row.original._isMaster) return null;
      return (
        <div className={styles.wtc_dayCell}>
          <span className={styles.wtc_dayCell__name}>{row.original.name}</span>
          <span className={styles.wtc_dayCell__date}>{row.original.date}</span>
        </div>
      );
    },
  },
  ...TABLE_COLUMNS.map((col) => ({
    id: col.id,
    accessorKey: col.id as keyof DayRow,
    header: col.label,
    enableSorting: false,
    cell: ({ row, getValue }: { row: { original: DayRow }; getValue: () => unknown }) => {
      const value = getValue() ?? '';
      const isMaster = Boolean(row.original._isMaster);

      if (CALC_COL_IDS.has(col.id) && !isMaster) {
        return <div className={styles.wtc_calcCell}>{String(value)}</div>;
      }
      if (SELECT_COL_IDS.has(col.id)) {
        return (
          <AutocompleteInput
            aria-label={col.label}
            options={SELECT_OPTIONS[col.id]}
            defaultSelectedKey={String(value)}
            className={styles.wtc_cellSelect}
            popoverClassName={styles.wtc_cellSelectPopover}
          />
        );
      }
      return (
        <TextField
          isFullWidth
          size='sm'
          value={String(value)}
          inputProps={{ 'aria-label': col.label }}
          className={styles.wtc_cellInput}
        />
      );
    },
  })),
];

export const COMMENT_COLS: ColumnDef<CommentRow, unknown>[] = [
  { accessorKey: 'date', header: 'Date',    enableSorting: false },
  { accessorKey: 'user', header: 'User',    enableSorting: false },
  { accessorKey: 'text', header: 'Comment', enableSorting: false },
];

export const ALLOWANCE_COLS: ColumnDef<AllowanceRow, unknown>[] = [
  { accessorKey: 'type',    header: 'Type',    enableSorting: false },
  { accessorKey: 'amount',  header: 'Amount',  enableSorting: false },
  { accessorKey: 'account', header: 'Account', enableSorting: false },
  { accessorKey: 'epi',     header: 'Epi',     enableSorting: false },
  { accessorKey: 'ser',     header: 'Ser',     enableSorting: false },
];

export const BREAKDOWN_COLS: ColumnDef<BreakdownRow, unknown>[] = [
  { accessorKey: 'label',  header: 'Pay Category', enableSorting: false },
  { accessorKey: 'hours',  header: 'Hours',        enableSorting: false },
  { accessorKey: 'rate',   header: 'Rate',         enableSorting: false },
  {
    accessorKey: 'amount',
    header: 'Amount',
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className={styles['wtc_altTd--amount']}>{String(getValue() ?? '')}</span>
    ),
  },
];

export const HISTORY_COLS: ColumnDef<HistoryRow, unknown>[] = [
  { accessorKey: 'date',   header: 'Date / Time', enableSorting: false },
  { accessorKey: 'user',   header: 'User',        enableSorting: false },
  { accessorKey: 'action', header: 'Action',      enableSorting: false },
];
