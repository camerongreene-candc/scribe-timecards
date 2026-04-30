export interface DrawerTimecard {
  id: number;
  name: string;
  subtitle?: string;
  status: string;
  active: boolean;
}

export interface DayRow {
  _isMaster?: boolean;
  name: string;
  date: string;
  workLoc: string;
  dayType: string;
  callTime: string;
  wrap: string;
  hours: string;
  account: string;
  epi: string;
  ser: string;
  loc: string;
  set: string;
  ff1: string;
  ff2: string;
}

export interface CommentRow {
  date: string;
  user: string;
  text: string;
}

export interface AllowanceRow {
  type: string;
  amount: string;
  account: string;
  epi: string;
  ser: string;
}

export interface BreakdownRow {
  label: string;
  hours: string;
  rate: string;
  amount: string;
}

export interface HistoryRow {
  date: string;
  user: string;
  action: string;
}
