import React, { useState } from 'react';
import { AutocompleteInput } from '@castandcrew/platform-ui';
import { ScribeTextField } from '../components';
import type { ColumnDef } from '@tanstack/react-table';
import type { EmployeeRow } from './DailyTimesheetPage.types';
import {
  DAY_TYPE_OPTIONS,
  WORK_ZONE_OPTIONS,
  COUNTRY_OPTIONS,
} from './DailyTimesheetPage.data';
import styles from '../DailyTimesheetPage.module.css';

interface DTSCellProps {
  initialValue: string;
  hasConfidence: boolean;
  label: string;
}

function DTSCell({ initialValue, hasConfidence, label }: DTSCellProps) {
  const [value, setValue] = useState(initialValue);
  const [reviewed, setReviewed] = useState(false);
  return (
    <ScribeTextField
      aria-label={label}
      value={value}
      needsReview={hasConfidence && !reviewed}
      className={styles.dts_cellInput}
      size='sm'
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        if (!reviewed) setReviewed(true);
      }}
    />
  );
}

export function makeTF(
  id: keyof EmployeeRow & string,
  header: string | (() => React.ReactNode),
): ColumnDef<EmployeeRow, unknown> {
  const label = typeof header === 'string' ? header : id;
  return {
    id,
    accessorKey: id,
    header,
    cell: ({ getValue, row }) => (
      <DTSCell
        initialValue={getValue() as string}
        hasConfidence={
          row.original._confidence?.[id] != null &&
          row.original._confidence?.[id] !== 'high'
        }
        label={label}
      />
    ),
  };
}

export function makeSelect(
  id: keyof EmployeeRow & string,
  header: string,
  options: { id: string; label: string }[],
): ColumnDef<EmployeeRow, unknown> {
  return {
    id,
    accessorKey: id,
    header,
    cell: ({ getValue }) => (
      <AutocompleteInput
        aria-label={header}
        options={options}
        defaultSelectedKey={getValue() as string}
        className={styles.dts_cellSelect}
      />
    ),
  };
}

export function makeDefaultColumns(): ColumnDef<EmployeeRow, unknown>[] {
  return [
    makeTF('firstName',  'First Name'),
    makeTF('lastName',   'Last Name'),
    makeTF('department', 'Department'),
    makeTF('union',      'Union'),
    makeSelect('dayType',  'Day Type',  DAY_TYPE_OPTIONS),
    makeSelect('workZone', 'Work Zone', WORK_ZONE_OPTIONS),
    makeTF('callTime',   () => (<>Call<br />Time</>)),
    makeTF('meal1Out',   'Meal 1 Out'),
    makeTF('lastManIn',  'Last Man In'),
    makeTF('wrap',       'Wrap'),
    makeTF('dailyAllow', 'Daily Allow'),
    makeSelect('country', 'Country', COUNTRY_OPTIONS),
    makeTF('state',      'State'),
    makeTF('city',       'City'),
    makeTF('occupation', 'Occupation'),
    makeTF('account',    'Account'),
    makeTF('epi',        'Epi'),
    makeTF('rate',       'Rate'),
    makeTF('ff1',        'FF1'),
  ];
}

export const ADDITIONAL_FIELD_DEFS: {
  id: keyof EmployeeRow & string;
  label: string;
}[] = [
  { id: 'ndb', label: 'NDB' },
  { id: 'ndbOut', label: 'NDB Out' },
  { id: 'ndbEnd', label: 'NDB End' },
  { id: 'ndm', label: 'NDM' },
  { id: 'ndmOut', label: 'NDM Out' },
  { id: 'ndmEnd', label: 'NDM End' },
  { id: 'meal2Out', label: 'Meal 2 Out' },
  { id: 'meal2In', label: 'Meal 2 In' },
  { id: 'meal3Out', label: 'Meal 3 Out' },
  { id: 'hours', label: 'Hours' },
  { id: 'county', label: 'County' },
  { id: 'dealMemo', label: 'Deal Memo' },
  { id: 'onProd', label: 'On Prod' },
  { id: 'hboex15', label: 'HBOEX15' },
  { id: 'hboex20', label: 'HBOEX20' },
  { id: 'grace1', label: 'Grace 1' },
  { id: 'grace2', label: 'Grace 2' },
  { id: 'french', label: 'French' },
  { id: 'ser', label: 'Ser' },
  { id: 'loc', label: 'Loc' },
  { id: 'set', label: 'Set' },
  { id: 'workComp', label: 'Work Comp' },
  { id: 'ff2', label: 'FF2' },
  { id: 'ff3', label: 'FF3' },
  { id: 'ff4', label: 'FF4' },
  { id: 'ins', label: 'Ins' },
  { id: 'subDivision', label: 'Sub Division' },
  { id: 'cck', label: 'CCk' },
  { id: 'sch', label: 'Sch' },
  { id: 'frenchLimit', label: 'French Limit' },
  { id: 'liveCk', label: 'Live Ck' },
  { id: 'status', label: 'Status' },
];
