import type { EmployeeRow, Confidence } from './DailyTimesheetPage.types';

export const toOpts = (vals: string[]) => vals.map((v) => ({ id: v, label: v }));

export const DAY_TYPE_OPTIONS  = toOpts(['1 - WORK', '2 - HOLIDAY', '3 - TRAVEL', '4 - SICK', '5 - VACATION', '6 - REST']);
export const WORK_ZONE_OPTIONS = toOpts(['Studio', 'Location', 'Distant', 'Home']);
export const COUNTRY_OPTIONS   = toOpts(['United States', 'Canada']);

interface ApiField {
  value: string | null;
  confidence: Confidence;
}

interface ApiResponse {
  production: {
    company: ApiField;
    showTitle: ApiField;
    department: ApiField;
    workDate: ApiField;
    workZone: { country: ApiField; state: ApiField };
  };
  timecards: {
    employeeName: ApiField;
    position: ApiField;
    dayType: ApiField;
    callTime: ApiField;
    meal1Out: ApiField;
    meal1In: ApiField;
    meal2Out: ApiField;
    meal2In: ApiField;
    wrapTime: ApiField;
    regularHours: ApiField;
    overtimeHours: ApiField;
    ndb: ApiField;
    kit: ApiField;
    car: ApiField;
    dailyRate: ApiField;
    employeeSignature: ApiField;
  }[];
}

