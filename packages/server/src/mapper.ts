import type { ExtractedTimecardData, ExtractedDayType } from '@scribe-timecards/shared'
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

export function mapExtractionToDTSDay(e: ExtractedTimecardData): Partial<DTSDay> {
  const call     = toDecimal(e.callTime)
  const meal1Out = toDecimal(e.meal1Out)
  const meal1In  = toDecimal(e.meal1In)
  const meal2Out = toDecimal(e.meal2Out)
  const meal2In  = toDecimal(e.meal2In)
  const meal3Out = toDecimal(e.meal3Out)
  const meal3In  = toDecimal(e.meal3In)
  const wrap     = toDecimal(e.wrapTime)

  return {
    effectiveDate: `${e.workDate}T00:00:00`,
    dayType:       { id: DAY_TYPE_CODES[e.dayType], code: DAY_TYPE_CODES[e.dayType], name: e.dayType },
    rate:          e.dailyRate,
    hoursWorked:   calcHoursWorked({ callTime: call, wrapTime: wrap, meal1Out, meal1In, meal2Out, meal2In, meal3Out, meal3In }),
    callTime:      call,
    meal1Out,
    meal1In,
    meal2Out,
    meal2In,
    meal3Out,
    meal3In,
    wrapTime:      wrap,
    ndbOut:        e.ndbOut,
    ndbIn:         e.ndbIn,
    ndmOut:        e.ndmOut,
    ndmIn:         e.ndmIn,
    workCountry:   codedValue(e.workZone.country, COUNTRY_NAMES),
    workState:     e.workZone.state ? codedValue(e.workZone.state, STATE_NAMES) : null,
    workCity:      e.workZone.city  ? { id: e.workZone.city, code: e.workZone.city.slice(0, 3).toUpperCase(), name: e.workZone.city } : null,
    accountCode:   e.accountCode,
    series:        e.series   ?? undefined,
    set:           e.set      ?? undefined,
    location:      e.location ?? undefined,
    episode:       e.episode  ? { id: e.episode, code: e.episode, name: e.episode } : undefined,
  }
}
