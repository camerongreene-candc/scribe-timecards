/**
 * Skeleton of the Hours+ Daily Timesheets (DTS) page, built with Spotlight.
 * No Redux, no API calls — static seed data + minimal UI state only.
 *
 * Migration: hand-rolled table → GridTable, <input> → TextField,
 * <select> → AutocompleteInput. No MUI imports.
 */

import { useState } from 'react';
import {
  Button,
  Icon,
  IconButton,
  GridTable,
  TextField,
  AutocompleteInput,
} from '@castandcrew/platform-ui';
import type { ColumnDef } from '@tanstack/react-table';
import type { ExtractedTimecardData } from '@scribe-timecards/shared';
import { ExtractModal } from '../components/extract-modal/ExtractModal';
import styles from './DailyTimesheetPage.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmployeeRow {
  id: string;
  lastName: string;
  firstName: string;
  department: string;
  union: string;
  dayType: string;
  workZone: string;
  callTime: string;
  meal1Out: string;
  meal1In: string;
  lastManIn: string;
  wrap: string;
  dailyAllow: string;
  country: string;
}

// ─── Static seed data matching screenshot ─────────────────────────────────────

const SAMPLE_ROWS: EmployeeRow[] = [
  {
    id: '1',
    lastName: 'AXRGIFSEMNC...',
    firstName: 'ELOISA',
    department: 'Accounting',
    union: 'IATSE 729 - PAI...',
    dayType: '',
    workZone: '',
    callTime: '',
    meal1Out: '',
    meal1In: '',
    lastManIn: '',
    wrap: '',
    dailyAllow: '',
    country: 'United States',
  },
  {
    id: '2',
    lastName: 'ALFONSO',
    firstName: 'JENNIFER',
    department: 'Accounting',
    union: 'IATSE 800 - AR...',
    dayType: '',
    workZone: '',
    callTime: '',
    meal1Out: '',
    meal1In: '',
    lastManIn: '',
    wrap: '',
    dailyAllow: '',
    country: 'United States',
  },
  {
    id: '3',
    lastName: 'TOMASSI',
    firstName: 'ROLO',
    department: 'Accounting',
    union: 'IATSE 839 - SC...',
    dayType: '',
    workZone: '',
    callTime: '',
    meal1Out: '',
    meal1In: '',
    lastManIn: '',
    wrap: '',
    dailyAllow: '',
    country: 'United States',
  },
  {
    id: '4',
    lastName: 'AMNGGTHUKZRP...',
    firstName: 'FRANCESKA',
    department: 'Accounting',
    union: 'NON-UNION',
    dayType: '',
    workZone: '',
    callTime: '',
    meal1Out: '',
    meal1In: '',
    lastManIn: '',
    wrap: '',
    dailyAllow: '',
    country: 'United States',
  },
  {
    id: '5',
    lastName: 'AMNGGTHUKZRP...',
    firstName: 'JOHN',
    department: 'Accounting',
    union: 'NON-UNION',
    dayType: '',
    workZone: '',
    callTime: '',
    meal1Out: '',
    meal1In: '',
    lastManIn: '',
    wrap: '',
    dailyAllow: '',
    country: 'United States',
  },
  {
    id: '6',
    lastName: 'AMNGGTHUKZRP...',
    firstName: 'PFEIFFER',
    department: 'Accounting',
    union: 'NON-UNION',
    dayType: '',
    workZone: '',
    callTime: '',
    meal1Out: '',
    meal1In: '',
    lastManIn: '',
    wrap: '',
    dailyAllow: '',
    country: 'United States',
  },
  {
    id: '7',
    lastName: 'AVOWFGSJHR...',
    firstName: 'RULAN',
    department: 'Accounting',
    union: 'NON-UNION',
    dayType: '',
    workZone: '',
    callTime: '',
    meal1Out: '',
    meal1In: '',
    lastManIn: '',
    wrap: '',
    dailyAllow: '',
    country: 'United States',
  },
  {
    id: '8',
    lastName: 'RENQUIST',
    firstName: 'HARRY',
    department: 'Accounting',
    union: 'NON-UNION',
    dayType: '',
    workZone: '',
    callTime: '',
    meal1Out: '',
    meal1In: '',
    lastManIn: '',
    wrap: '',
    dailyAllow: '',
    country: 'United States',
  },
  {
    id: '9',
    lastName: 'VALIDATION',
    firstName: 'AMY',
    department: 'Accounting',
    union: 'NON-UNION',
    dayType: '',
    workZone: '',
    callTime: '',
    meal1Out: '',
    meal1In: '',
    lastManIn: '',
    wrap: '',
    dailyAllow: '',
    country: 'United States',
  },
  {
    id: '10',
    lastName: 'CIRNFBHUKQM...',
    firstName: 'MARY ANN',
    department: 'Animatics',
    union: 'IATSE 729 - PAI...',
    dayType: '',
    workZone: '',
    callTime: '',
    meal1Out: '',
    meal1In: '',
    lastManIn: '',
    wrap: '',
    dailyAllow: '',
    country: 'United States',
  },
  {
    id: '11',
    lastName: 'BEN',
    firstName: 'BONJOURNO',
    department: 'Animatics',
    union: 'IATSE 839 - SC...',
    dayType: '',
    workZone: '',
    callTime: '',
    meal1Out: '',
    meal1In: '',
    lastManIn: '',
    wrap: '',
    dailyAllow: '',
    country: 'United States',
  },
  {
    id: '12',
    lastName: 'DANIKA',
    firstName: 'RENNY',
    department: 'Animatics',
    union: 'IATSE 839 - SC...',
    dayType: '',
    workZone: '',
    callTime: '',
    meal1Out: '',
    meal1In: '',
    lastManIn: '',
    wrap: '',
    dailyAllow: '',
    country: 'United States',
  },
  {
    id: '13',
    lastName: 'DARREN',
    firstName: 'NALACO',
    department: 'Animatics',
    union: 'NON-UNION',
    dayType: '',
    workZone: '',
    callTime: '',
    meal1Out: '',
    meal1In: '',
    lastManIn: '',
    wrap: '',
    dailyAllow: '',
    country: 'United States',
  },
  {
    id: '14',
    lastName: 'EBNKHVDSJLR...',
    firstName: 'STELLAN',
    department: 'Animatics',
    union: 'NON-UNION',
    dayType: '',
    workZone: '',
    callTime: '',
    meal1Out: '',
    meal1In: '',
    lastManIn: '',
    wrap: '',
    dailyAllow: '',
    country: 'United States',
  },
  {
    id: '15',
    lastName: 'QMCHPNYDGR...',
    firstName: 'CHERNG-MAO',
    department: 'Animatics',
    union: 'NON-UNION',
    dayType: '',
    workZone: '',
    callTime: '',
    meal1Out: '',
    meal1In: '',
    lastManIn: '',
    wrap: '',
    dailyAllow: '',
    country: 'United States',
  },
];

