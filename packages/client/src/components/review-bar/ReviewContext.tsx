import { createContext, useContext } from 'react';

export type ReviewVolatile = {
  hasReviewItems: boolean;
  activeRowId: string | null;
  activeField: string | null;
  acceptedKeys: ReadonlySet<string>;
  showReviewBar: boolean;
};

export class ReviewStore {
  volatile: ReviewVolatile = {
    hasReviewItems: false,
    activeRowId: null,
    activeField: null,
    acceptedKeys: new Set(),
    showReviewBar: false,
  };
  private listeners = new Set<() => void>();

  set(next: ReviewVolatile) {
    this.volatile = next;
    this.listeners.forEach((fn) => fn());
  }

  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
}

export interface ReviewContextValue {
  store: ReviewStore;
  getRowConfidence: (rowId: string, field: string) => boolean;
  onCellChange: (rowId: string, field: string, value: string) => void;
  onCellAccept: (rowId: string, field: string) => void;
  onCellReject: (rowId: string, field: string) => void;
}

const defaultStore = new ReviewStore();

export const ReviewContext = createContext<ReviewContextValue>({
  store: defaultStore,
  getRowConfidence: () => false,
  onCellChange: () => {},
  onCellAccept: () => {},
  onCellReject: () => {},
});

export function useReviewContext() {
  return useContext(ReviewContext);
}