export const MOCK_API_RESPONSE: ApiResponse = {
  "production": {
    "company":    { "value": "King Streep Productions / Crane Town Media", "confidence": "high" },
    "showTitle":  { "value": "Waco - The Aftermath", "confidence": "high" },
    "department": { "value": "COVID", "confidence": "high" },
    "workDate":   { "value": "2022-03-28", "confidence": "high" },
    "workZone": {
      "country": { "value": "US",   "confidence": "high" },
      "state":   { "value": null,   "confidence": "low" }
    }
  },
  "timecards": [
    {
      "employeeName": { "value": "Joanna Saczek",  "confidence": "high" },
      "position":     { "value": "CCO",            "confidence": "high" },
      "dayType":      { "value": "Worked",         "confidence": "high" },
      "callTime":     { "value": "08:00",          "confidence": "high" },
      "meal1Out":     { "value": "14:00",          "confidence": "high" },
      "meal1In":      { "value": "14:30",          "confidence": "high" },
      "meal2Out":     { "value": null,             "confidence": "high" },
      "meal2In":      { "value": null,             "confidence": "high" },
      "wrapTime":     { "value": "20:30",          "confidence": "high" },
      "regularHours": { "value": null,             "confidence": "low"  },
      "overtimeHours":{ "value": null,             "confidence": "low"  },
      "ndb":          { "value": null,             "confidence": "high" },
      "kit":          { "value": null,             "confidence": "high" },
      "car":          { "value": null,             "confidence": "high" },
      "dailyRate":    { "value": null,             "confidence": "low"  },
      "employeeSignature": { "value": "JS",        "confidence": "high" }
    },
    {
      "employeeName": { "value": "Allan Gaitirira", "confidence": "high"   },
      "position":     { "value": "CCC",             "confidence": "high"   },
      "dayType":      { "value": "Worked",           "confidence": "high"   },
      "callTime":     { "value": "06:18",            "confidence": "medium" },
      "meal1Out":     { "value": "12:18",            "confidence": "medium" },
      "meal1In":      { "value": "12:48",            "confidence": "medium" },
      "meal2Out":     { "value": null,               "confidence": "high"   },
      "meal2In":      { "value": null,               "confidence": "high"   },
      "wrapTime":     { "value": "21:00",            "confidence": "high"   },
      "regularHours": { "value": null,               "confidence": "low"    },
      "overtimeHours":{ "value": null,               "confidence": "low"    },
      "ndb":          { "value": null,               "confidence": "high"   },
      "kit":          { "value": null,               "confidence": "high"   },
      "car":          { "value": null,               "confidence": "high"   },
      "dailyRate":    { "value": null,               "confidence": "low"    },
      "employeeSignature": { "value": "AG",          "confidence": "high"   }
    },
    {
      "employeeName": { "value": "Kristin Peavler", "confidence": "high" },
      "position":     { "value": "CTC",             "confidence": "high" },
      "dayType":      { "value": "Worked",          "confidence": "high" },
      "callTime":     { "value": "08:00",           "confidence": "high" },
      "meal1Out":     { "value": "14:00",           "confidence": "high" },
      "meal1In":      { "value": "14:30",           "confidence": "high" },
      "meal2Out":     { "value": null,              "confidence": "high" },
      "meal2In":      { "value": null,              "confidence": "high" },
      "wrapTime":     { "value": "20:30",           "confidence": "high" },
      "regularHours": { "value": null,              "confidence": "low"  },
      "overtimeHours":{ "value": null,              "confidence": "low"  },
      "ndb":          { "value": null,              "confidence": "high" },
      "kit":          { "value": null,              "confidence": "high" },
      "car":          { "value": null,              "confidence": "high" },
      "dailyRate":    { "value": null,              "confidence": "low"  },
      "employeeSignature": { "value": "KP",         "confidence": "high" }
    },
    {
      "employeeName": { "value": "Drake Terrill",  "confidence": "high" },
      "position":     { "value": "COVID PA",       "confidence": "high" },
      "dayType":      { "value": "Worked",         "confidence": "high" },
      "callTime":     { "value": "07:30",          "confidence": "high" },
      "meal1Out":     { "value": "13:30",          "confidence": "high" },
      "meal1In":      { "value": "14:00",          "confidence": "high" },
      "meal2Out":     { "value": null,             "confidence": "high" },
      "meal2In":      { "value": null,             "confidence": "high" },
      "wrapTime":     { "value": "19:00",          "confidence": "high" },
      "regularHours": { "value": null,             "confidence": "low"  },
      "overtimeHours":{ "value": null,             "confidence": "low"  },
      "ndb":          { "value": null,             "confidence": "high" },
      "kit":          { "value": null,             "confidence": "high" },
      "car":          { "value": null,             "confidence": "high" },
      "dailyRate":    { "value": null,             "confidence": "low"  },
      "employeeSignature": { "value": "DT",        "confidence": "high" }
    },
    {
      "employeeName": { "value": "Garson Salas",  "confidence": "high"   },
      "position":     { "value": "COVID PA",      "confidence": "high"   },
      "dayType":      { "value": "Worked",        "confidence": "medium" },
      "callTime":     { "value": null,            "confidence": "low"    },
      "meal1Out":     { "value": null,            "confidence": "low"    },
      "meal1In":      { "value": null,            "confidence": "low"    },
      "meal2Out":     { "value": null,            "confidence": "high"   },
      "meal2In":      { "value": null,            "confidence": "high"   },
      "wrapTime":     { "value": null,            "confidence": "low"    },
      "regularHours": { "value": null,            "confidence": "low"    },
      "overtimeHours":{ "value": null,            "confidence": "low"    },
      "ndb":          { "value": null,            "confidence": "high"   },
      "kit":          { "value": null,            "confidence": "high"   },
      "car":          { "value": null,            "confidence": "high"   },
      "dailyRate":    { "value": null,            "confidence": "low"    },
      "employeeSignature": { "value": null,       "confidence": "low"    }
    },
    {
      "employeeName": { "value": "Blanca Alas",   "confidence": "high"   },
      "position":     { "value": "COVID PA",      "confidence": "high"   },
      "dayType":      { "value": "Worked",        "confidence": "high"   },
      "callTime":     { "value": "07:00",         "confidence": "high"   },
      "meal1Out":     { "value": "13:00",         "confidence": "high"   },
      "meal1In":      { "value": "13:30",         "confidence": "high"   },
      "meal2Out":     { "value": null,            "confidence": "high"   },
      "meal2In":      { "value": null,            "confidence": "high"   },
      "wrapTime":     { "value": "19:12",         "confidence": "medium" },
      "regularHours": { "value": null,            "confidence": "low"    },
      "overtimeHours":{ "value": null,            "confidence": "low"    },
      "ndb":          { "value": null,            "confidence": "high"   },
      "kit":          { "value": null,            "confidence": "high"   },
      "car":          { "value": null,            "confidence": "high"   },
      "dailyRate":    { "value": null,            "confidence": "low"    },
      "employeeSignature": { "value": "BA",       "confidence": "high"   }
    },
    {
      "employeeName": { "value": "Dylan Adamson", "confidence": "high" },
      "position":     { "value": "COVID PA",      "confidence": "high" },
      "dayType":      { "value": "Worked",        "confidence": "high" },
      "callTime":     { "value": "07:30",         "confidence": "high" },
      "meal1Out":     { "value": "13:30",         "confidence": "high" },
      "meal1In":      { "value": "14:00",         "confidence": "high" },
      "meal2Out":     { "value": null,            "confidence": "high" },
      "meal2In":      { "value": null,            "confidence": "high" },
      "wrapTime":     { "value": "20:00",         "confidence": "high" },
      "regularHours": { "value": null,            "confidence": "low"  },
      "overtimeHours":{ "value": null,            "confidence": "low"  },
      "ndb":          { "value": null,            "confidence": "high" },
      "kit":          { "value": null,            "confidence": "high" },
      "car":          { "value": null,            "confidence": "high" },
      "dailyRate":    { "value": null,            "confidence": "low"  },
      "employeeSignature": { "value": "DA",       "confidence": "high" }
    },
    {
      "employeeName": { "value": "Sara James",   "confidence": "high" },
      "position":     { "value": "Testing PA",   "confidence": "high" },
      "dayType":      { "value": "Worked",       "confidence": "high" },
      "callTime":     { "value": "07:00",        "confidence": "high" },
      "meal1Out":     { "value": "13:00",        "confidence": "high" },
      "meal1In":      { "value": "13:30",        "confidence": "high" },
      "meal2Out":     { "value": null,           "confidence": "high" },
      "meal2In":      { "value": null,           "confidence": "high" },
      "wrapTime":     { "value": "19:30",        "confidence": "high" },
      "regularHours": { "value": null,           "confidence": "low"  },
      "overtimeHours":{ "value": null,           "confidence": "low"  },
      "ndb":          { "value": null,           "confidence": "high" },
      "kit":          { "value": null,           "confidence": "high" },
      "car":          { "value": null,           "confidence": "high" },
      "dailyRate":    { "value": null,           "confidence": "low"  },
      "employeeSignature": { "value": "SJ",      "confidence": "high" }
    },
    {
      "employeeName": { "value": "Tyler Burch",  "confidence": "medium" },
      "position":     { "value": "Testing PA",   "confidence": "medium" },
      "dayType":      { "value": "Worked",       "confidence": "high"   },
      "callTime":     { "value": "07:12",        "confidence": "medium" },
      "meal1Out":     { "value": "13:00",        "confidence": "high"   },
      "meal1In":      { "value": "13:30",        "confidence": "high"   },
      "meal2Out":     { "value": null,           "confidence": "high"   },
      "meal2In":      { "value": null,           "confidence": "high"   },
      "wrapTime":     { "value": "19:30",        "confidence": "high"   },
      "regularHours": { "value": null,           "confidence": "low"    },
      "overtimeHours":{ "value": null,           "confidence": "low"    },
      "ndb":          { "value": null,           "confidence": "high"   },
      "kit":          { "value": null,           "confidence": "high"   },
      "car":          { "value": null,           "confidence": "high"   },
      "dailyRate":    { "value": null,           "confidence": "low"    },
      "employeeSignature": { "value": "TB",      "confidence": "high"   }
    },
    {
      "employeeName": { "value": "James Williams", "confidence": "medium" },
      "position":     { "value": "COVID PA",       "confidence": "medium" },
      "dayType":      { "value": "Worked",         "confidence": "high"   },
      "callTime":     { "value": "07:30",          "confidence": "high"   },
      "meal1Out":     { "value": "13:30",          "confidence": "high"   },
      "meal1In":      { "value": "14:00",          "confidence": "high"   },
      "meal2Out":     { "value": null,             "confidence": "high"   },
      "meal2In":      { "value": null,             "confidence": "high"   },
      "wrapTime":     { "value": "20:00",          "confidence": "high"   },
      "regularHours": { "value": null,             "confidence": "low"    },
      "overtimeHours":{ "value": null,             "confidence": "low"    },
      "ndb":          { "value": null,             "confidence": "high"   },
      "kit":          { "value": null,             "confidence": "high"   },
      "car":          { "value": null,             "confidence": "high"   },
      "dailyRate":    { "value": null,             "confidence": "low"    },
      "employeeSignature": { "value": "JW",        "confidence": "high"   }
    }
  ]
};

