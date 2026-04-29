/**
 * Skeleton replica of the Hours+ WTC (Weekly Time Card) reviewer page.
 *
 * Uses Spotlight components from @castandcrew/platform-ui.
 * No Redux, no backend calls, no event side-effects — just static structure
 * with minimal local UI state (drawer open/closed).
 */

import React, { useState } from 'react';
import {
  Button,
  Icon,
  Badge,
  SquareIconToggleButton,
  GridTable,
  AutocompleteInput,
  FieldLabel,
  TextField,
} from '@castandcrew/platform-ui';
import styles from './WeeklyTimecardPage.module.css';

// ─── Static seed data ──────────────────────────────────────────────────────────

const EMPLOYEE = { name: 'ALFONSO, JENNIFER', weekEnding: '03-14-2026' };
const BATCH = { code: '3249577', name: 'Test – 03-14-2026' };

const DRAWER_TIMECARDS = [
  {
    id: 1,
    name: 'ALFONSO, Jennifer',
    status: 'pending_pa_review',
    active: true,
  },
  { id: 2, name: 'TOMASSI, Rolo', status: 'draft', active: false },
  {
    id: 3,
    name: 'RENQUIST, Harry',
    status: 'pending_pa_review',
    active: false,
  },
  { id: 4, name: 'DANIKA, Renny', status: 'pending_upm_review', active: false },
  { id: 5, name: 'BEN, Bonjourno', status: 'draft', active: false },
  { id: 6, name: 'DARREN, Nalaco', status: 'sent_to_cnc', active: false },
  { id: 7, name: 'VALIDATION, Amy', status: 'draft', active: false },
  {
    id: 8,
    name: 'CIRNFBHUKQM, Mary Ann',
    status: 'pending_pa_review',
    active: false,
  },
];

const WEEK_DATES = [
  '2026-03-09',
  '2026-03-10',
  '2026-03-11',
  '2026-03-12',
  '2026-03-13',
  '2026-03-14',
  '2026-03-15',
];

const WEEK_OPTIONS = WEEK_DATES.map((d) => ({ id: d, label: d }));

const DAY_LABELS = [
  { name: 'Monday', date: '09 MAR' },
  { name: 'Tuesday', date: '10 MAR' },
  { name: 'Wednesday', date: '11 MAR' },
  { name: 'Thursday', date: '12 MAR' },
  { name: 'Friday', date: '13 MAR' },
];

const DAY_ROWS = DAY_LABELS.map((d) => ({
  ...d,
  workLoc: 'S - Studio',
  dayType: '1 - WORK',
  callTime: '8:00',
  wrap: '17:00',
  hours: '9.00',
  account: 'fddf',
  epi: '',
  ser: '',
  loc: 'LOC',
  set: '',
  ff1: '',
  ff2: '',
}));

const TABLE_COLUMNS = [
  { id: 'workLoc', label: 'Work Zone' },
  { id: 'dayType', label: 'Day Type' },
  { id: 'callTime', label: 'Call Time' },
  { id: 'wrap', label: 'Wrap' },
  { id: 'hours', label: 'Hours' },
  { id: 'account', label: 'Account' },
  { id: 'epi', label: 'Epi' },
  { id: 'ser', label: 'Ser' },
  { id: 'loc', label: 'Loc' },
  { id: 'set', label: 'Set' },
  { id: 'ff1', label: 'FF1' },
  { id: 'ff2', label: 'FF2' },
];

const COMMENT_ROWS = [
  {
    date: '03/10',
    user: 'TOMASSI, Rolo',
    text: 'Called in — confirmed remote.',
  },
  {
    date: '03/13',
    user: 'ALFONSO, Jennifer',
    text: 'Checked in late due to travel.',
  },
];

const ALLOWANCE_ROWS = [
  { type: 'Mileage', amount: '45.00', account: 'fddf', epi: '', ser: '' },
  { type: 'Per Diem', amount: '75.00', account: 'fddf', epi: '', ser: '' },
];

const BREAKDOWN_ROWS = [
  {
    label: 'Straight Time (1.0x)',
    hours: '40.00',
    rate: '$32.50',
    amount: '$1,300.00',
  },
  {
    label: 'Overtime (1.5x)',
    hours: '5.00',
    rate: '$48.75',
    amount: '$243.75',
  },
  { label: 'IATSE Pension (9.5%)', hours: '', rate: '', amount: '$146.53' },
  { label: 'IATSE Health (5.0%)', hours: '', rate: '', amount: '$77.19' },
];

const HISTORY_ROWS = [
  { date: '03/09 08:32', user: 'System', action: 'Timecard created' },
  {
    date: '03/10 17:05',
    user: 'ALFONSO, Jennifer',
    action: 'Submitted for PA review',
  },
  { date: '03/11 09:15', user: 'TOMASSI, Rolo', action: 'Saved / Calculated' },
];

// ─── GridTable column definitions ─────────────────────────────────────────────

