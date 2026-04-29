import type { DrawerTimecard, DayRow, CommentRow, AllowanceRow, BreakdownRow, HistoryRow } from './WeeklyTimecardPage.types';

export const EMPLOYEE = { name: 'ALFONSO, JENNIFER', weekEnding: '03-14-2026' };
export const BATCH    = { code: '3249577', name: 'Test – 03-14-2026' };

export const DRAWER_TIMECARDS: DrawerTimecard[] = [
  { id: 1, name: 'ALFONSO, Jennifer',    status: 'pending_pa_review',  active: true  },
  { id: 2, name: 'TOMASSI, Rolo',        status: 'draft',              active: false },
  { id: 3, name: 'RENQUIST, Harry',      status: 'pending_pa_review',  active: false },
  { id: 4, name: 'DANIKA, Renny',        status: 'pending_upm_review', active: false },
  { id: 5, name: 'BEN, Bonjourno',       status: 'draft',              active: false },
  { id: 6, name: 'DARREN, Nalaco',       status: 'sent_to_cnc',        active: false },
  { id: 7, name: 'VALIDATION, Amy',      status: 'draft',              active: false },
  { id: 8, name: 'CIRNFBHUKQM, Mary Ann', status: 'pending_pa_review', active: false },
];

export const WEEK_DATES = [
  '2026-03-09', '2026-03-10', '2026-03-11', '2026-03-12',
  '2026-03-13', '2026-03-14', '2026-03-15',
];

export const WEEK_OPTIONS = WEEK_DATES.map((d) => ({ id: d, label: d }));

const DAY_LABELS = [
  { name: 'Monday',    date: '09 MAR' },
  { name: 'Tuesday',   date: '10 MAR' },
  { name: 'Wednesday', date: '11 MAR' },
  { name: 'Thursday',  date: '12 MAR' },
  { name: 'Friday',    date: '13 MAR' },
];

export const DAY_ROWS: DayRow[] = DAY_LABELS.map((d) => ({
  ...d,
  workLoc: 'S - Studio', dayType: '1 - WORK', callTime: '8:00',
  wrap: '17:00', hours: '9.00', account: 'fddf',
  epi: '', ser: '', loc: 'LOC', set: '', ff1: '', ff2: '',
}));

export const MASTER_ROW: DayRow = {
  _isMaster: true,
  name: '', date: '', workLoc: '', dayType: '', callTime: '',
  wrap: '', hours: '', account: '', epi: '', ser: '',
  loc: '', set: '', ff1: '', ff2: '',
};

export const MAIN_TABLE_DATA: DayRow[] = [MASTER_ROW, ...DAY_ROWS];

export const toOpts = (vals: string[]) => vals.map((v) => ({ id: v, label: v }));

export const SELECT_OPTIONS: Record<string, { id: string; label: string }[]> = {
  workLoc: toOpts(['Studio', 'Location', 'Distant', 'Home']),
  dayType: toOpts(['1 - WORK', '2 - HOLIDAY', '3 - TRAVEL', '4 - SICK', '5 - VACATION']),
  epi:     toOpts(['101', '102', '103', '104', '105']),
  loc:     toOpts(['LOC', 'Studio', 'Distant', 'Home']),
};

export const COMMENT_ROWS: CommentRow[] = [
  { date: '03/10', user: 'TOMASSI, Rolo',    text: 'Called in — confirmed remote.'    },
  { date: '03/13', user: 'ALFONSO, Jennifer', text: 'Checked in late due to travel.' },
];

export const ALLOWANCE_ROWS: AllowanceRow[] = [
  { type: 'Mileage',  amount: '45.00', account: 'fddf', epi: '', ser: '' },
  { type: 'Per Diem', amount: '75.00', account: 'fddf', epi: '', ser: '' },
];

export const BREAKDOWN_ROWS: BreakdownRow[] = [
  { label: 'Straight Time (1.0x)',  hours: '40.00', rate: '$32.50', amount: '$1,300.00' },
  { label: 'Overtime (1.5x)',       hours: '5.00',  rate: '$48.75', amount: '$243.75'   },
  { label: 'IATSE Pension (9.5%)',  hours: '',      rate: '',       amount: '$146.53'   },
  { label: 'IATSE Health (5.0%)',   hours: '',      rate: '',       amount: '$77.19'    },
];

export const HISTORY_ROWS: HistoryRow[] = [
  { date: '03/09 08:32', user: 'System',           action: 'Timecard created'          },
  { date: '03/10 17:05', user: 'ALFONSO, Jennifer', action: 'Submitted for PA review'  },
  { date: '03/11 09:15', user: 'TOMASSI, Rolo',    action: 'Saved / Calculated'        },
];

// Proportional margin to align total under the hours column.
const TABLE_COLUMN_IDS = ['workLoc', 'dayType', 'callTime', 'wrap', 'hours', 'account', 'epi', 'ser', 'loc', 'set', 'ff1', 'ff2'];
const _hoursIdx  = TABLE_COLUMN_IDS.indexOf('hours');
const _totalCols = TABLE_COLUMN_IDS.length + 1;
export const HOURS_MARGIN = `calc(${_hoursIdx + 1} / ${_totalCols} * 100%)`;
