/**
 * Skeleton of the Hours+ Daily Timesheets (DTS) page, built with Spotlight.
 * No Redux, no API calls — static seed data + minimal UI state only.
 *
 * Migration: hand-rolled table → GridTable, <input> → TextField,
 * <select> → SelectInputField + Option. No MUI imports.
 */

import React, { useState } from 'react';
import {
  Button,
  Icon,
  IconButton,
  Badge,
  GridTable,
  TextField,
  SelectInputField,
  Option,
} from '@castandcrew/platform-ui';
import type { ColumnDef } from '@tanstack/react-table';
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

interface FilterSectionData {
  key: string;
  label: string;
  count: number | null;
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

const DAY_TYPE_OPTIONS = [
  '',
  '1 - WORK',
  '2 - HOLIDAY',
  '3 - TRAVEL',
  '4 - SICK',
  '5 - VACATION',
];
const WORK_ZONE_OPTIONS = ['', 'Studio', 'Location', 'Distant', 'Home'];
const COUNTRY_OPTIONS = ['United States', 'Canada'];

const FILTER_SECTIONS: FilterSectionData[] = [
  { key: 'department', label: 'Department', count: 2 },
  { key: 'batch', label: 'Batch', count: null },
  { key: 'employee', label: 'Employee', count: 15 },
  { key: 'account', label: 'Account', count: 7 },
  { key: 'episode', label: 'Episode', count: 1 },
  { key: 'set', label: 'Set', count: 1 },
  { key: 'union', label: 'Union', count: 6 },
  { key: 'offerStatus', label: 'Offer Status', count: 5 },
];

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
      <SelectInputField
        aria-label='Day Type'
        defaultSelectedKey={getValue() as string}
        className={styles.dts_cellSelect}
        isPopoverAutoSized
        
      >
        {DAY_TYPE_OPTIONS.map((o) => (
          <Option key={o === '' ? '__empty__' : o} value={o}>
            {o || ' '}
          </Option>
        ))}
      </SelectInputField>
    ),
  },
  {
    id: 'workZone',
    accessorKey: 'workZone',
    header: 'Work Zone',
    cell: ({ getValue }) => (
      <SelectInputField
        aria-label='Work Zone'
        defaultSelectedKey={getValue() as string}
        className={styles.dts_cellSelect}
        isPopoverAutoSized
        
      >
        {WORK_ZONE_OPTIONS.map((o) => (
          <Option key={o === '' ? '__empty__' : o} value={o}>
            {o || ' '}
          </Option>
        ))}
      </SelectInputField>
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
      <SelectInputField
        aria-label='Country'
        defaultSelectedKey={getValue() as string}
        className={styles.dts_cellSelect}
        isPopoverAutoSized
        
      >
        {COUNTRY_OPTIONS.map((o) => (
          <Option key={o} value={o}>
            {o}
          </Option>
        ))}
      </SelectInputField>
    ),
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterSection({
  label,
  count,
}: {
  label: string;
  count: number | null;
}) {
  return (
    <div className={styles.dts_filterSection}>
      <div className={styles.dts_filterSectionHeader}>
        <span className={styles.dts_filterSectionLabel}>{label}</span>
        <div className={styles.dts_filterSectionRight}>
          {count != null && <Badge badgeValue={count} />}
          <Icon iconName='chevron-down' size='sm' />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DailyTimesheetPage() {
  const [showFilters, setShowFilters] = useState(true);
  const [timesheetType, setTimesheetType] = useState<'cast' | 'crew'>('crew');

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
              <Button buttonVariant='outlined'>Additional Fields</Button>
            </div>
          </div>
        </header>

        {/* Data table */}
        <div className={styles.dts_tableWrapper}>
          <GridTable<EmployeeRow>
            data={SAMPLE_ROWS}
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

      {/* ── Right filter panel ─────────────────────────────── */}
      <aside className={styles.dts_filtersPane}>
        <div className={styles.dts_filtersSeparator} />

        {showFilters ? (
          <div className={`spotlight_container ${styles.dts_filtersInner}`}>
            <div className={styles.dts_filtersHeader}>
              <span className={styles.dts_filtersTitle}>
                Refine Your Search
              </span>
              <Button
                buttonVariant='ghost'
                startAdornment='chevron-right'
                aria-label='Collapse filters'
                onClick={() => setShowFilters(false)}
              />
            </div>

            <div className={styles.dts_filtersControls}>
              <Button buttonVariant='ghost' size='sm' isDestructive>
                Reset Filters
              </Button>
              <Button buttonVariant='ghost' size='sm'>
                Expand All
              </Button>
            </div>

            {/* Cast / Crew segmented toggle */}
            <div className={styles.dts_castCrewToggle}>
              <button
                className={`${styles.dts_toggleBtn} ${timesheetType === 'cast' ? styles['dts_toggleBtn--active'] : ''}`}
                onClick={() => setTimesheetType('cast')}
              >
                Cast
              </button>
              <button
                className={`${styles.dts_toggleBtn} ${timesheetType === 'crew' ? styles['dts_toggleBtn--active'] : ''}`}
                onClick={() => setTimesheetType('crew')}
              >
                Crew
              </button>
            </div>

            <div className={styles.dts_filtersList}>
              {FILTER_SECTIONS.map((s) => (
                <FilterSection key={s.key} label={s.label} count={s.count} />
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.dts_filtersMinified}>
            <Button
              buttonVariant='ghost'
              startAdornment='chevron-left'
              aria-label='Expand filters'
              onClick={() => setShowFilters(true)}
            />
          </div>
        )}
      </aside>
    </div>
  );
}