const toOpts = (vals: string[]) => vals.map((v) => ({ id: v, label: v }));

const DAY_TYPE_OPTIONS = toOpts(['1 - WORK', '2 - HOLIDAY', '3 - TRAVEL', '4 - SICK', '5 - VACATION']);
const WORK_ZONE_OPTIONS = toOpts(['Studio', 'Location', 'Distant', 'Home']);
const COUNTRY_OPTIONS   = toOpts(['United States', 'Canada']);

const DAY_TYPE_LABEL: Record<string, string> = {
  Worked: '1 - WORK',
  Holiday: '2 - HOLIDAY',
  Travel: '3 - TRAVEL',
  Sick: '4 - SICK',
  Vacation: '5 - VACATION',
  Rest: '',
};

const COUNTRY_NAME: Record<string, string> = {
  US: 'United States',
  CA: 'Canada',
};

// ─── Column definitions ───────────────────────────────────────────────────────

const DTS_COLUMNS: ColumnDef<EmployeeRow, unknown>[] = [
  {
    id: 'lastName',
    accessorKey: 'lastName',
    header: 'Last Name',
  },
  {
    id: 'firstName',
    accessorKey: 'firstName',
    header: 'First Name',
  },
  {
    id: 'department',
    accessorKey: 'department',
    header: 'Department',
  },
  {
    id: 'union',
    accessorKey: 'union',
    header: 'Union',
  },
  {
    id: 'dayType',
    accessorKey: 'dayType',
    header: 'Day Type',
    cell: ({ getValue }) => (
      <AutocompleteInput
        aria-label='Day Type'
        options={DAY_TYPE_OPTIONS}
        value={getValue() as string}
        className={styles.dts_cellSelect}
        popoverClassName={styles.dts_cellSelectPopover}
      />
    ),
  },
  {
    id: 'workZone',
    accessorKey: 'workZone',
    header: 'Work Zone',
    cell: ({ getValue }) => (
      <AutocompleteInput
        aria-label='Work Zone'
        options={WORK_ZONE_OPTIONS}
        value={getValue() as string}
        className={styles.dts_cellSelect}
      />
    ),
  },
  {
    id: 'callTime',
    accessorKey: 'callTime',
    header: () => (
      <>
        Call
        <br />
        Time
      </>
    ),
    cell: ({ getValue }) => (
      <TextField
        aria-label='Call Time'
        value={getValue() as string}
        className={styles.dts_cellInput}
        isFullWidth
        size='sm'
      />
    ),
  },
  {
    id: 'meal1Out',
    accessorKey: 'meal1Out',
    header: 'Meal 1 Out',
    cell: ({ getValue }) => (
      <TextField
        aria-label='Meal 1 Out'
        value={getValue() as string}
        isFullWidth
        className={styles.dts_cellInput}
        size='sm'
      />
    ),
  },
  {
    id: 'meal1In',
    accessorKey: 'meal1In',
    header: 'Meal 1 In',
    cell: ({ getValue }) => (
      <TextField
        aria-label='Meal 1 In'
        value={getValue() as string}
        isFullWidth
        className={styles.dts_cellInput}
        size='sm'
      />
    ),
  },
  {
    id: 'lastManIn',
    accessorKey: 'lastManIn',
    header: 'Last Man In',
    cell: ({ getValue }) => (
      <TextField
        aria-label='Last Man In'
        value={getValue() as string}
        isFullWidth
        className={styles.dts_cellInput}
        size='sm'
      />
    ),
  },
  {
    id: 'wrap',
    accessorKey: 'wrap',
    header: 'Wrap',
    cell: ({ getValue }) => (
      <TextField
        aria-label='Wrap'
        value={getValue() as string}
        isFullWidth
        className={styles.dts_cellInput}
        size='sm'
      />
    ),
  },
  {
    id: 'dailyAllow',
    accessorKey: 'dailyAllow',
    header: 'Daily Allow',
    cell: ({ getValue }) => (
      <TextField
        aria-label='Daily Allow'
        value={getValue() as string}
        className={styles.dts_cellInput}
        size='sm'
      />
    ),
  },
  {
    id: 'country',
    accessorKey: 'country',
    header: 'Country',
    cell: ({ getValue }) => (
      <AutocompleteInput
        aria-label='Country'
        options={COUNTRY_OPTIONS}
        value={getValue() as string}
        className={styles.dts_cellSelect}
      />
    ),
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DailyTimesheetPage() {
  const [rows, setRows] = useState<EmployeeRow[]>(SAMPLE_ROWS);

  function handleExtractComplete(ext: ExtractedTimecardData) {
    const [firstName, lastName = ''] = ext.employee.fullName.split(' ').map((n: string) => n.toUpperCase());
    setRows((prev) =>
      prev.map((r) => {
        const storedLast = r.lastName.replace(/\.+$/, '');
        const matches = r.firstName === firstName && lastName.startsWith(storedLast);
        return matches
          ? {
              ...r,
              dayType: DAY_TYPE_LABEL[ext.dayType] ?? '',
              callTime: ext.callTime ?? '',
              meal1Out: ext.meal1Out ?? '',
              meal1In: ext.meal1In ?? '',
              wrap: ext.wrapTime ?? '',
              country: COUNTRY_NAME[ext.workZone.country] ?? ext.workZone.country,
            }
          : r;
      })
    );
  }

  return (
    <div className={styles.dts_page}>
      {/* ── Main content ───────────────────────────────────── */}
      <div className={styles.dts_content}>
        <header className={styles.dts_header}>
          <div className={styles.dts_header__row}>
            {/* Date navigation */}
            <div className={styles.dts_header__dateSection}>
              <span className={styles.dts_header__dateLabel}>Date:</span>
              <div className={styles.dts_header__dateControls}>
                <IconButton
                  buttonVariant='ghost'
                  iconName='chevron-left'
                  aria-label='Previous day'
                />
                <div className={styles.dts_header__dateInputWrapper}>
                  <TextField
                    aria-label='Selected date'
                    value='Tuesday, 04/28'
                    className={styles.dts_header__dateInput}
                    size='sm'
                    endAdornment={<Icon iconName='calendar' />}
                  />
                </div>
                <IconButton
                  buttonVariant='ghost'
                  iconName='chevron-right'
                  aria-label='Next day'
                />
              </div>
            </div>

            {/* Primary actions */}
            <div className={styles.dts_header__actions}>
              <Button buttonVariant='solid'>Save</Button>
              <Button buttonVariant='outlined'>List Timecards</Button>
              <Button buttonVariant='ghost'>Clear All Changes</Button>
            </div>

            {/* Additional Fields (column-visibility trigger) */}
            <div className={styles.dts_header__secondary}>
              <ExtractModal onComplete={handleExtractComplete} />
              <Button buttonVariant='outlined'>Additional Fields</Button>
            </div>
          </div>
        </header>

        {/* Data table */}
        <div className={styles.dts_tableWrapper}>
          <GridTable<EmployeeRow>
            data={rows}
            columns={DTS_COLUMNS}
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
