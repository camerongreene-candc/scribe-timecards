import type {
  CodedValue,
  DayType,
  DayTypeCode,
  DealMemo,
  ExtractedDayType,
  ExtractedTimecardData,
  ProductionCompany,
  Project,
  Timecard,
  TimecardDay,
  WorkZone,
} from '@scribe-timecards/shared'

// ---------------------------------------------------------------------------
// Lookup tables, translate Claude extraction into  hours+ shape
// ---------------------------------------------------------------------------

const DAY_TYPE_MAP: Record<ExtractedDayType, DayType> = {
  Worked:   { id: null, code: 'W', name: 'Worked',   splittable: true,  requiresTimes: true  },
  Holiday:  { id: null, code: 'H', name: 'Holiday',  splittable: false, requiresTimes: false },
  Vacation: { id: null, code: 'V', name: 'Vacation', splittable: false, requiresTimes: false },
  Sick:     { id: null, code: 'S', name: 'Sick',     splittable: false, requiresTimes: false },
  Rest:     { id: null, code: 'R', name: 'Rest',     splittable: false, requiresTimes: false },
  Travel:   { id: null, code: 'T', name: 'Travel',   splittable: false, requiresTimes: true  },
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
    htgDayTypeId: null,
    dayType: { id: null, code: 'R' as DayTypeCode, name: 'Rest', splittable: false, requiresTimes: false },
    htgDealMemoId: dealMemoId,
    accountCode: '', rate: 0, hoursWorked: 0, workZone: null,
    call: null,
    meal1Out: null, meal1In: null, lastMan1In: null, meal1Override: null,
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
    htgDayTypeId:  null,
    dayType:       DAY_TYPE_MAP[e.dayType],
    htgDealMemoId: dealMemoId,
    accountCode:   e.accountCode,
    rate:          e.dailyRate,
    hoursWorked:   e.regularHours + e.overtimeHours,
    workZone:      toWorkZone(e.workZone),

    // Times read directly from the production report
    call:          e.callTime,
    meal1Out:      e.meal1Out,   meal1In: e.meal1In,   lastMan1In: null,   meal1Override: e.meal1Override,
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
  const nameParts     = e.employee.fullName.trim().split(' ')
  const firstName     = nameParts[0]
  const lastName      = nameParts.slice(-1)[0]
  const dealMemoId    = e.employee.dealMemoCode
  const weekStartDate = weekStart(e.workDate)
  const weekEndDate   = addDays(weekStartDate, 6)
  const workZone      = toWorkZone(e.workZone)

  const project: Project = {
    id:   '',                  // resolved from hours+ project context at submission time
    code: e.project.code ?? '',
    name: e.project.title,
  }

  const productionCompany: ProductionCompany = {
    id:   '',                  // resolved from hours+ project context at submission time
    code: e.project.productionCompanyCode ?? '',
    name: e.project.productionCompany,
  }

  // Build the full Mon–Sun week: one real day, six rest days
  const days: TimecardDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStartDate, i)
    return date === e.workDate ? workedDay(e, dealMemoId) : restDay(date, dealMemoId)
  })

  const dealMemo: DealMemo = {
    id:             dealMemoId,
    code:           e.employee.dealMemoCode,
    name:           `${e.employee.dealMemoCode} — ${e.employee.role}`,
    union:          { id: e.employee.unionCode, code: e.employee.unionCode, name: e.employee.unionCode },
    occupationCode: { id: e.employee.occupationCode, code: e.employee.occupationCode, name: e.employee.role },
    htgContract:    null,
    rate:           e.dailyRate,
    jobDescription: e.employee.role,
    isValid:        true,
    exempt:         false,
  }

  return {
    id:             0,            // hours+ assigns on save
    entryHeaderId:  '',           // hours+ assigns on save
    project,
    productionCompany,
    employee: {
      id:             '',          // Worksight ID — resolved at submission time
      firstName,
      lastName,
      middleInitial:  e.employee.middleInitial,
      occupationCode: e.employee.occupationCode,
      departmentId:   0,
      departmentName: e.employee.department,
    },
    departmentId:    0,
    departmentName:  e.employee.department,
    weekStartingDate: weekStartDate,
    weekEndingDate:   weekEndDate,
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