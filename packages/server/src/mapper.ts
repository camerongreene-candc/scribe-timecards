import type { ExtractionTimecard, ExtractedDayType } from '@scribe-timecards/shared'
import { timeStringToDecimal, calcHoursWorked } from '@scribe-timecards/shared'
import type { DTSDay } from '@scribe-timecards/shared'

// ---------------------------------------------------------------------------
// Lookup tables
// ---------------------------------------------------------------------------

const DAY_TYPE_CODES: Record<ExtractedDayType, string> = {
  Worked:   '1',
  Holiday:  '2',
  Vacation: '5',
  Sick:     '4',
  Rest:     'R',
  Travel:   'T',
}

const STATE_NAMES: Record<string, string> = {
  AL:'Alabama', AK:'Alaska', AZ:'Arizona', AR:'Arkansas',
  CA:'California', CO:'Colorado', CT:'Connecticut', DE:'Delaware',
  FL:'Florida', GA:'Georgia', HI:'Hawaii', ID:'Idaho',
  IL:'Illinois', IN:'Indiana', IA:'Iowa', KS:'Kansas',
  KY:'Kentucky', LA:'Louisiana', ME:'Maine', MD:'Maryland',
  MA:'Massachusetts', MI:'Michigan', MN:'Minnesota', MS:'Mississippi',
  MO:'Missouri', MT:'Montana', NE:'Nebraska', NV:'Nevada',
  NH:'New Hampshire', NJ:'New Jersey', NM:'New Mexico', NY:'New York',
  NC:'North Carolina', ND:'North Dakota', OH:'Ohio', OK:'Oklahoma',
  OR:'Oregon', PA:'Pennsylvania', RI:'Rhode Island', SC:'South Carolina',
  SD:'South Dakota', TN:'Tennessee', TX:'Texas', UT:'Utah',
  VT:'Vermont', VA:'Virginia', WA:'Washington', WV:'West Virginia',
  WI:'Wisconsin', WY:'Wyoming',
}

const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom',
  AU: 'Australia',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const toDecimal = (t: string | null | undefined): number | null =>
  t != null ? timeStringToDecimal(t) : null

function codedValue(code: string, nameMap: Record<string, string>) {
  return { id: code, code, name: nameMap[code] ?? code }
}

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

export function mapTimecardToDay(t: ExtractionTimecard): Partial<DTSDay> {
  const call     = toDecimal(t.callTime.value)
  const meal1Out = toDecimal(t.meal1Out.value)
  const meal1In  = toDecimal(t.meal1In.value)
  const meal2Out = toDecimal(t.meal2Out.value)
  const meal2In  = toDecimal(t.meal2In.value)
  const meal3Out = toDecimal(t.meal3Out.value)
  const meal3In  = toDecimal(t.meal3In.value)
  const wrap     = toDecimal(t.wrapTime.value)

  const zone = t.workZone.value

  return {
    effectiveDate: `${t.workDate.value}T00:00:00`,
    dayType:       { id: DAY_TYPE_CODES[t.dayType.value], code: DAY_TYPE_CODES[t.dayType.value], name: t.dayType.value },
    rate:          t.dailyRate.value,
    hoursWorked:   calcHoursWorked({ callTime: call, wrapTime: wrap, meal1Out, meal1In, meal2Out, meal2In, meal3Out, meal3In }),
    callTime:      call,
    meal1Out,
    meal1In,
    meal2Out,
    meal2In,
    meal3Out,
    meal3In,
    wrapTime:      wrap,
    workCountry:   codedValue(zone.country, COUNTRY_NAMES),
    workState:     zone.state ? codedValue(zone.state, STATE_NAMES) : null,
    workCity:      zone.city  ? { id: zone.city, code: zone.city.slice(0, 3).toUpperCase(), name: zone.city } : null,
    accountCode:   t.accountCode.value,
    series:        t.series.value   ?? undefined,
    set:           t.set.value      ?? undefined,
    location:      t.location.value ?? undefined,
    episode:       t.episode.value  ? { id: t.episode.value, code: t.episode.value, name: t.episode.value } : undefined,
  }
}

const FIELD_NAMES: (keyof ExtractionTimecard)[] = [
  'callTime', 'meal1Out', 'meal1In', 'meal2Out', 'meal2In',
  'meal3Out', 'meal3In', 'wrapTime', 'dayType', 'workDate',
  'dailyRate', 'workZone', 'accountCode', 'series', 'episode', 'set', 'location',
]

export function mapTimecardToFlaggedFields(t: ExtractionTimecard): string[] {
  return FIELD_NAMES.filter((key) => {
    const field = t[key] as { confident: boolean }
    return !field.confident
  })
}
