import type { ExtractionTimecard, ProcessApiResponse, RosterEmployee } from '@scribe-timecards/shared';
import type { EmployeeRow } from './DailyTimesheetPage.types';

export const toOpts = (vals: string[]) => vals.map((v) => ({ id: v, label: v }));

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
  return emptyRow(String(i + 1), emp.firstName, emp.lastName, emp.department, emp.union);
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
      dayType:   day.dayType?.code       ?? row.dayType,
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
      },
    };
  });
}

export function timecardToRow(tc: ExtractionTimecard, i: number): EmployeeRow {
  const nameParts = tc.employee.fullName.value.trim().split(/\s+/);
  const lastName  = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : (nameParts[0] ?? '');
  const sv = (v: string | number | null | undefined) => (v != null ? String(v) : '');
  const wz = tc.workZone.value;

  return {
    id: String(i + 1),
    firstName,
    lastName,
    department:  tc.employee.department.value,
    union:       tc.employee.unionCode.value,
    dayType:     tc.dayType.value,
    workZone:    '',
    callTime:    sv(tc.callTime.value),
    meal1Out:    sv(tc.meal1Out.value),
    lastManIn:   sv(tc.meal1In.value),
    wrap:        sv(tc.wrapTime.value),
    dailyAllow:  '',
    country:     wz.country === 'US' ? 'United States' : wz.country,
    state:       wz.state,
    city:        wz.city,
    occupation:  tc.employee.role.value,
    account:     tc.accountCode.value,
    epi:         sv(tc.episode.value),
    rate:        tc.dailyRate.value != null ? String(tc.dailyRate.value) : '',
    ff1:         '',
    ndb: '', ndbOut: '', ndbEnd: '', ndm: '', ndmOut: '', ndmEnd: '',
    meal2Out:    sv(tc.meal2Out.value),
    meal2In:     sv(tc.meal2In.value),
    meal3Out:    sv(tc.meal3Out.value),
    hours: '', county: '', dealMemo: tc.employee.dealMemoCode.value,
    onProd: '', hboex15: '', hboex20: '', grace1: '', grace2: '', french: '',
    ser:  sv(tc.series.value),
    loc:  sv(tc.location.value),
    set:  sv(tc.set.value),
    workComp: '', ff2: '', ff3: '', ff4: '',
    ins: '', subDivision: '', cck: '', sch: '', frenchLimit: '', liveCk: '', status: '',
    _confidence: {
      firstName:   tc.employee.fullName.confident,
      lastName:    tc.employee.fullName.confident,
      department:  tc.employee.department.confident,
      union:       tc.employee.unionCode.confident,
      dayType:     tc.dayType.confident,
      callTime:    tc.callTime.confident,
      meal1Out:    tc.meal1Out.confident,
      lastManIn:   tc.meal1In.confident,
      meal2Out:    tc.meal2Out.confident,
      meal2In:     tc.meal2In.confident,
      meal3Out:    tc.meal3Out.confident,
      wrap:        tc.wrapTime.confident,
      country:     tc.workZone.confident,
      state:       tc.workZone.confident,
      city:        tc.workZone.confident,
      occupation:  tc.employee.role.confident,
      account:     tc.accountCode.confident,
      epi:         tc.episode.confident,
      rate:        tc.dailyRate.confident,
      ser:         tc.series.confident,
      loc:         tc.location.confident,
      set:         tc.set.confident,
    },
  };
}
