import type { ExtractionTimecard } from '@scribe-timecards/shared';
import type { EmployeeRow } from './DailyTimesheetPage.types';

export const toOpts = (vals: string[]) => vals.map((v) => ({ id: v, label: v }));

export const DAY_TYPE_OPTIONS  = toOpts(['1 - WORK', '2 - HOLIDAY', '3 - TRAVEL', '4 - SICK', '5 - VACATION', '6 - REST']);
export const WORK_ZONE_OPTIONS = toOpts(['Studio', 'Location', 'Distant', 'Home']);
export const COUNTRY_OPTIONS   = toOpts(['United States', 'Canada']);

export function timecardToRow(tc: ExtractionTimecard, i: number): EmployeeRow {
  const nameParts = tc.employee.fullName.value.trim().split(/\s+/);
  const lastName  = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : (nameParts[0] ?? '');
  const sv = (v: string | null | undefined) => v ?? '';
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
