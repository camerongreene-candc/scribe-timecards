import type { ExtractionResult, ExtractionTimecard } from '@scribe-timecards/shared'

const WORK_ZONE = { country: 'US', state: 'CA', city: 'Burbank' }

function emp(
  fullName: string,
  role: string,
  dealMemoCode: string,
  unionCode: string,
  occupationCode: string,
): ExtractionTimecard['employee'] {
  return {
    fullName:       { value: fullName,       confident: true },
    middleInitial:  { value: null,           confident: true },
    role:           { value: role,           confident: true },
    department:     { value: 'COVID',        confident: true },
    dealMemoCode:   { value: dealMemoCode,   confident: true },
    unionCode:      { value: unionCode,      confident: true },
    occupationCode: { value: occupationCode, confident: true },
  }
}

function day(
  callTime: number | null,
  meal1Out: number | null,
  meal1In: number | null,
  wrapTime: number | null,
): Pick<ExtractionTimecard, 'callTime' | 'meal1Out' | 'meal1In' | 'meal2Out' | 'meal2In' | 'meal3Out' | 'meal3In' | 'wrapTime'> {
  return {
    callTime: { value: callTime, confident: true },
    meal1Out: { value: meal1Out, confident: true },
    meal1In:  { value: meal1In,  confident: true },
    meal2Out: { value: null,     confident: true },
    meal2In:  { value: null,     confident: true },
    meal3Out: { value: null,     confident: true },
    meal3In:  { value: null,     confident: true },
    wrapTime: { value: wrapTime, confident: true },
  }
}

const COMMON: Pick<ExtractionTimecard, 'workDate' | 'dayType' | 'dailyRate' | 'workZone' | 'accountCode' | 'series' | 'episode' | 'set' | 'location'> = {
  workDate:    { value: '2022-03-28',      confident: true },
  dayType:     { value: 'Worked',          confident: true },
  dailyRate:   { value: 0,                 confident: true },
  workZone:    { value: WORK_ZONE,         confident: true },
  accountCode: { value: '',               confident: true },
  series:      { value: null,              confident: true },
  episode:     { value: null,              confident: true },
  set:         { value: null,              confident: true },
  location:    { value: null,              confident: true },
}

export const staticBloomHappy: ExtractionResult = {
  production: {
    title:                 { value: 'Static Bloom',                              confident: true },
    code:                  { value: null,                                         confident: true },
    productionCompany:     { value: 'King Streep Productions/Crane Town Media',   confident: true },
    productionCompanyCode: { value: null,                                         confident: true },
  },
  timecards: [
    { employee: emp('Joanna Saczek',   'CCO',        '0124', 'CCO',  'CCO'),        ...day(8.0, 14.0, 14.5, 20.5), ...COMMON },
    { employee: emp('Allan Gaitirira', 'CCC',        '0125', 'CCC',  'CCC'),        ...day(6.3, 12.3, 12.8, 21.0), ...COMMON },
    { employee: emp('Kristin Peavler', 'CTC',        '0126', 'CTC',  'CTC'),        ...day(8.0, 14.0, 14.5, 20.5), ...COMMON },
    { employee: emp('Drake Terrill',   'COVID PA',   '0127', 'NPPA', 'COVID PA'),   ...day(7.5, 13.5, 14.0, 19.0), ...COMMON },
    // Garson Salas: times written as "O"/"F" on original sheet — treated as absent/unclear
    { employee: emp('Garson Salas',    'COVID PA',   '0128', 'NPPA', 'COVID PA'),   ...day(null, null, null, null), ...COMMON },
    { employee: emp('Blanca Alas',     'COVID PA',   '0129', 'NPPA', 'COVID PA'),   ...day(7.0, 13.0, 13.5, 19.2), ...COMMON },
    { employee: emp('Dylan Adamson',   'COVID PA',   '0130', 'NPPA', 'COVID PA'),   ...day(7.5, 13.5, 14.0, 20.0), ...COMMON },
    { employee: emp('Sara James',      'TESTING PA', '0131', 'NPPA', 'TESTING PA'), ...day(7.0, 13.0, 13.5, 19.5), ...COMMON },
    { employee: emp('Tyler Burch',     'TESTING PA', '0132', 'NPPA', 'TESTING PA'), ...day(7.2, 13.0, 13.5, 19.5), ...COMMON },
    { employee: emp('James Williams',  'COVID PA',   '0133', 'NPPA', 'COVID PA'),   ...day(7.5, 13.5, 14.0, 20.0), ...COMMON },
  ],
}