const CALC_COL_IDS   = new Set(['hours']);
const SELECT_COL_IDS = new Set(['workLoc', 'dayType', 'epi', 'loc']);

const toOpts = (vals) => vals.map((v) => ({ id: v, label: v }));
const SELECT_OPTIONS = {
  workLoc: toOpts(['Studio', 'Location', 'Distant', 'Home']),
  dayType: toOpts(['1 - WORK', '2 - HOLIDAY', '3 - TRAVEL', '4 - SICK', '5 - VACATION']),
  epi:     toOpts(['101', '102', '103', '104', '105']),
  loc:     toOpts(['LOC', 'Studio', 'Distant', 'Home']),
};

const MASTER_ROW = {
  _isMaster: true,
  name: '',
  date: '',
  workLoc: '',
  dayType: '',
  callTime: '',
  wrap: '',
  hours: '',
  account: '',
  epi: '',
  ser: '',
  loc: '',
  set: '',
  ff1: '',
  ff2: '',
};

const MAIN_TABLE_DATA = [MASTER_ROW, ...DAY_ROWS];

// Align total value under the hours column using proportional calc margin.
// +1 accounts for the leading day column.
const _hoursIdx = TABLE_COLUMNS.findIndex((c) => c.id === 'hours');
const _totalCols = TABLE_COLUMNS.length + 1;
const HOURS_MARGIN = `calc(${_hoursIdx + 1} / ${_totalCols} * 100%)`;

const MAIN_COLUMNS = [
  {
    id: 'day',
    enableSorting: false,
    header: () => (
      <Button buttonVariant='solid' size='xs'>
        Edit Days / Times
      </Button>
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
    accessorKey: col.id,
    header: col.label,
    enableSorting: false,
    cell: ({ row, getValue }) => {
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
          size="sm"
          isInvalid={col.id === 'ser' && !value && !isMaster}
          inputProps={{ 'aria-label': col.label }}
          className={styles.wtc_cellInput}
        />
      );
    },
  })),
];

const COMMENT_COLS = [
  { accessorKey: 'date', header: 'Date', enableSorting: false },
  { accessorKey: 'user', header: 'User', enableSorting: false },
  { accessorKey: 'text', header: 'Comment', enableSorting: false },
];

const ALLOWANCE_COLS = [
  { accessorKey: 'type', header: 'Type', enableSorting: false },
  { accessorKey: 'amount', header: 'Amount', enableSorting: false },
  { accessorKey: 'account', header: 'Account', enableSorting: false },
  { accessorKey: 'epi', header: 'Epi', enableSorting: false },
  { accessorKey: 'ser', header: 'Ser', enableSorting: false },
];

const BREAKDOWN_COLS = [
  { accessorKey: 'label', header: 'Pay Category', enableSorting: false },
  { accessorKey: 'hours', header: 'Hours', enableSorting: false },
  { accessorKey: 'rate', header: 'Rate', enableSorting: false },
  {
    accessorKey: 'amount',
    header: 'Amount',
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className={styles['wtc_altTd--amount']}>
        {String(getValue() ?? '')}
      </span>
    ),
  },
];

