import type { ExtractionResult, ExtractionTimecard } from '@scribe-timecards/shared'

const WORK_ZONE = { country: 'US', state: 'MN', city: 'Minneapolis' }

const COMMON: Pick<ExtractionResult['timecards'][number],
  'workDate' | 'dayType' | 'dailyRate' | 'workZone' | 'accountCode' |
  'series' | 'episode' | 'set' | 'location' |
  'meal2Out' | 'meal2In' | 'meal3Out' | 'meal3In'
> = {
  workDate:    { value: '2023-02-06', confident: true },
  dayType:     { value: 'Worked',     confident: true },
  dailyRate:   { value: 0,            confident: true },
  workZone:    { value: WORK_ZONE,    confident: true },
  accountCode: { value: '',           confident: true },
  series:      { value: null,         confident: true },
  episode:     { value: null,         confident: true },
  set:         { value: null,         confident: true },
  location:    { value: 'SPFX Shop',  confident: true },
  meal2Out:    { value: null,         confident: true },
  meal2In:     { value: null,         confident: true },
  meal3Out:    { value: null,         confident: true },
  meal3In:     { value: null,         confident: true },
}

function emp(fullName: string, role: string): ExtractionTimecard['employee'] {
  return {
    fullName:       { value: fullName, confident: true },
    middleInitial:  { value: null,     confident: true },
    role:           { value: role,     confident: true },
    department:     { value: 'SPFX',   confident: true },
    dealMemoCode:   { value: '',       confident: true },
    unionCode:      { value: '',       confident: true },
    occupationCode: { value: role,     confident: true },
  }
}

export const northernLightsDiscrepancy: ExtractionResult = {
  production: {
    title:                 { value: 'Northern Lights', confident: true },
    code:                  { value: null,               confident: true },
    productionCompany:     { value: '',                 confident: true },
    productionCompanyCode: { value: null,               confident: true },
  },
  timecards: [
    {
      // meal1Out=12.5 > meal1In=12.0 → ordering discrepancy on meal1In
      ...COMMON,
      employee: emp('Dennis Yeager', 'Coordinator'),
      callTime:  { value: 6.2,  confident: true },
      meal1Out:  { value: 12.5, confident: true },
      meal1In:   { value: 12.0, confident: true },
      wrapTime:  { value: 19.3, confident: true },
    },
    {
      ...COMMON,
      employee: emp('Cara Lerud', 'Office Coordinator'),
      callTime:  { value: 6.2,  confident: true },
      meal1Out:  { value: 12.0, confident: true },
      meal1In:   { value: 12.5, confident: true },
      wrapTime:  { value: 18.3, confident: true },
    },
    {
      ...COMMON,
      employee: emp('Mike Arndt', 'Shop Foreman'),
      callTime:  { value: 6.2,  confident: true },
      meal1Out:  { value: 12.0, confident: true },
      meal1In:   { value: 12.5, confident: true },
      wrapTime:  { value: 18.3, confident: true },
    },
    {
      // wrapTime=188.5 → fails "Wrap Time must be before 48:00" validation
      ...COMMON,
      employee: emp('Bob Trevino', 'Rigging Foreman'),
      callTime:  { value: null,  confident: true },
      meal1Out:  { value: 12.0,  confident: true },
      meal1In:   { value: 12.5,  confident: true },
      wrapTime:  { value: 188.5, confident: true },
    },
    {
      ...COMMON,
      employee: emp('Josh Martin', 'Tech'),
      callTime:  { value: 6.2,  confident: true },
      meal1Out:  { value: 12.0, confident: true },
      meal1In:   { value: 12.5, confident: true },
      wrapTime:  { value: 18.3, confident: true },
    },
    {
      ...COMMON,
      employee: emp('Eddy Badaracco', 'Tech'),
      callTime:  { value: 6.2,  confident: true },
      meal1Out:  { value: 12.0, confident: true },
      meal1In:   { value: 12.5, confident: true },
      wrapTime:  { value: 18.3, confident: true },
    },
    {
      ...COMMON,
      employee: emp('Kevin Corn', 'Tech'),
      callTime:  { value: null, confident: true },
      meal1Out:  { value: 12.0, confident: true },
      meal1In:   { value: 12.5, confident: true },
      wrapTime:  { value: 18.5, confident: false },
    },
    {
      ...COMMON,
      employee: emp('Stephen Meagher', 'Tech'),
      callTime:  { value: 6.2,  confident: true },
      meal1Out:  { value: 12.0, confident: true },
      meal1In:   { value: 12.5, confident: true },
      wrapTime:  { value: 18.3, confident: true },
    },
    {
      ...COMMON,
      employee: emp('Wes Hannah', 'Tech'),
      callTime:  { value: 6.2,  confident: true },
      meal1Out:  { value: 12.0, confident: true },
      meal1In:   { value: 12.5, confident: true },
      wrapTime:  { value: 18.3, confident: true },
    },
    {
      ...COMMON,
      employee: emp('Joe Carpenter', 'Tech'),
      callTime:  { value: null, confident: true },
      meal1Out:  { value: 12.0, confident: true },
      meal1In:   { value: 12.5, confident: true },
      wrapTime:  { value: 14.5, confident: true },
    },
  ],
}