function rowsFromApi(api: ApiResponse): EmployeeRow[] {
  const { department, workZone } = api.production;
  const v = (f: ApiField) => f.value ?? '';
  return api.timecards.map((tc, i) => {
    const parts = (tc.employeeName.value ?? '').trim().split(/\s+/);
    const lastName  = parts.length > 1 ? parts[parts.length - 1] : '';
    const firstName = parts.length > 1 ? parts.slice(0, -1).join(' ') : (parts[0] ?? '');
    return {
      id: String(i + 1),
      firstName,
      lastName,
      department: v(department),
      union: '',
      dayType:    v(tc.dayType),
      workZone:   '',
      callTime:   v(tc.callTime),
      meal1Out:   v(tc.meal1Out),
      lastManIn:  v(tc.meal1In),
      wrap:       v(tc.wrapTime),
      dailyAllow: '',
      country: workZone.country.value === 'US' ? 'United States' : v(workZone.country),
      state:      v(workZone.state),
      city: '', occupation: v(tc.position), account: '', epi: '',
      rate: v(tc.dailyRate), ff1: '',
      ndb: v(tc.ndb), ndbOut: '', ndbEnd: '', ndm: '', ndmOut: '', ndmEnd: '',
      meal2Out: v(tc.meal2Out), meal2In: v(tc.meal2In),
      meal3Out: '', hours: '', county: '', dealMemo: '', onProd: '',
      hboex15: '', hboex20: '', grace1: '', grace2: '', french: '',
      ser: '', loc: '', set: '', workComp: '', ff2: '', ff3: '', ff4: '',
      ins: '', subDivision: '', cck: '', sch: '', frenchLimit: '', liveCk: '', status: '',
      _confidence: {
        firstName:  tc.employeeName.confidence,
        lastName:   tc.employeeName.confidence,
        department: department.confidence,
        country:    workZone.country.confidence,
        state:      workZone.state.confidence,
        dayType:    tc.dayType.confidence,
        callTime:   tc.callTime.confidence,
        meal1Out:   tc.meal1Out.confidence,
        lastManIn:  tc.meal1In.confidence,
        wrap:       tc.wrapTime.confidence,
        occupation: tc.position.confidence,
        rate:       tc.dailyRate.confidence,
        ndb:        tc.ndb.confidence,
        meal2Out:   tc.meal2Out.confidence,
        meal2In:    tc.meal2In.confidence,
      },
    };
  });
}

export const SAMPLE_ROWS = rowsFromApi(MOCK_API_RESPONSE);
