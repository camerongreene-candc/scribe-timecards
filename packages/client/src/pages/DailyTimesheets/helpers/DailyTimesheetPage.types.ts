export interface EmployeeRow {
  id: string;
  /** true = AI was confident, false = needs human review */
  _confidence?: Partial<Record<string, boolean>>;
  /** errorMessage string = validation failed for this field */
  _discrepancy?: Partial<Record<string, string>>;
  // default visible
  firstName: string;
  lastName: string;
  department: string;
  union: string;
  dayType: string;
  workZone: string;
  callTime: string;
  meal1Out: string;
  meal1In: string;
  lastManIn: string;
  wrap: string;
  dailyAllow: string;
  country: string;
  state: string;
  city: string;
  occupation: string;
  account: string;
  epi: string;
  rate: string;
  ff1: string;
  // additional fields
  ndb: boolean;
  ndbOut: string;
  ndbEnd: string;
  ndm: string;
  ndmOut: string;
  ndmEnd: string;
  meal2Out: string;
  meal2In: string;
  meal3Out: string;
  hours: string;
  county: string;
  dealMemo: string;
  onProd: string;
  hboex15: string;
  hboex20: string;
  grace1: string;
  grace2: string;
  french: string;
  ser: string;
  loc: string;
  set: string;
  workComp: string;
  ff2: string;
  ff3: string;
  ff4: string;
  ins: string;
  subDivision: string;
  cck: string;
  sch: string;
  frenchLimit: string;
  liveCk: string;
  status: string;
}
