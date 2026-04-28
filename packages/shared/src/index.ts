export interface ApiResponse<T> {
  data: T
  error?: string
}

export interface HealthResponse {
  status: 'ok'
}

// ---------------------------------------------------------------------------
// structured output from claude
//  JSON Schema object for output_config.format.schema mirrors this shape
// ---------------------------------------------------------------------------

export type ExtractionConfidence = 'high' | 'medium' | 'low'

export type ExtractedDayType =
  | 'Worked'
  | 'Holiday'
  | 'Vacation'
  | 'Sick'
  | 'Rest'
  | 'Travel'

/** Shape of a single block.text response from claude.messages.create() */
export interface ExtractedTimecardData {
  employee: {
    fullName: string
    role: string
    dealMemoCode: string
    unionCode: string
    occupationCode: string
  }
  project: {
    title: string
    productionCompany: string
  }
  workDate: string        // ISO date "YYYY-MM-DD"
  dayType: ExtractedDayType
  callTime: string | null  // "HH:MM" 24h, null if rest/holiday
  meal1Out: string | null
  meal1In: string | null
  meal1Override: number | null
  meal2Out: string | null
  meal2In: string | null
  meal2Override: number | null
  meal3Out: string | null
  meal3In: string | null
  meal3Override: number | null
  wrapTime: string | null
  regularHours: number
  overtimeHours: number
  dailyRate: number
  mealPenalty: boolean
  workZone: {
    country: string     // ISO code e.g. "US"
    state: string       // state/province code e.g. "CA"
    city: string        // city name e.g. "Los Angeles"
  }
  accountCode: string
  series: string | null
  episode: string | null
  set: string | null
  location: string | null
  notes: string | null
  confidence: ExtractionConfidence

  // Travel & movement
  startTravel: number | null      // hours
  startTravelTo: number | null
  travelFrom: number | null
  travelTo: number | null
  travelHome: number | null

  // Makeup / wardrobe
  mkupWrdIn: number | null
  mkupWrdOut: number | null
  mkupWrdRem: number | null       // Mkup/Wrd Rem

  // On set
  onSet: number | null
  hotelSet: number | null         // Hotel-Set
  setHotel: number | null         // Set-Hotel

  // Pay & rate overrides
  mpOverride: number | null       // MP Override $
  otOverride: number | null       // OT Override
  stuntAdj: number | null         // Stunt Adj
  onCallStandBy: number | null    // OnCall/StandBy
  frenchThreshold: number | null

  // Non-deductible break / meal
  ndb: boolean | null             // NDB flag
  ndbIn: number | null
  ndbOut: number | null
  ndm: boolean | null             // NDM flag
  ndmIn: number | null
  ndmOut: number | null

  // Meal & grace flags
  grace1: boolean | null
  grace2: boolean | null
  wrapProvision: boolean | null
  french: boolean | null
  rerate: boolean | null

  // Production flags
  onProduction: boolean | null
  payHold: boolean | null
  noPhoto: boolean | null          // No Photo
  wbMp: boolean | null             // WB MP
  hboex15: boolean | null          // HBOEX15
  hboex20: boolean | null          // HBOEX20
  combineCheckCode: boolean | null
  noCellAllow: boolean | null      // NoCellAllow
  reducedWeRest: boolean | null    // Reduced WE Rest
  loadOut: boolean | null          // Load Out

  // DGA-specific
  dgaMva: boolean | null           // DGA MVA
  dgaCoa: boolean | null           // DGA COA
  dgaProdFeePrep: boolean | null   // DGA Prod Fee Prep
}

// ---------------------------------------------------------------------------
// Hours+ schema, the target shape the extrqacted data is mapped to
// ---------------------------------------------------------------------------

export type TimecardStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'paid'

export type DayTypeCode = 'W' | 'H' | 'V' | 'S' | 'R' | 'T'

export interface DayType {
  code: DayTypeCode
  name: string
}

export interface CodedValue {
  id: string
  code: string
  name: string
}

export interface WorkZone {
  country: CodedValue
  state: CodedValue
  city: CodedValue
  county: CodedValue | null
}

export interface DealMemo {
  id: string
  code: string
  name: string
  union: Pick<CodedValue, 'code' | 'name'>
  occupationCode: Pick<CodedValue, 'code' | 'name'>
  rate: number
}

export interface Employee {
  id: number
  firstName: string
  lastName: string
  occupationCode: string
}

export interface TimecardDay {
  date: string
  dayType: DayType
  htgDealMemoId: string
  accountCode: string
  rate: number
  hoursWorked: number
  workZone: WorkZone | null

  // Times
  call: string | null
  meal1Out: string | null
  meal1In: string | null
  meal1Override: number | null
  meal2Out: string | null
  meal2In: string | null
  meal2Override: number | null
  meal3Out: string | null
  meal3In: string | null
  meal3Override: number | null
  wrap: string | null
  mpOverride: number | null       // MP Override $

  // Production info
  episode: string | null
  series: string | null
  set: string | null
  location: string | null

  // Travel & movement
  startTravel: number | null
  startTravelTo: number | null
  travelFrom: number | null
  travelTo: number | null
  travelHome: number | null

  // Makeup / wardrobe
  mkupWrdIn: number | null        // Mkup/Wrd In
  mkupWrdOut: number | null       // Mkup/Wrd Out
  mkupWrdRem: number | null       // Mkup/Wrd Rem

  // On set
  onSet: number | null
  hotelSet: number | null         // Hotel-Set
  setHotel: number | null         // Set-Hotel

  // Pay overrides
  otOverride: number | null
  stuntAdj: number | null
  onCallStandBy: number | null
  frenchThreshold: number | null

  // NDB / NDM
  ndb: boolean
  ndbIn: number | null
  ndbOut: number | null
  ndm: boolean
  ndmIn: number | null
  ndmOut: number | null

  // Meal & grace flags
  grace1: boolean
  grace2: boolean
  wrapProvision: boolean
  french: boolean
  rerate: boolean

  // Production flags
  onProduction: boolean
  payHold: boolean
  noPhoto: boolean                // No Photo
  wbMp: boolean                   // WB MP
  hboex15: boolean
  hboex20: boolean
  combineCheckCode: boolean
  noCellAllow: boolean
  reducedWeRest: boolean          // Reduced WE Rest
  loadOut: boolean                // Load Out

  // DGA
  dgaMva: boolean                 // DGA MVA
  dgaCoa: boolean                 // DGA COA
  dgaProdFeePrep: boolean         // DGA Prod Fee Prep
}

export interface Timecard {
  id: number
  entryHeaderId: string
  projectId: number
  projectName: string
  employee: Employee
  startsOn: string   // ISO date
  endsOn: string
  status: TimecardStatus
  worksightStatus: string
  batchId: number | null
  htgDealMemoId: string
  dealMemo: DealMemo
  workZone: WorkZone
  totalWorked: number
  totalAllowances: number
  days: TimecardDay[]
}
