import { z } from 'zod'

export const NON_TIME_DAY_TYPE_CODES = [
  '4',
  'DGA6NW-Prep',
  'DGA6NW-Shoot',
  'DGA7NW-Prep',
  'DGA7NW-Shoot',
  'MIN',
  'HOLD',
  '11',
] as const

export const REQUIRED_TIME_DAY_TYPE_CODES = ['1', '6', '14'] as const

const DTS_TIME_FIELD_ORDER = [
  'callTime',
  'ndbOut',
  'ndbIn',
  'meal1Out',
  'meal1In',
  'LastMan1In',
  'ndmOut',
  'ndmIn',
  'meal2Out',
  'meal2In',
  'meal3Out',
  'meal3In',
  'wrapTime',
] as const

export const timeStringToDecimal = (t: string): number => {
  const [h, m] = t.split(':').map(Number)
  return h + m / 60
}

export const decimalToTimeString = (d: number): string => {
  const h = Math.floor(d)
  const m = Math.round((d - h) * 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

const mealDuration = (out?: number | null, inn?: number | null): number =>
  out != null && inn != null ? inn - out : 0

export const calcHoursWorked = (day: {
  callTime?: number | null
  wrapTime?: number | null
  meal1Out?: number | null
  meal1In?: number | null
  meal2Out?: number | null
  meal2In?: number | null
  meal3Out?: number | null
  meal3In?: number | null
}): number | null => {
  if (day.callTime == null || day.wrapTime == null) return null
  const hours =
    day.wrapTime -
    day.callTime -
    mealDuration(day.meal1Out, day.meal1In) -
    mealDuration(day.meal2Out, day.meal2In) -
    mealDuration(day.meal3Out, day.meal3In)
  return Math.max(hours, 0)
}

export const dayTypeAllowsTimes = (code?: string | null): boolean =>
  !NON_TIME_DAY_TYPE_CODES.includes(code as (typeof NON_TIME_DAY_TYPE_CODES)[number])


const IsoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be ISO date (YYYY-MM-DD)')

const IsoDateTimeSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, 'Must be YYYY-MM-DDTHH:mm:ss')

const GenericCodeSchema = z.object({
  id: z.string(),
  code: z.string().optional(),
  name: z.string().optional(),
})

const DecimalTimeSchema = z
  .number()
  .min(0)
  .refine(
    (v) => Math.round((v % 1) * 60) <= 59,
    { message: 'Minutes must be 00–59' },
  )
  .nullable()

const TimeStringSchema = z
  .string()
  .regex(/^\d{1,2}:[0-5]\d$/, 'Time must be "H:MM" or "HH:MM" with minutes 00–59')
  .nullable()
  .optional()

const RateSchema = z.number().min(0, 'Rate cannot be less than 0').nullable().optional()

const CombineCheckSchema = z
  .string()
  .regex(/^[A-Za-z0-9!]$/, 'Combine check must be a single alphanumeric or "!" character')

// ─── Layer 1: Extracted DTS day (LLM output) ─────────────────────────────────

export const DTSExtractedDaySchema = z
  .object({
    date: IsoDateSchema,
    dayTypeCode: z.string().optional(),
    callTime: TimeStringSchema,
    meal1Out: TimeStringSchema,
    meal1In: TimeStringSchema,
    LastMan1In: TimeStringSchema,
    meal2Out: TimeStringSchema,
    meal2In: TimeStringSchema,
    meal3Out: TimeStringSchema,
    meal3In: TimeStringSchema,
    wrapTime: TimeStringSchema,
    rate: RateSchema,
    workCountryCode: z.string().optional(),
    workStateCode: z.string().optional(),
    workCityName: z.string().optional(),
    accountCode: z.string().optional(),
    episode: z.string().optional(),
    location: z.string().optional(),
    insurance: z.string().optional(),
    series: z.string().optional(),
    set: z.string().optional(),
    freeField1: z.string().optional(),
    freeField2: z.string().optional(),
    freeField3: z.string().optional(),
    freeField4: z.string().optional(),
    notes: z.string().nullable().optional(),
  })
  .refine(
    (d) => (d.meal1Out == null) === (d.meal1In == null),
    { message: 'Meal 1: both Out and In must be present or both absent', path: ['meal1In'] },
  )
  .refine(
    (d) => (d.meal2Out == null) === (d.meal2In == null),
    { message: 'Meal 2: both Out and In must be present or both absent', path: ['meal2In'] },
  )
  .refine(
    (d) => (d.meal3Out == null) === (d.meal3In == null),
    { message: 'Meal 3: both Out and In must be present or both absent', path: ['meal3In'] },
  )
  .refine(
    (d) => !d.LastMan1In || d.meal1In != null,
    { message: 'Last Man In requires Meal 1 In to be present', path: ['meal1In'] },
  )
  .refine(
    (d) => {
      if (!d.dayTypeCode || dayTypeAllowsTimes(d.dayTypeCode)) return true
      return (
        d.callTime == null &&
        d.meal1Out == null &&
        d.meal1In == null &&
        d.meal2Out == null &&
        d.meal2In == null &&
        d.meal3Out == null &&
        d.meal3In == null &&
        d.wrapTime == null
      )
    },
    { message: 'Times must be empty for this day type (e.g. HOLD, HNW, HOA)', path: ['callTime'] },
  )

export type DTSExtractedDay = z.infer<typeof DTSExtractedDaySchema>

// ─── Layer 2: DTS day detail (frontend payload format) ───────────────────────

export const DTSDaySchema = z
  .object({
    effectiveDate: IsoDateTimeSchema,
    dayType: GenericCodeSchema.optional(),
    dealMemo: z
      .object({
        id: z.string(),
        code: z.string().optional(),
        name: z.string().optional(),
      })
      .optional(),
    rate: RateSchema,
    hoursWorked: z.number().min(0).nullable().optional(),
    callTime: DecimalTimeSchema,
    meal1Out: DecimalTimeSchema,
    meal1In: DecimalTimeSchema,
    LastMan1In: DecimalTimeSchema,
    ndmOut: DecimalTimeSchema,
    ndmIn: DecimalTimeSchema,
    ndbOut: DecimalTimeSchema,
    ndbIn: DecimalTimeSchema,
    meal2Out: DecimalTimeSchema,
    meal2In: DecimalTimeSchema,
    meal3Out: DecimalTimeSchema,
    meal3In: DecimalTimeSchema,
    wrapTime: DecimalTimeSchema,
    locationType: GenericCodeSchema.nullable().optional(),
    workCountry: GenericCodeSchema.nullable().optional(),
    workState: z
      .object({
        id: z.string(),
        code: z.string().optional(),
        name: z.string().optional(),
        specialOptions: z.string().optional(),
      })
      .nullable()
      .optional(),
    workCity: GenericCodeSchema.nullable().optional(),
    workCounty: GenericCodeSchema.nullable().optional(),
    workSubdivision: GenericCodeSchema.nullable().optional(),
    accountCode: z.string().max(26).optional(),
    episode: z
      .object({ id: z.string(), code: z.string().optional(), name: z.string().optional() })
      .nullable()
      .optional(),
    location: z.string().max(26).optional(),
    insurance: z.string().max(26).optional(),
    series: z.string().max(26).optional(),
    set: z.string().max(26).optional(),
    freeField1: z.string().max(26).optional(),
    freeField2: z.string().max(26).optional(),
    freeField3: z.string().max(26).optional(),
    freeField4: z.string().max(26).optional(),
    combineCheck: CombineCheckSchema.optional(),
    schedule: GenericCodeSchema.nullable().optional(),
    occupationCode: GenericCodeSchema.nullable().optional(),
    isAutoDailyAllowance: z.boolean().nullable().optional(),
    newDay: z.boolean().optional(),
  })
  .refine(
    (d) => d.callTime == null || d.callTime < 24,
    { message: 'Call Time must be before 24:00', path: ['callTime'] },
  )
  .refine((d) => d.wrapTime == null || d.wrapTime < 48,
    { message: 'Wrap Time must be before 48:00 (overnight limit)', path: ['wrapTime'] })
  .refine((d) => d.meal1Out == null || d.meal1Out < 48,
    { message: 'Meal 1 Out must be before 48:00', path: ['meal1Out'] })
  .refine((d) => d.meal1In == null || d.meal1In < 48,
    { message: 'Meal 1 In must be before 48:00', path: ['meal1In'] })
  .refine((d) => d.meal2Out == null || d.meal2Out < 48,
    { message: 'Meal 2 Out must be before 48:00', path: ['meal2Out'] })
  .refine((d) => d.meal2In == null || d.meal2In < 48,
    { message: 'Meal 2 In must be before 48:00', path: ['meal2In'] })
  .refine((d) => d.meal3Out == null || d.meal3Out < 48,
    { message: 'Meal 3 Out must be before 48:00', path: ['meal3Out'] })
  .refine((d) => d.meal3In == null || d.meal3In < 48,
    { message: 'Meal 3 In must be before 48:00', path: ['meal3In'] })
  .refine((d) => d.wrapTime == null || d.wrapTime !== 0,
    { message: 'Wrap Time cannot be 0', path: ['wrapTime'] })
  .refine((d) => d.meal1Out == null || d.meal1Out !== 0,
    { message: 'Meal 1 Out cannot be 0', path: ['meal1Out'] })
  .refine((d) => d.meal1In == null || d.meal1In !== 0,
    { message: 'Meal 1 In cannot be 0', path: ['meal1In'] })
  .refine((d) => d.meal2Out == null || d.meal2Out !== 0,
    { message: 'Meal 2 Out cannot be 0', path: ['meal2Out'] })
  .refine((d) => d.meal2In == null || d.meal2In !== 0,
    { message: 'Meal 2 In cannot be 0', path: ['meal2In'] })
  .refine((d) => d.meal3Out == null || d.meal3Out !== 0,
    { message: 'Meal 3 Out cannot be 0', path: ['meal3Out'] })
  .refine((d) => d.meal3In == null || d.meal3In !== 0,
    { message: 'Meal 3 In cannot be 0', path: ['meal3In'] })
  .refine(
    (d) => (d.meal1Out == null) === (d.meal1In == null),
    { message: 'Meal 1: both Out and In required', path: ['meal1In'] },
  )
  .refine(
    (d) => (d.meal2Out == null) === (d.meal2In == null),
    { message: 'Meal 2: both Out and In required', path: ['meal2In'] },
  )
  .refine(
    (d) => (d.meal3Out == null) === (d.meal3In == null),
    { message: 'Meal 3: both Out and In required', path: ['meal3In'] },
  )
  .refine(
    (d) => (d.ndmOut == null) === (d.ndmIn == null),
    { message: 'NDM: both Out and In required', path: ['ndmIn'] },
  )
  .refine(
    (d) => d.LastMan1In == null || d.meal1In != null,
    { message: 'Last Man In requires Meal 1 In to be present', path: ['meal1In'] },
  )
  .refine(
    (d) => {
      const values: Record<string, number | null | undefined> = {
        callTime: d.callTime,
        ndbOut: d.ndbOut,
        ndbIn: d.ndbIn,
        meal1Out: d.meal1Out,
        meal1In: d.meal1In,
        LastMan1In: d.LastMan1In,
        ndmOut: d.ndmOut,
        ndmIn: d.ndmIn,
        meal2Out: d.meal2Out,
        meal2In: d.meal2In,
        meal3Out: d.meal3Out,
        meal3In: d.meal3In,
        wrapTime: d.wrapTime,
      }
      let prev: number | null = null
      for (const field of DTS_TIME_FIELD_ORDER) {
        const v = values[field]
        if (v == null) continue
        if (prev !== null && v <= prev) return false
        prev = v
      }
      return true
    },
    { message: 'Time fields must be in chronological order' },
  )
  .refine(
    (d) => {
      const code = d.dayType?.code
      if (!code || dayTypeAllowsTimes(code)) return true
      return (
        d.callTime == null &&
        d.meal1Out == null &&
        d.meal1In == null &&
        d.meal2Out == null &&
        d.meal2In == null &&
        d.meal3Out == null &&
        d.meal3In == null &&
        d.wrapTime == null
      )
    },
    { message: 'Times must be empty for this day type (e.g. HOLD, HNW, HOA)', path: ['callTime'] },
  )
  .refine(
    (d) => {
      const country = d.workCountry?.code
      const hasState = !!d.workState?.id
      if (!hasState && (!country || country === 'US' || country === 'CA')) return false
      return true
    },
    { message: 'Work State is required for US/Canada projects', path: ['workState'] },
  )
  .refine(
    (d) => {
      if (d.workState?.specialOptions?.includes('T') && !d.workCity?.id) return false
      return true
    },
    { message: 'Work City is required for this state', path: ['workCity'] },
  )
  .refine(
    (d) => {
      if (d.workState?.specialOptions?.includes('C') && !d.workCounty?.id) return false
      return true
    },
    { message: 'Work County is required for this state', path: ['workCounty'] },
  )
  .refine(
    (d) => {
      if (d.workState?.specialOptions?.includes('U') && !d.workSubdivision?.id) return false
      return true
    },
    { message: 'Work Subdivision is required for this state', path: ['workSubdivision'] },
  )

export type DTSDay = z.infer<typeof DTSDaySchema>

export type ProcessResponse = { employeeName: string; day: Partial<DTSDay> }

export type FieldConfidenceMap = { employeeName: string; flaggedFields: string[] }

export type ProcessApiResponse = { results: ProcessResponse[]; confidence: FieldConfidenceMap[] }

// ─── Transform: extracted day → DTS day ──────────────────────────────────────

export const extractedToDTSDay = (
  extracted: DTSExtractedDay,
  resolved: {
    dayType?: { id: string; code: string; name: string }
    workCountry?: { id: string; code: string; name: string }
    workState?: { id: string; code: string; name: string; specialOptions?: string }
    workCity?: { id: string; code: string; name: string }
  },
): Partial<DTSDay> => {
  const toDecimal = (t?: string | null): number | null =>
    t != null ? timeStringToDecimal(t) : null

  return {
    effectiveDate: `${extracted.date}T00:00:00`,
    dayType: resolved.dayType,
    callTime: toDecimal(extracted.callTime),
    meal1Out: toDecimal(extracted.meal1Out),
    meal1In: toDecimal(extracted.meal1In),
    LastMan1In: toDecimal(extracted.LastMan1In),
    meal2Out: toDecimal(extracted.meal2Out),
    meal2In: toDecimal(extracted.meal2In),
    meal3Out: toDecimal(extracted.meal3Out),
    meal3In: toDecimal(extracted.meal3In),
    wrapTime: toDecimal(extracted.wrapTime),
    rate: extracted.rate ?? undefined,
    workCountry: resolved.workCountry,
    workState: resolved.workState,
    workCity: resolved.workCity,
    accountCode: extracted.accountCode,
    location: extracted.location,
    insurance: extracted.insurance,
    series: extracted.series,
    set: extracted.set,
    freeField1: extracted.freeField1,
    freeField2: extracted.freeField2,
    freeField3: extracted.freeField3,
    freeField4: extracted.freeField4,
  }
}

// ─── Project-config-driven validation ────────────────────────────────────────

export interface DTSProjectConfig {
  accountCodeRequired?: boolean
  episodeRequired?: 'Y' | 'N'
  seriesRequired?: 'Y' | 'N'
  setRequired?: 'Y' | 'N'
  insuranceRequired?: 'Y' | 'N'
  locationRequired?: 'Y' | 'N'
  customField1Required?: 'Y' | 'N'
  customField2Required?: 'Y' | 'N'
  customField3Required?: 'Y' | 'N'
  customField4Required?: 'Y' | 'N'
}

export const makeDTSDaySchema = (config: DTSProjectConfig) => {
  const req = (flag?: boolean | 'Y' | 'N') =>
    flag === true || flag === 'Y'

  return DTSDaySchema.superRefine((d, ctx) => {
    if (req(config.accountCodeRequired) && !d.accountCode) {
      ctx.addIssue({ code: 'custom', message: 'Account Code is required', path: ['accountCode'] })
    }
    if (req(config.episodeRequired) && !d.episode?.id) {
      ctx.addIssue({ code: 'custom', message: 'Episode is required', path: ['episode'] })
    }
    if (req(config.seriesRequired) && !d.series) {
      ctx.addIssue({ code: 'custom', message: 'Series is required', path: ['series'] })
    }
    if (req(config.setRequired) && !d.set) {
      ctx.addIssue({ code: 'custom', message: 'Set is required', path: ['set'] })
    }
    if (req(config.insuranceRequired) && !d.insurance) {
      ctx.addIssue({ code: 'custom', message: 'Insurance is required', path: ['insurance'] })
    }
    if (req(config.locationRequired) && !d.location) {
      ctx.addIssue({ code: 'custom', message: 'Location is required', path: ['location'] })
    }
    if (req(config.customField1Required) && !d.freeField1) {
      ctx.addIssue({ code: 'custom', message: 'Custom Field 1 is required', path: ['freeField1'] })
    }
    if (req(config.customField2Required) && !d.freeField2) {
      ctx.addIssue({ code: 'custom', message: 'Custom Field 2 is required', path: ['freeField2'] })
    }
    if (req(config.customField3Required) && !d.freeField3) {
      ctx.addIssue({ code: 'custom', message: 'Custom Field 3 is required', path: ['freeField3'] })
    }
    if (req(config.customField4Required) && !d.freeField4) {
      ctx.addIssue({ code: 'custom', message: 'Custom Field 4 is required', path: ['freeField4'] })
    }
  })
}
