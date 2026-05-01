import type { ExtractionResult, ExtractionTimecard } from '@scribe-timecards/shared'

const WORK_ZONE = { country: 'US', state: 'TX', city: 'Fort Worth' }

const COMMON: Pick<ExtractionTimecard,
  'workDate' | 'dayType' | 'dailyRate' | 'workZone' | 'accountCode' |
  'series' | 'episode' | 'set' | 'location' |
  'meal2Out' | 'meal2In' | 'meal3Out' | 'meal3In'
> = {
  workDate:    { value: '2023-05-24',                                           confident: true },
  dayType:     { value: 'Worked',                                               confident: true },
  dailyRate:   { value: 0,                                                      confident: true },
  workZone:    { value: WORK_ZONE,                                              confident: true },
  accountCode: { value: '',                                                     confident: true },
  series:      { value: 'Bass Reeves',                                          confident: true },
  episode:     { value: '107',                                                  confident: true },
  set:         { value: null,                                                   confident: true },
  location:    { value: 'West Fork Ranch, 10201 Camp Bowie W. Blvd, Fort Worth, TX 76116', confident: true },
  meal2Out:    { value: null,                                                   confident: true },
  meal2In:     { value: null,                                                   confident: true },
  meal3Out:    { value: null,                                                   confident: true },
  meal3In:     { value: null,                                                   confident: true },
}

function emp(
  fullName: string,
  role: string,
  fullNameConfident = true,
): ExtractionTimecard['employee'] {
  return {
    fullName:       { value: fullName, confident: fullNameConfident },
    middleInitial:  { value: null,     confident: true },
    role:           { value: role,     confident: true },
    department:     { value: 'SET LIGHTING', confident: true },
    dealMemoCode:   { value: '',       confident: true },
    unionCode:      { value: '',       confident: true },
    occupationCode: { value: role,     confident: true },
  }
}

export const sunsetRidgeLowConfidence: ExtractionResult = {
  production: {
    title:                 { value: 'Bass Reeves',                    confident: true },
    code:                  { value: null,                             confident: true },
    productionCompany:     { value: 'King Street Productions, Inc.',  confident: true },
    productionCompanyCode: { value: null,                             confident: true },
  },
  timecards: [
    {
      ...COMMON,
      employee: emp('John Gorman', 'CLT'),
      callTime:  { value: 13.6,  confident: true },
      meal1Out:  { value: 20.5,  confident: true },
      meal1In:   { value: 21.5,  confident: true },
      wrapTime:  { value: 29.6,  confident: true },
    },
    {
      ...COMMON,
      employee: emp('Daniel Del Toro', 'ACLT'),
      callTime:  { value: 13.6,  confident: true },
      meal1Out:  { value: 20.5,  confident: true },
      meal1In:   { value: 21.5,  confident: true },
      wrapTime:  { value: 30.0,  confident: true },
    },
    {
      ...COMMON,
      employee: emp('Will Dameron', 'Lighting Console Programmer'),
      callTime:  { value: 13.6,  confident: true  },
      meal1Out:  { value: 20.5,  confident: false },  // low confidence from source
      meal1In:   { value: 21.5,  confident: true  },
      wrapTime:  { value: 29.6,  confident: true  },
    },
    {
      ...COMMON,
      employee: emp('John Lee', 'Set Lighting Tech'),
      callTime:  { value: 13.6,  confident: true },
      meal1Out:  { value: 20.5,  confident: true },
      meal1In:   { value: 21.5,  confident: true },
      wrapTime:  { value: 29.6,  confident: true },
    },
    {
      ...COMMON,
      employee: emp('Taylor Cremeens', 'Set Lighting Tech'),
      callTime:  { value: 14.0,  confident: true },
      meal1Out:  { value: 20.5,  confident: true },
      meal1In:   { value: 21.5,  confident: true },
      wrapTime:  { value: 29.2,  confident: true },
    },
    {
      ...COMMON,
      employee: emp('Lucas Zepeda', 'Set Lighting Tech'),
      callTime:  { value: 14.0,  confident: true  },
      meal1Out:  { value: 20.5,  confident: false },  // low confidence from source
      meal1In:   { value: 21.5,  confident: true  },
      wrapTime:  { value: 29.2,  confident: true  },
    },
    {
      ...COMMON,
      employee: emp('Maximo Contreras', 'Set Lighting Tech'),
      callTime:  { value: 14.0,  confident: true },
      meal1Out:  { value: 20.5,  confident: true },
      meal1In:   { value: 21.5,  confident: true },
      wrapTime:  { value: 29.2,  confident: true },
    },
    {
      ...COMMON,
      employee: emp('Will Penson', 'Addl Set Lighting Tech'),
      callTime:  { value: 15.0,  confident: false },  // low confidence from source
      meal1Out:  { value: 20.5,  confident: true  },
      meal1In:   { value: 21.5,  confident: true  },
      wrapTime:  { value: 29.2,  confident: true  },
    },
    {
      ...COMMON,
      employee: emp('Andrew Ferrucci', 'Addl Set Lighting Tech'),
      callTime:  { value: 15.0,  confident: true },
      meal1Out:  { value: 20.5,  confident: true },
      meal1In:   { value: 21.5,  confident: true },
      wrapTime:  { value: 29.2,  confident: true },
    },
    {
      ...COMMON,
      employee: emp('Alec Wisdom', 'Addl Set Lighting Tech', false),  // name low confidence from source
      callTime:  { value: 14.0,  confident: true },
      meal1Out:  { value: 20.5,  confident: true },
      meal1In:   { value: 21.5,  confident: true },
      wrapTime:  { value: 29.2,  confident: true },
    },
  ],
}
