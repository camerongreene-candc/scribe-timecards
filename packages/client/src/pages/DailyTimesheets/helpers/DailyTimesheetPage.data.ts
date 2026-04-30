import type { ProcessApiResponse, RosterEmployee, DTSDay } from '@scribe-timecards/shared';
import { decimalToTimeString, timeStringToDecimal, getValidationFlaggedFields } from '@scribe-timecards/shared';
import type { EmployeeRow } from './DailyTimesheetPage.types';

export const toOpts = (vals: string[]) => vals.map((v) => ({ id: v, label: v }));

const DAY_TYPE_NAME_MAP: Record<string, string> = {
  Worked:   '1 - WORK',
  Holiday:  '2 - HOLIDAY',
  Travel:   '3 - TRAVEL',
  Sick:     '4 - SICK',
  Vacation: '5 - VACATION',
  Rest:     '6 - REST',
};

export const DAY_TYPE_OPTIONS  = toOpts(['1 - WORK', '2 - HOLIDAY', '3 - TRAVEL', '4 - SICK', '5 - VACATION', '6 - REST']);
export const WORK_ZONE_OPTIONS = toOpts(['Studio', 'Location', 'Distant', 'Home']);
export const COUNTRY_OPTIONS   = toOpts(['United States', 'Canada']);

const emptyRow = (id: string, firstName: string, lastName: string, department: string, union: string): EmployeeRow => ({
  id, firstName, lastName, department, union,
  occupation: '', dayType: '', workZone: '', callTime: '', meal1Out: '', lastManIn: '',
  wrap: '', dailyAllow: '', country: '', state: '', city: '',
  account: '', epi: '', rate: '', ff1: '',
  ndb: '', ndbOut: '', ndbEnd: '', ndm: '', ndmOut: '', ndmEnd: '',
  meal2Out: '', meal2In: '', meal3Out: '', hours: '', county: '', dealMemo: '',
  onProd: '', hboex15: '', hboex20: '', grace1: '', grace2: '', french: '',
  ser: '', loc: '', set: '', workComp: '', ff2: '', ff3: '', ff4: '',
  ins: '', subDivision: '', cck: '', sch: '', frenchLimit: '', liveCk: '', status: '',
});

export function rosterToRow(emp: RosterEmployee, i: number): EmployeeRow {
  return { ...emptyRow(String(i + 1), emp.firstName, emp.lastName, emp.department, emp.union), occupation: emp.occupation, dealMemo: emp.dealMemo };
}

export const SAMPLE_ROWS: EmployeeRow[] = [
  emptyRow('1', 'Joanna',  'Saczek',    'COVID', 'CCO'),
  emptyRow('2', 'Allan',   'Gaitirira', 'COVID', 'CCC'),
  emptyRow('3', 'Kristin', 'Peavler',   'COVID', 'CTC'),
];

// Maps DTSDay field names (from validation) to EmployeeRow field names
const VALIDATION_FIELD_MAP: Record<string, string> = {
  wrapTime:    'wrap',
  meal1In:     'lastManIn',
  LastMan1In:  'lastManIn',
  workCountry: 'country',
  workState:   'state',
  workCity:    'city',
  accountCode: 'account',
  episode:     'epi',
  location:    'loc',
  series:      'ser',
};

export function validateRow(row: EmployeeRow): Partial<Record<string, string>> {
  const td = (s: string): number | null => s ? timeStringToDecimal(s) : null;
  const coded = (s: string) => s ? { id: s, name: s } : undefined;
  const day: Partial<DTSDay> = {
    callTime:    td(row.callTime),
    meal1Out:    td(row.meal1Out),
    meal1In:     td(row.lastManIn),
    meal2Out:    td(row.meal2Out),
    meal2In:     td(row.meal2In),
    meal3Out:    td(row.meal3Out),
    wrapTime:    td(row.wrap),
    dayType:     row.dayType ? { id: row.dayType, code: row.dayType.split(' - ')[0], name: row.dayType } : undefined,
    workCountry: coded(row.country),
    workState:   coded(row.state),
    workCity:    coded(row.city),
    accountCode: row.account || undefined,
    series:      row.ser     || undefined,
    location:    row.loc     || undefined,
    set:         row.set     || undefined,
    episode:     coded(row.epi),
  };
  return Object.fromEntries(
    getValidationFlaggedFields(day).map(({ fieldName, errorMessage }) => [
      VALIDATION_FIELD_MAP[fieldName] ?? fieldName,
      errorMessage,
    ])
  );
}

export function applyExtractToRows(prev: EmployeeRow[], { results, confidence, validation }: ProcessApiResponse): EmployeeRow[] {
  return prev.map((row) => {
    const match = results.find(({ employeeName }) => {
      const parts = employeeName.trim().split(/\s+/);
      const last  = parts[parts.length - 1].toUpperCase();
      const first = parts.slice(0, -1).join(' ').toUpperCase();
      return row.firstName.toUpperCase() === first && row.lastName.toUpperCase() === last;
    });
    if (!match) return row;
    const { day } = match;
    const flagged = new Set(confidence.find((c) => c.employeeName === match.employeeName)?.flaggedFields ?? []);
    const ok = (f: string) => !flagged.has(f);
    const st = (v: number | null | undefined) => (v != null ? decimalToTimeString(v) : '');
    return {
      ...row,
      dayType:   (day.dayType?.name ? DAY_TYPE_NAME_MAP[day.dayType.name] : undefined) ?? row.dayType,
      callTime:  st(day.callTime)        || row.callTime,
      meal1Out:  st(day.meal1Out)        || row.meal1Out,
      lastManIn: st(day.meal1In)         || row.lastManIn,
      meal2Out:  st(day.meal2Out)        || row.meal2Out,
      meal2In:   st(day.meal2In)         || row.meal2In,
      meal3Out:  st(day.meal3Out)        || row.meal3Out,
      wrap:      st(day.wrapTime)        || row.wrap,
      country:   day.workCountry?.name   ?? row.country,
      state:     day.workState?.name     ?? row.state,
      city:      day.workCity?.name      ?? row.city,
      account:   day.accountCode         || row.account,
      ser:       day.series              || row.ser,
      loc:       day.location            || row.loc,
      set:       day.set                 || row.set,
      epi:       day.episode?.name       ?? row.epi,
      rate:      (day.rate != null ? String(day.rate) : '') || row.rate,
      _confidence: {
        dayType:   ok('dayType'),
        callTime:  ok('callTime'),
        meal1Out:  ok('meal1Out'),
        lastManIn: ok('meal1In'),
        meal2Out:  ok('meal2Out'),
        meal2In:   ok('meal2In'),
        meal3Out:  ok('meal3Out'),
        wrap:      ok('wrapTime'),
        country:   ok('workZone'),
        state:     ok('workZone'),
        city:      ok('workZone'),
        account:   ok('accountCode'),
        ser:       ok('series'),
        loc:       ok('location'),
        set:       ok('set'),
        epi:       ok('episode'),
        rate:      ok('dailyRate'),
      },
      _discrepancy: Object.fromEntries(
        (validation.find((v) => v.employeeName === match.employeeName)?.flaggedFields ?? [])
          .map(({ fieldName, errorMessage }) => [
            VALIDATION_FIELD_MAP[fieldName] ?? fieldName,
            errorMessage,
          ])
      ),
    };
  });
}

