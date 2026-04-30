import React, { useRef, useEffect, useState, useSyncExternalStore } from 'react';
import AutocompleteInput from '../../../components/AutocompleteInput';
import { ScribeTextField } from '../components';
import { useReviewContext } from '../../../components/review-bar/ReviewContext';
import type { ColumnDef } from '@tanstack/react-table';
import type { EmployeeRow } from './DailyTimesheetPage.types';
import {
  DAY_TYPE_OPTIONS,
  WORK_ZONE_OPTIONS,
  COUNTRY_OPTIONS,
} from './DailyTimesheetPage.data';
import styles from '../DailyTimesheetPage.module.css';

interface DTSCellProps {
  rowId: string;
  fieldKey: string;
  label: string;
  value: string;
}

function DTSCell({ rowId, fieldKey, label, value }: DTSCellProps) {
  const { store, getRowConfidence, onCellChange, onCellAccept } = useReviewContext();

  const hasConfidence = getRowConfidence(rowId, fieldKey);

  const cellKey = `${rowId}::${fieldKey}`;
  const snapshotCache = useRef({
    hasReviewItems: false,
    isActive: false,
    isAccepted: false,
    isModified: false,
  });
  const {
    hasReviewItems,
    isActive,
    isAccepted: accepted,
    isModified: modified,
  } = useSyncExternalStore(
    store.subscribe,
    () => {
      const { hasReviewItems, activeRowId, activeField, acceptedKeys, showReviewBar } = store.volatile;
      const isActive = activeRowId === rowId && activeField === fieldKey;
      const inAccepted = acceptedKeys.has(cellKey);
      const next = {
        hasReviewItems,
        isActive,
        isAccepted: showReviewBar && inAccepted,
        isModified: inAccepted,
      };
      const prev = snapshotCache.current;
      if (
        prev.hasReviewItems === next.hasReviewItems &&
        prev.isActive === next.isActive &&
        prev.isAccepted === next.isAccepted &&
        prev.isModified === next.isModified
      ) return prev;
      snapshotCache.current = next;
      return next;
    },
  );

  // Local draft so typing only re-renders this cell, not the whole table.
  // Global state (rows) is updated on blur or Enter.
  const [draft, setDraft] = useState(value);
  const [locallyModified, setLocallyModified] = useState(false);

  // Sync draft when the prop changes externally (e.g. extraction fills data).
  useEffect(() => {
    setDraft(value);
    setLocallyModified(false);
  }, [value]);

  const cellRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log(`[text-focus] ${rowId}::${fieldKey} isActive=${isActive} inputRef=${inputRef.current ? 'attached' : 'null'}`);
    if (!isActive) return;
    cellRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    const t = setTimeout(() => {
      console.log(`[text-focus] setTimeout fired for ${rowId}::${fieldKey} — inputRef=${inputRef.current ? 'attached' : 'null'} activeElement=${document.activeElement?.tagName}`);
      inputRef.current?.focus();
      console.log(`[text-focus] after focus() — activeElement=${document.activeElement?.tagName} isSame=${document.activeElement === inputRef.current}`);
    }, 0);
    return () => clearTimeout(t);
  }, [isActive]);

  function commit() {
    if (locallyModified) onCellChange(rowId, fieldKey, draft);
  }

  return (
    <div ref={cellRef} className={styles.dts_cellOuter}>
      <ScribeTextField
        inputRef={inputRef}
        aria-label={label}
        value={draft}
        needsReview={hasReviewItems && hasConfidence && !isActive && !(modified || locallyModified)}
        isActive={isActive}
        isAccepted={accepted}
        className={styles.dts_cellInput}
        size='sm'
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setDraft(e.target.value);
          setLocallyModified(true);
        }}
        onBlur={(e) => {
          commit();
          if (!isActive || !(accepted || locallyModified)) return;
          const reviewBar = document.querySelector('[aria-label="AI confidence review"]');
          if (reviewBar?.contains(e.relatedTarget as Node)) return;
          onCellAccept(rowId, fieldKey);
        }}
        inputProps={{
          onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              commit();
              onCellAccept(rowId, fieldKey);
            }
          },
        }}
      />
    </div>
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
    cell: ({ row, getValue }) => (
      <DTSCell
        rowId={row.original.id}
        fieldKey={id}
        label={label}
        value={(getValue() ?? '') as string}
      />
    ),
  };
}

