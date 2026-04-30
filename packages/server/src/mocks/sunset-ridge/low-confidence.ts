import type { ExtractionResult } from '@scribe-timecards/shared'

export const sunsetRidgeLowConfidence: ExtractionResult = {
  production: {
    title:                 { value: 'Sunset Ridge',  confident: true },
    code:                  { value: null,             confident: true },
    productionCompany:     { value: 'Test Co.',       confident: true },
    productionCompanyCode: { value: null,             confident: true },
  },
  timecards: [
    {
      employee: {
        fullName:       { value: 'Test Employee', confident: true },
        middleInitial:  { value: null,            confident: true },
        role:           { value: 'CAMERA PA',     confident: true },
        department:     { value: 'CAMERA',        confident: true },
        dealMemoCode:   { value: '0001',          confident: true },
        unionCode:      { value: 'IATSE',         confident: true },
        occupationCode: { value: 'CAMERA PA',     confident: true },
      },
      workDate:    { value: '2024-01-15',                                  confident: true  },
      dayType:     { value: 'Worked',                                      confident: false },
      callTime:    { value: 7.0,                                           confident: false },
      meal1Out:    { value: 13.0,                                          confident: false },
      meal1In:     { value: 13.5,                                          confident: false },
      meal2Out:    { value: null,                                          confident: true  },
      meal2In:     { value: null,                                          confident: true  },
      meal3Out:    { value: null,                                          confident: true  },
      meal3In:     { value: null,                                          confident: true  },
      wrapTime:    { value: 19.0,                                          confident: false },
      dailyRate:   { value: 0,                                             confident: false },
      workZone:    { value: { country: 'US', state: 'CA', city: 'Burbank' }, confident: false },
      accountCode: { value: '',                                            confident: false },
      series:      { value: null,                                          confident: true  },
      episode:     { value: null,                                          confident: true  },
      set:         { value: null,                                          confident: true  },
      location:    { value: null,                                          confident: true  },
    },
  ],
}
