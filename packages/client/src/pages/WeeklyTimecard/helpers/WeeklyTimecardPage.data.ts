import type { RosterEmployee } from '@scribe-timecards/shared';
import type { DrawerTimecard, DayRow, CommentRow, AllowanceRow, BreakdownRow, HistoryRow } from './WeeklyTimecardPage.types';

export function rosterToDrawerTimecard(emp: RosterEmployee, i: number): DrawerTimecard {
  const name = `${emp.lastName.toUpperCase()}, ${emp.firstName}`;
  return { id: i + 1, name, subtitle: emp.occupation || emp.department, status: 'draft', active: i === 0 };
}

export const EMPLOYEE = { name: 'SACZEK, JOANNA', weekEnding: '04-02-2022' };
export const BATCH    = { code: '3249577', name: 'WACO – 04-02-2022' };

export const DRAWER_TIMECARDS: DrawerTimecard[] = [
  { id: 1, name: 'SACZEK, Joanna',    subtitle: '0124 – COVID COORD / CCO',  status: 'pending_pa_review', active: true },
];

export const WEEK_DATES = [
  '2022-03-27', '2022-03-28', '2022-03-29', '2022-03-30',
  '2022-03-31', '2022-04-01', '2022-04-02',
];

export const WEEK_OPTIONS = WEEK_DATES.map((d) => ({ id: d, label: d }));

// Joanna Saczek — static-bloom mock extraction (2022-03-28)
// callTime=8:00  meal1Out=14:00  meal1In=14:30  wrap=20:30
// hoursWorked = 20.5 - 8.0 - (14.5 - 14.0) = 12.00
export const DAY_ROWS: DayRow[] = [
  { name: 'Monday', date: '28 MAR', workLoc: 'S - Studio', dayType: '1 - WORK', callTime: '8:00', wrap: '20:30', hours: '12.00', account: '', epi: '', ser: '', loc: 'Burbank', set: '', ff1: '', ff2: '' },
];

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