interface DTSSelectCellProps {
  rowId: string;
  fieldKey: string;
  label: string;
  options: { id: string; label: string }[];
  value: string;
}

function DTSSelectCell({ rowId, fieldKey, label, options, value }: DTSSelectCellProps) {
  const { store, getRowConfidence, onCellChange, onCellAccept } = useReviewContext();

  const hasConfidence = getRowConfidence(rowId, fieldKey);
  const cellKey = `${rowId}::${fieldKey}`;

  const snapshotCache = useRef({
    hasReviewItems: false,
    isActive: false,
    isAccepted: false,
    isModified: false,
  });
  const { hasReviewItems, isActive, isAccepted: accepted, isModified: modified } = useSyncExternalStore(
    store.subscribe,
    () => {
      const { hasReviewItems, activeRowId, activeField, acceptedKeys, showReviewBar } = store.volatile;
      const isActive = activeRowId === rowId && activeField === fieldKey;
      const inAccepted = acceptedKeys.has(cellKey);
      const next = {
        hasReviewItems,
        isActive,
        isAccepted: showReviewBar && inAccepted,
        isModified: inAccepted,
      };
      const prev = snapshotCache.current;
      if (
        prev.hasReviewItems === next.hasReviewItems &&
        prev.isActive === next.isActive &&
        prev.isAccepted === next.isAccepted &&
        prev.isModified === next.isModified
      ) return prev;
      snapshotCache.current = next;
      return next;
    },
  );

  const cellRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDropdownOpen = useRef(false);

  useEffect(() => {
    console.log(`[select-focus] ${rowId}::${fieldKey} isActive=${isActive} inputRef=${inputRef.current ? 'attached' : 'null'}`);
    if (!isActive) return;
    cellRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    const t = setTimeout(() => {
      console.log(`[select-focus] setTimeout fired for ${rowId}::${fieldKey} — inputRef=${inputRef.current ? 'attached' : 'null'} activeElement=${document.activeElement?.tagName}`);
      inputRef.current?.focus();
      console.log(`[select-focus] after focus() — activeElement=${document.activeElement?.tagName} isSame=${document.activeElement === inputRef.current}`);
    }, 0);
    return () => clearTimeout(t);
  }, [isActive]);

  return (
    <div ref={cellRef}>
      <AutocompleteInput
        aria-label={label}
        options={options}
        selectedKey={value || null}
        onSelectionChange={(key) => {
          onCellChange(rowId, fieldKey, String(key ?? ''));
          onCellAccept(rowId, fieldKey);
        }}
        onOpenChange={(open) => { isDropdownOpen.current = open; }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !isDropdownOpen.current) {
            onCellAccept(rowId, fieldKey);
          }
        }}
        className={styles.dts_cellSelect}
        popoverClassName={styles.dts_cellSelectPopover}
        inputRef={inputRef}
        needsReview={hasReviewItems && hasConfidence && !isActive && !modified}
        isActive={isActive}
        isAccepted={accepted}
      />
    </div>
  );
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
    cell: ({ row, getValue }) => (
      <DTSSelectCell
        rowId={row.original.id}
        fieldKey={id}
        label={header}
        options={options}
        value={(getValue() ?? '') as string}
      />
    ),
  };
}

export const DEFAULT_COLUMNS: ColumnDef<EmployeeRow, unknown>[] = [
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

export function makeDefaultColumns(): ColumnDef<EmployeeRow, unknown>[] {
  return DEFAULT_COLUMNS;
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