const HISTORY_COLS = [
  { accessorKey: 'date', header: 'Date / Time', enableSorting: false },
  { accessorKey: 'user', header: 'User', enableSorting: false },
  { accessorKey: 'action', header: 'Action', enableSorting: false },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function DrawerTimecardItem({ tc }) {
  return (
    <div
      className={`${styles.wtc_drawer__item} ${tc.active ? styles['wtc_drawer__item--active'] : ''}`}
    >
      <span className={styles.wtc_drawer__itemName}>{tc.name}</span>
      <span
        className={`${styles.wtc_drawer__status} ${styles[`wtc_drawer__status--${tc.status}`]}`}
      >
        {tc.status.replace(/_/g, ' ')}
      </span>
    </div>
  );
}

function CommentsSection() {
  return (
    <section className={styles.wtc_section}>
      <div className={styles.wtc_section__header}>
        <Icon iconName='comment' size='sm' />
        <span className={styles.wtc_section__title}>Comments</span>
        <Button buttonVariant='ghost' size='xs'>
          Add Comment
        </Button>
      </div>
      <GridTable
        data={COMMENT_ROWS}
        columns={COMMENT_COLS}
        enablePagination={false}
        enableSorting={false}
      />
    </section>
  );
}

function AllowancesSection() {
  return (
    <section className={styles.wtc_section}>
      <div className={styles.wtc_section__header}>
        <Icon iconName='clock' size='sm' />
        <span className={styles.wtc_section__title}>Allowances</span>
      </div>
      <GridTable
        data={ALLOWANCE_ROWS}
        columns={ALLOWANCE_COLS}
        enablePagination={false}
        enableSorting={false}
      />
    </section>
  );
}

function BreakdownSection() {
  return (
    <section className={styles.wtc_section}>
      <div className={styles.wtc_section__header}>
        <Icon iconName='chart-bar' size='sm' />
        <span className={styles.wtc_section__title}>Breakdown</span>
      </div>
      <GridTable
        data={BREAKDOWN_ROWS}
        columns={BREAKDOWN_COLS}
        enablePagination={false}
        enableSorting={false}
      />
    </section>
  );
}

function HistorySection() {
  return (
    <section className={styles.wtc_section}>
      <div className={styles.wtc_section__header}>
        <Icon iconName='history' size='sm' />
        <span className={styles.wtc_section__title}>History</span>
      </div>
      <GridTable
        data={HISTORY_ROWS}
        columns={HISTORY_COLS}
        enablePagination={false}
        enableSorting={false}
      />
    </section>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────────

export default function WeeklyTimecardPage() {
  const [drawerOpen, setDrawerOpen] = useState(true);

  return (
    <div className={styles.wtc_page}>
      {/* ── Left Drawer ───────────────────────────────────────────── */}
      {drawerOpen ? (
        <aside className={styles.wtc_drawer}>
          <div className={styles.wtc_drawer__header}>
            <span className={styles.wtc_drawer__title}>Timecards</span>
            <div className={styles.wtc_drawer__headerActions}>
              <SquareIconToggleButton
                iconName='arrow-down-to-line'
                aria-label='Download report'
              />
              <SquareIconToggleButton
                iconName='people-arrows'
                aria-label='Move timecards'
              />
              <SquareIconToggleButton
                iconName='arrow-left-from-line'
                aria-label='Collapse drawer'
                onClick={() => setDrawerOpen(false)}
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
      ) : (
        <aside className={styles.wtc_drawer__minified}>
          <SquareIconToggleButton
            iconName='arrow-right-from-line'
            aria-label='Expand drawer'
            onClick={() => setDrawerOpen(true)}
          />
        </aside>
      )}

      {/* ── Main content ──────────────────────────────────────────── */}
      <div className={styles.wtc_content}>
        {/* ── Header ────────────────────────────────────────────────── */}
        <header className={styles.wtc_header}>
          <Button buttonVariant='ghost' startAdornment='chevron-left'>
            Back to List
          </Button>

          <div className={styles.wtc_header__nameRow}>
            <h2
              className={`spotlight_heading-sm ${styles.wtc_header__empName}`}
            >
              {EMPLOYEE.name}
            </h2>
            <div className={styles.wtc_header__weekEnding}>
              <span className={styles.wtc_header__weekEndingLabel}>
                Week Ending: {EMPLOYEE.weekEnding}
              </span>
              <Icon iconName='chevron-down' size='sm' />
            </div>
            <span className={styles.wtc_header__batchInfo}>
              Batch: {BATCH.code} – {BATCH.name}
            </span>
          </div>

          <div className={styles.wtc_header__actionsRow}>
            <div className={styles.wtc_header__btnGroup}>
              <Button buttonVariant='solid' size='sm'>
                Submit for Approval
              </Button>
              <Button buttonVariant='outlined' size='sm'>
                Disable Auto-Coding
              </Button>
              <Button buttonVariant='solid' size='sm'>
                Save / Calculate
              </Button>
              <Button
                buttonVariant='outlined'
                size='sm'
                isDestructive
                startAdornment='trash'
              >
                Delete
              </Button>
              <Button
                buttonVariant='ghost'
                size='sm'
                startAdornment='arrow-rotate-left'
              >
                Revert
              </Button>
              <SquareIconToggleButton iconName='print' aria-label='Print' />
            </div>

            <div className={styles.wtc_header__weekSelectors}>
              <div className={styles.wtc_header__weekField}>
                <FieldLabel label="Producer's Week" />
                <AutocompleteInput
                  options={WEEK_OPTIONS}
                  defaultSelectedKey={WEEK_DATES[0]}
                />
              </div>
              <div className={styles.wtc_header__weekField}>
                <FieldLabel label="Employee's Week" />
                <AutocompleteInput
                  options={WEEK_OPTIONS}
                  defaultSelectedKey={WEEK_DATES[0]}
                />
              </div>
            </div>
          </div>

          <div className={styles.wtc_header__subRow}>
            <Button
              buttonVariant='outlined'
              size='xs'
              startAdornment='file-lines'
            >
              View Deal Memos
            </Button>
          </div>
        </header>

        {/* ── Timecard days table ────────────────────────────────────── */}
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
            <span
              className={styles.wtc_totalLabel}
              style={{ marginLeft: HOURS_MARGIN }}
            >
              Total:
            </span>
            <span className={`spotlight_heading-sm ${styles.wtc_totalValue}`}>
              {DAY_ROWS.reduce(
                (sum, r) => sum + (parseFloat(r.hours) || 0),
                0,
              ).toFixed(2)}
            </span>
          </div>
        </div>

        {/* ── Bottom sections ────────────────────────────────────────── */}
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
