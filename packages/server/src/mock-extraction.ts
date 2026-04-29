import type { ExtractionResult } from '@scribe-timecards/shared'

// JSON Schema passed to output_config.format.schema in the real API call.
// Kept here so the real implementation can import and reuse it.
export const timecardExtractionSchema = {
  type: 'object',
  properties: {
    employee: {
      type: 'object',
      properties: {
        fullName:       { type: 'string' },
        middleInitial:  { type: ['string', 'null'] },
        role:           { type: 'string' },
        department:     { type: 'string' },
        dealMemoCode:   { type: 'string' },
        unionCode:      { type: 'string' },
        occupationCode: { type: 'string' },
      },
      required: ['fullName', 'middleInitial', 'role', 'department', 'dealMemoCode', 'unionCode', 'occupationCode'],
      additionalProperties: false,
    },
    project: {
      type: 'object',
      properties: {
        title:                 { type: 'string' },
        code:                  { type: ['string', 'null'] },
        productionCompany:     { type: 'string' },
        productionCompanyCode: { type: ['string', 'null'] },
      },
      required: ['title', 'code', 'productionCompany', 'productionCompanyCode'],
      additionalProperties: false,
    },
    workDate:      { type: 'string' },
    dayType:       { type: 'string', enum: ['Worked', 'Holiday', 'Vacation', 'Sick', 'Rest', 'Travel'] },
    callTime:      { type: ['string', 'null'] },
    meal1Out:      { type: ['string', 'null'] },
    meal1In:       { type: ['string', 'null'] },
    meal2Out:      { type: ['string', 'null'] },
    meal2In:       { type: ['string', 'null'] },
    wrapTime:      { type: ['string', 'null'] },
    regularHours:  { type: 'number' },
    overtimeHours: { type: 'number' },
    dailyRate:     { type: 'number' },
    mealPenalty:   { type: 'boolean' },
    workZone: {
      type: 'object',
      properties: {
        country: { type: 'string' },
        state:   { type: 'string' },
        city:    { type: 'string' },
      },
      required: ['country', 'state', 'city'],
      additionalProperties: false,
    },
    accountCode:     { type: 'string' },
    series:          { type: ['string', 'null'] },
    episode:         { type: ['string', 'null'] },
    set:             { type: ['string', 'null'] },
    location:        { type: ['string', 'null'] },
    notes:           { type: ['string', 'null'] },
    confidence:      { type: 'string', enum: ['high', 'medium', 'low'] },

    meal1Override:   { type: ['number', 'null'] },
    meal2Override:   { type: ['number', 'null'] },
    meal3Out:        { type: ['string', 'null'] },
    meal3In:         { type: ['string', 'null'] },
    meal3Override:   { type: ['number', 'null'] },

    startTravel:     { type: ['number', 'null'] },
    startTravelTo:   { type: ['number', 'null'] },
    travelFrom:      { type: ['number', 'null'] },
    travelTo:        { type: ['number', 'null'] },
    travelHome:      { type: ['number', 'null'] },

    mkupWrdIn:       { type: ['number', 'null'] },
    mkupWrdOut:      { type: ['number', 'null'] },
    mkupWrdRem:      { type: ['number', 'null'] },

    onSet:           { type: ['number', 'null'] },
    hotelSet:        { type: ['number', 'null'] },
    setHotel:        { type: ['number', 'null'] },

    mpOverride:      { type: ['number', 'null'] },
    otOverride:      { type: ['number', 'null'] },
    stuntAdj:        { type: ['number', 'null'] },
    onCallStandBy:   { type: ['number', 'null'] },
    frenchThreshold: { type: ['number', 'null'] },

    ndb:             { type: ['boolean', 'null'] },
    ndbIn:           { type: ['number', 'null'] },
    ndbOut:          { type: ['number', 'null'] },
    ndm:             { type: ['boolean', 'null'] },
    ndmIn:           { type: ['number', 'null'] },
    ndmOut:          { type: ['number', 'null'] },

    grace1:          { type: ['boolean', 'null'] },
    grace2:          { type: ['boolean', 'null'] },
    wrapProvision:   { type: ['boolean', 'null'] },
    french:          { type: ['boolean', 'null'] },
    rerate:          { type: ['boolean', 'null'] },

    onProduction:    { type: ['boolean', 'null'] },
    payHold:         { type: ['boolean', 'null'] },
    noPhoto:         { type: ['boolean', 'null'] },
    wbMp:            { type: ['boolean', 'null'] },
    hboex15:         { type: ['boolean', 'null'] },
    hboex20:         { type: ['boolean', 'null'] },
    combineCheckCode:{ type: ['boolean', 'null'] },
    noCellAllow:     { type: ['boolean', 'null'] },
    reducedWeRest:   { type: ['boolean', 'null'] },
    loadOut:         { type: ['boolean', 'null'] },

    dgaMva:          { type: ['boolean', 'null'] },
    dgaCoa:          { type: ['boolean', 'null'] },
    dgaProdFeePrep:  { type: ['boolean', 'null'] },
  },
  required: [
    'employee', 'project', 'workDate', 'dayType',
    'callTime', 'meal1Out', 'meal1In', 'meal1Override',
    'meal2Out', 'meal2In', 'meal2Override',
    'meal3Out', 'meal3In', 'meal3Override',
    'wrapTime', 'regularHours', 'overtimeHours', 'dailyRate', 'mealPenalty',
    'workZone', 'accountCode', 'series', 'episode', 'set', 'location', 'notes', 'confidence',
    'startTravel', 'startTravelTo', 'travelFrom', 'travelTo', 'travelHome',
    'mkupWrdIn', 'mkupWrdOut', 'mkupWrdRem',
    'onSet', 'hotelSet', 'setHotel',
    'mpOverride', 'otOverride', 'stuntAdj', 'onCallStandBy', 'frenchThreshold',
    'ndb', 'ndbIn', 'ndbOut', 'ndm', 'ndmIn', 'ndmOut',
    'grace1', 'grace2', 'wrapProvision', 'french', 'rerate',
    'onProduction', 'payHold', 'noPhoto', 'wbMp', 'hboex15', 'hboex20',
    'combineCheckCode', 'noCellAllow', 'reducedWeRest', 'loadOut',
    'dgaMva', 'dgaCoa', 'dgaProdFeePrep',
  ],
  additionalProperties: false,
} as const

