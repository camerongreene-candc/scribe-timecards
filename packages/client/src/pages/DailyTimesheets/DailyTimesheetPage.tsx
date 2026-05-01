import { useRef, useEffect, useMemo, useCallback, useLayoutEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { GridTable, useSnackbar } from '@castandcrew/platform-ui';
import type { ProcessApiResponse, RosterResult } from '@scribe-timecards/shared';
import type { ColumnDef } from '@tanstack/react-table';
import type { EmployeeRow } from './helpers/DailyTimesheetPage.types';
import { applyExtractToRows, rosterToRow, validateRow } from './helpers/DailyTimesheetPage.data';
import { makeDefaultColumns, ADDITIONAL_FIELD_DEFS, makeTF, makeStatic, makeCheckbox } from './helpers/DailyTimesheetPage.columns';
import DailyTimesheetHeader from './components/DailyTimesheetHeader';
import { ReviewBar } from '../../components/review-bar/ReviewBar';
import { ReviewContext, ReviewStore } from '../../components/review-bar/ReviewContext';
import styles from './DailyTimesheetPage.module.css';

interface ReviewItem {
  rowId: string;
  field: string;
}

const reviewKey = (rowId: string, field: string) => `${rowId}::${field}`;

interface DailyTimesheetPageProps {
  projectId: string;
  rows: EmployeeRow[];
  setRows: Dispatch<SetStateAction<EmployeeRow[]>>;
  rowsProjectId: string | null;
  setRowsProjectId: Dispatch<SetStateAction<string | null>>;
}

export default function DailyTimesheetPage({ projectId, rows, setRows, rowsProjectId, setRowsProjectId }: DailyTimesheetPageProps) {
  const showSnackbar = useSnackbar();
  const [extraCols, setExtraCols] = useState<Set<string>>(new Set());
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [acceptedKeys, setAcceptedKeys] = useState<Set<string>>(new Set());
  const [showReviewBar, setShowReviewBar] = useState(false);

  // Always-fresh snapshots for use inside stable callbacks.
  const rowsRef = useRef<EmployeeRow[]>(rows);
  rowsRef.current = rows;
  const reviewItemsRef = useRef<ReviewItem[]>(reviewItems);
  reviewItemsRef.current = reviewItems;

  const lastNavTrigger = useRef<string>('init');

  useEffect(() => {
    if (rowsProjectId === projectId) return;
    setRows([]);
    setExtraCols(new Set());
    setReviewItems([]);
    setReviewIndex(0);
    setAcceptedKeys(new Set());
    setShowReviewBar(false);
    fetch(`/api/extract?project=${projectId}`)
      .then((res) => res.json())
      .then(({ data }: { data: RosterResult }) => {
        setRows(data.employees.map(rosterToRow));
        setRowsProjectId(projectId);
      });
  }, [projectId, rowsProjectId]);

  const handleExtractComplete = useCallback((data: ProcessApiResponse) => {
    const mergedRows = applyExtractToRows(rowsRef.current, data);

    setRows(mergedRows);

    const additionalIds = new Set<string>(ADDITIONAL_FIELD_DEFS.map((f) => f.id));
    // DTSDay field names that differ from EmployeeRow additional column IDs
    const DAY_FIELD_TO_COL: Record<string, string> = { series: 'ser', location: 'loc' };
    const populated = new Set<string>();
    for (const { day } of data.results) {
      for (const [field, value] of Object.entries(day)) {
        if (value == null || value === '') continue;
        const colId = DAY_FIELD_TO_COL[field] ?? field;
        if (additionalIds.has(colId)) populated.add(colId);
      }
    }
    if (populated.size > 0) {
      setExtraCols((prev) => new Set([...prev, ...populated]));
    }

    const items: ReviewItem[] = [];
    for (const row of mergedRows) {
      if (row._confidence) {
        for (const [field, confident] of Object.entries(row._confidence)) {
          if (confident === false) {
            items.push({ rowId: row.id, field });
          }
        }
      }
    }
    if (items.length > 0) {
      lastNavTrigger.current = 'init';
      setReviewItems(items);
      setReviewIndex(0);
      setAcceptedKeys(new Set());
      setShowReviewBar(true);
    }
  }, []);

  const handleCellChange = useCallback(
    (rowId: string, field: string, value: string | boolean) => {
      setRows((prev) =>
        prev.map((row) => {
          if (row.id !== rowId) return row;
          const updated = { ...row, [field]: value };
          const newErrors = validateRow(updated);
          const merged = { ...row._discrepancy };
          // Apply any newly detected errors across all fields
          for (const [f, msg] of Object.entries(newErrors)) {
            merged[f] = msg;
          }
          // Only clear the edited field's discrepancy if validation no longer flags it
          if (!newErrors[field]) delete merged[field];
          return { ...updated, _discrepancy: merged };
        }),
      );
      setAcceptedKeys((prev) => new Set(prev).add(reviewKey(rowId, field)));
    },
    [],
  );

  const handleReviewPrev = useCallback(() => {
    lastNavTrigger.current = 'prev';
    setReviewIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleReviewNext = useCallback(() => {
    lastNavTrigger.current = 'next';
    setReviewIndex((i) => Math.min(reviewItems.length - 1, i + 1));
  }, [reviewItems.length]);

  const handleAccept = useCallback(() => {
    const item = reviewItems[reviewIndex];
    if (!item) return;
    lastNavTrigger.current = 'accept';
    setAcceptedKeys((prev) =>
      new Set(prev).add(reviewKey(item.rowId, item.field)),
    );
    setReviewIndex((i) => Math.min(reviewItems.length - 1, i + 1));
  }, [reviewItems, reviewIndex]);

  const handleAcceptAll = useCallback(() => {
    setAcceptedKeys(
      new Set(reviewItems.map((it) => reviewKey(it.rowId, it.field))),
    );
  }, [reviewItems]);

  const handleClose = useCallback(() => {
    setShowReviewBar(false);
  }, []);

  const handleSave = useCallback(() => {
    showSnackbar(
      { alertTitleText: 'All changes saved!', alertMessage: 'Your timecard data has been saved.' },
      { tone: 'success', isDismissible: true, autoHideDuration: 3000 },
    );
  }, [showSnackbar]);

  const handleCellAccept = useCallback(
    (rowId: string, field: string) => {
      lastNavTrigger.current = 'cell-accept';
      setAcceptedKeys((prev) => new Set(prev).add(reviewKey(rowId, field)));
      setReviewIndex((prev) => {
        const currentItem = reviewItemsRef.current[prev];
        if (currentItem?.rowId === rowId && currentItem?.field === field) {
          return Math.min(reviewItemsRef.current.length - 1, prev + 1);
        }
        return prev;
      });
    },
    [],
  );

  const handleCellReject = useCallback(
    (rowId: string, field: string) => {
      lastNavTrigger.current = 'cell-reject';
      setReviewIndex((prev) => {
        const idx = reviewItemsRef.current.findIndex(
          (it) => it.rowId === rowId && it.field === field,
        );
        if (idx === prev) return Math.min(reviewItemsRef.current.length - 1, prev + 1);
        return prev;
      });
    },
    [],
  );

  const remainingCount = useMemo(
    () =>
      reviewItems.filter(
        (it) => !acceptedKeys.has(reviewKey(it.rowId, it.field)),
      ).length,
    [reviewItems, acceptedKeys],
  );

  useEffect(() => {
    if (!showReviewBar) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? '').toLowerCase();
      const isEditable =
        tag === 'input' || tag === 'textarea' || tag === 'select' ||
        (document.activeElement as HTMLElement)?.isContentEditable;
      if (isEditable) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); handleReviewPrev(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); handleReviewNext(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showReviewBar, handleReviewPrev, handleReviewNext]);

  useEffect(() => {
    if (!showReviewBar) return;
    const item = reviewItems[reviewIndex];
    if (!item) return;
    const row = rowsRef.current.find((r) => r.id === item.rowId);
    const value = row ? ((row as unknown) as Record<string, unknown>)[item.field] : undefined;
    console.log(
      `[review] ${lastNavTrigger.current} → ${reviewIndex + 1}/${reviewItems.length}`,
      { rowId: item.rowId, field: item.field, value: value ?? '' },
    );
  }, [reviewIndex, showReviewBar]);

  useEffect(() => {
    if (showReviewBar && reviewItems.length > 0 && remainingCount === 0) {
      setShowReviewBar(false);
      showSnackbar(
        {
          alertTitleText: 'All fields reviewed!',
          alertMessage: 'Be sure to save your changes.',
        },
        {
          tone: 'success',
          isDismissible: true,
          autoHideDuration: 3000,
        },
      );
    }
  }, [remainingCount, reviewItems, showReviewBar]);

  // O(1) row lookup by id — rebuilt only when rows change.
  const rowsById = useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows]);

  const getRowConfidence = useCallback(
    (rowId: string, field: string): boolean => {
      const row = rowsById.get(rowId);
      return row?._confidence?.[field] === false;
    },
    [rowsById],
  );

  const getRowDiscrepancy = useCallback(
    (rowId: string, field: string): string | undefined => {
      const row = rowsById.get(rowId);
      return row?._discrepancy?.[field];
    },
    [rowsById],
  );

  const reviewStore = useMemo(() => new ReviewStore(), []);
  const activeRowId = showReviewBar ? (reviewItems[reviewIndex]?.rowId ?? null) : null;
  const activeField = showReviewBar ? (reviewItems[reviewIndex]?.field ?? null) : null;

  useLayoutEffect(() => {
    reviewStore.set({
      hasReviewItems: reviewItems.length > 0,
      activeRowId,
      activeField,
      acceptedKeys,
      showReviewBar,
    });
  }, [reviewItems.length, activeRowId, activeField, acceptedKeys, showReviewBar, reviewStore]);

  const reviewContextValue = useMemo(
    () => ({
      store: reviewStore,
      getRowConfidence,
      getRowDiscrepancy,
      onCellChange: handleCellChange,
      onCellAccept: handleCellAccept,
      onCellReject: handleCellReject,
    }),
    [reviewStore, getRowConfidence, getRowDiscrepancy, handleCellChange, handleCellAccept, handleCellReject],
  );

  const columns = useMemo<ColumnDef<EmployeeRow, unknown>[]>(
    () => [
      ...makeDefaultColumns(),
      ...ADDITIONAL_FIELD_DEFS.filter((f) => extraCols.has(f.id)).map((f) =>
        f.readonly ? makeStatic(f.id, f.label) : f.type === 'checkbox' ? makeCheckbox(f.id, f.label) : makeTF(f.id, f.label),
      ),
    ],
    [extraCols],
  );

  return (
    <ReviewContext.Provider value={reviewContextValue}>
      <div className={styles.dts_page}>
        <div className={styles.dts_content}>
          <DailyTimesheetHeader
            projectId={projectId}
            extraCols={extraCols}
            onExtraColsChange={setExtraCols}
            onExtractComplete={handleExtractComplete}
            onSave={handleSave}
          />

          <div className={styles.dts_tableWrapper}>
            <GridTable<EmployeeRow>
              data={rows}
              columns={columns}
              enableSorting
              enablePagination={false}
              stickyHeader
              cellSize='sm'
              isStriped
              showCellBorders={false}
              className={styles.dts_table}
              containerClassName={styles.dts_tableScroll}
            />
          </div>
        </div>
      </div>

      {showReviewBar && (
        <ReviewBar
          totalCount={reviewItems.length}
          remainingCount={remainingCount}
          currentIndex={reviewIndex + 1}
          onPrev={handleReviewPrev}
          onNext={handleReviewNext}
          onAccept={handleAccept}
          onAcceptAll={handleAcceptAll}
          onClose={handleClose}
        />
      )}
    </ReviewContext.Provider>
  );
}
