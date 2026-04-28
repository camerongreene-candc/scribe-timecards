import type {
  CodedValue,
  DayType,
  DayTypeCode,
  DealMemo,
  ExtractedDayType,
  ExtractedTimecardData,
  Timecard,
  TimecardDay,
  WorkZone,
} from '@scribe-timecards/shared'

// ---------------------------------------------------------------------------
// Lookup tables, translate Claude extraction into  hours+ shape
// ---------------------------------------------------------------------------

const DAY_TYPE_MAP: Record<ExtractedDayType, DayType> = {
  Worked:   { code: 'W', name: 'Worked' },
  Holiday:  { code: 'H', name: 'Holiday' },
  Vacation: { code: 'V', name: 'Vacation' },
  Sick:     { code: 'S', name: 'Sick' },
  Rest:     { code: 'R', name: 'Rest' },
  Travel:   { code: 'T', name: 'Travel' },
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

function codedValue(code: string, nameMap: Record<string, string>): CodedValue {
  return { id: code, code, name: nameMap[code] ?? code }
}

function toWorkZone(wz: ExtractedTimecardData['workZone']): WorkZone {
  return {
    country: codedValue(wz.country, COUNTRY_NAMES),
    state:   codedValue(wz.state, STATE_NAMES),
    city:    { id: wz.city, code: wz.city.slice(0, 3).toUpperCase(), name: wz.city },
    county:  null,
  }
}

// Claude extracts a single work date — SaveTimecardRequest needs the full Mon–Sun week
function weekStart(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00Z')
  const dow = d.getUTCDay()
  d.setUTCDate(d.getUTCDate() - (dow === 0 ? 6 : dow - 1))
  return d.toISOString().slice(0, 10)
}

function addDays(isoDate: string, n: number): string {
  const d = new Date(isoDate + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

// ---------------------------------------------------------------------------
// Day builders
// ---------------------------------------------------------------------------

// Every day in the week that isn't the worked day gets a blank rest day
function restDay(date: string, dealMemoId: string): TimecardDay {
  return {
    date,
    dayType: { code: 'R' as DayTypeCode, name: 'Rest' },
    htgDealMemoId: dealMemoId,
    accountCode: '', rate: 0, hoursWorked: 0, workZone: null,
    call: null,
    meal1Out: null, meal1In: null, meal1Override: null,
    meal2Out: null, meal2In: null, meal2Override: null,
    meal3Out: null, meal3In: null, meal3Override: null,
    wrap: null, mpOverride: null,
    episode: null, series: null, set: null, location: null,
    startTravel: null, startTravelTo: null,
    travelFrom: null, travelTo: null, travelHome: null,
    mkupWrdIn: null, mkupWrdOut: null, mkupWrdRem: null,
    onSet: null, hotelSet: null, setHotel: null,
    otOverride: null, stuntAdj: null, onCallStandBy: null, frenchThreshold: null,
    ndb: false, ndbIn: null, ndbOut: null,
    ndm: false, ndmIn: null, ndmOut: null,
    grace1: false, grace2: false, wrapProvision: false, french: false, rerate: false,
    onProduction: false, payHold: false, noPhoto: false,
    wbMp: false, hboex15: false, hboex20: false,
    combineCheckCode: false, noCellAllow: false, reducedWeRest: false, loadOut: false,
    dgaMva: false, dgaCoa: false, dgaProdFeePrep: false,
  }
}

// The actual production report day — every field Claude read off the PDF maps here
function workedDay(e: ExtractedTimecardData, dealMemoId: string): TimecardDay {
  return {
    date:          e.workDate,
    dayType:       DAY_TYPE_MAP[e.dayType],
    htgDealMemoId: dealMemoId,
    accountCode:   e.accountCode,
    rate:          e.dailyRate,
    hoursWorked:   e.regularHours + e.overtimeHours,
    workZone:      toWorkZone(e.workZone),

    // Times read directly from the production report
    call:          e.callTime,
    meal1Out:      e.meal1Out,   meal1In: e.meal1In,   meal1Override: e.meal1Override,
    meal2Out:      e.meal2Out,   meal2In: e.meal2In,   meal2Override: e.meal2Override,
    meal3Out:      e.meal3Out,   meal3In: e.meal3In,   meal3Override: e.meal3Override,
    wrap:          e.wrapTime,   mpOverride: e.mpOverride,

    // Production info from the report header
    episode: e.episode, series: e.series, set: e.set, location: e.location,

    // Travel & movement
    startTravel: e.startTravel, startTravelTo: e.startTravelTo,
    travelFrom:  e.travelFrom,  travelTo: e.travelTo, travelHome: e.travelHome,

    // Makeup / wardrobe times
    mkupWrdIn: e.mkupWrdIn, mkupWrdOut: e.mkupWrdOut, mkupWrdRem: e.mkupWrdRem,

    // On-set times
    onSet: e.onSet, hotelSet: e.hotelSet, setHotel: e.setHotel,

    // Pay overrides
    otOverride: e.otOverride, stuntAdj: e.stuntAdj,
    onCallStandBy: e.onCallStandBy, frenchThreshold: e.frenchThreshold,

    // NDB / NDM
    ndb: e.ndb ?? false, ndbIn: e.ndbIn, ndbOut: e.ndbOut,
    ndm: e.ndm ?? false, ndmIn: e.ndmIn, ndmOut: e.ndmOut,

    // Flags — default false if Claude couldn't determine
    grace1:        e.grace1        ?? false,
    grace2:        e.grace2        ?? false,
    wrapProvision: e.wrapProvision ?? false,
    french:        e.french        ?? false,
    rerate:        e.rerate        ?? false,
    onProduction:  e.onProduction  ?? (e.dayType === 'Worked'),
    // Low confidence extraction gets flagged for human review via payHold
    payHold:       e.payHold       ?? (e.confidence === 'low'),
    noPhoto:       e.noPhoto       ?? false,
    wbMp:          e.wbMp          ?? false,
    hboex15:       e.hboex15       ?? false,
    hboex20:       e.hboex20       ?? false,
    combineCheckCode: e.combineCheckCode ?? false,
    noCellAllow:      e.noCellAllow      ?? false,
    reducedWeRest:    e.reducedWeRest    ?? false,
    loadOut:          e.loadOut          ?? false,
    dgaMva:           e.dgaMva           ?? false,
    dgaCoa:           e.dgaCoa           ?? false,
    dgaProdFeePrep:   e.dgaProdFeePrep   ?? false,
  }
}

// ---------------------------------------------------------------------------
// Public — this is what replaces a payroll accountant reading the PDF and
// manually filling in the hours+ timecard form
// ---------------------------------------------------------------------------

export function mapExtractionToTimecard(e: ExtractedTimecardData): Timecard {
  const [firstName, ...rest] = e.employee.fullName.trim().split(' ')
  const lastName   = rest.join(' ')
  const dealMemoId = e.employee.dealMemoCode
  const startsOn   = weekStart(e.workDate)
  const endsOn     = addDays(startsOn, 6)
  const workZone   = toWorkZone(e.workZone)

  // Build the full Mon–Sun week: one real day, six rest days
  const days: TimecardDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startsOn, i)
    return date === e.workDate ? workedDay(e, dealMemoId) : restDay(date, dealMemoId)
  })

  const dealMemo: DealMemo = {
    id:             dealMemoId,
    code:           e.employee.dealMemoCode,
    name:           `${e.employee.dealMemoCode} — ${e.employee.role}`,
    union:          { code: e.employee.unionCode,      name: e.employee.unionCode },
    occupationCode: { code: e.employee.occupationCode, name: e.employee.role },
    rate:           e.dailyRate,
  }

  return {
    id:             0,            // hours+ assigns on save
    entryHeaderId:  '',           // hours+ assigns on save
    projectId:      0,            // provided by hours+ context at submission time
    projectName:    e.project.title,
    employee: { id: 0, firstName, lastName, occupationCode: e.employee.occupationCode },
    startsOn,
    endsOn,
    status:          'draft',
    worksightStatus: 'DRAFT',
    batchId:         null,
    htgDealMemoId:   dealMemoId,
    dealMemo,
    workZone,
    totalWorked:     days.reduce((sum, d) => sum + d.hoursWorked, 0),
    totalAllowances: e.mealPenalty ? 25 : 0,
    days,
  }
}