// ---------------------------------------------------------------------------
// Mock — stands in for the real claude.messages.create() call below.
// When an API key is available, replace mockClaudeExtract with:
//
//   const client = new Anthropic()
//   const response = await client.messages.create({
//     model: 'claude-opus-4-7',
//     max_tokens: 1024,
//     messages: [{ role: 'user', content: `Extract timecard data from this production report:\n${pdfText}` }],
//     output_config: { format: { type: 'json_schema', schema: timecardExtractionSchema } },
//   })
//   const extracted: ExtractedTimecardData = JSON.parse(
//     response.content.find(b => b.type === 'text')!.text
//   )
// ---------------------------------------------------------------------------

export async function mockClaudeExtract(): Promise<ExtractionResult> {
  await new Promise((resolve) => setTimeout(resolve, 1400))

  return {
    production: {
      title:                 { value: 'Project Nightfall (S2)', confident: true },
      code:                  { value: 'NIGHTFALL-S2',           confident: true },
      productionCompany:     { value: 'Lantern Pictures',       confident: true },
      productionCompanyCode: { value: 'LPC',                    confident: true },
    },
    timecards: [
      {
        employee: {
          fullName:       { value: 'Eloisa Axrgifsemnc', confident: true },
          middleInitial:  { value: null,                 confident: true },
          role:           { value: 'Accountant',         confident: true },
          department:     { value: 'Accounting',         confident: true },
          dealMemoCode:   { value: 'IATSE-729-ACCT',     confident: true },
          unionCode:      { value: 'IATSE-729',          confident: true },
          occupationCode: { value: 'ACCT',               confident: true },
        },
        workDate:    { value: '2026-04-22', confident: true },
        dayType:     { value: 'Worked',     confident: true },
        callTime:    { value: '07:00',      confident: true },
        meal1Out:    { value: '13:00',      confident: false },
        meal1In:     { value: '13:30',      confident: false },
        meal2Out:    { value: '18:00',      confident: true },
        meal2In:     { value: '18:30',      confident: true },
        meal3Out:    { value: null,         confident: true },
        meal3In:     { value: null,         confident: true },
        wrapTime:    { value: '21:30',      confident: false },
        dailyRate:   { value: 48.5,         confident: true },
        workZone:    { value: { country: 'US', state: 'CA', city: 'Los Angeles' }, confident: true },
        accountCode: { value: '5210-001',   confident: true },
        series:      { value: 'NIGHTFALL',  confident: true },
        episode:     { value: 'S2E03',      confident: false },
        set:         { value: 'Stage 14',   confident: true },
        location:    { value: 'Studio',     confident: true },
      },
    ],
  }
}
