import type { ProcessApiResponse, RosterEmployee } from '@scribe-timecards/shared';
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
  return { ...emptyRow(String(i + 1), emp.firstName, emp.lastName, emp.department, emp.union), occupation: emp.occupation };
}

export const SAMPLE_ROWS: EmployeeRow[] = [
  emptyRow('1', 'Joanna',  'Saczek',    'COVID', 'CCO'),
  emptyRow('2', 'Allan',   'Gaitirira', 'COVID', 'CCC'),
  emptyRow('3', 'Kristin', 'Peavler',   'COVID', 'CTC'),
];

export function applyExtractToRows(prev: EmployeeRow[], { results, confidence }: ProcessApiResponse): EmployeeRow[] {
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
    const sv = (v: number | null | undefined) => (v != null ? String(v) : '');
    return {
      ...row,
      dayType:   (day.dayType?.name ? DAY_TYPE_NAME_MAP[day.dayType.name] : undefined) ?? row.dayType,
      callTime:  sv(day.callTime)        || row.callTime,
      meal1Out:  sv(day.meal1Out)        || row.meal1Out,
      lastManIn: sv(day.meal1In)         || row.lastManIn,
      meal2Out:  sv(day.meal2Out)        || row.meal2Out,
      meal2In:   sv(day.meal2In)         || row.meal2In,
      meal3Out:  sv(day.meal3Out)        || row.meal3Out,
      wrap:      sv(day.wrapTime)        || row.wrap,
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
    };
  });
}

