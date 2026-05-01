import { Button } from '@castandcrew/platform-ui';
import styles from './ReviewBar.module.css';

interface ReviewBarProps {
  totalCount: number;
  remainingCount: number;
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onAccept: () => void;
  onAcceptAll: () => void;
}

export function ReviewBar({
  totalCount,
  remainingCount,
  currentIndex,
  onPrev,
  onNext,
  onAccept,
  onAcceptAll,
}: ReviewBarProps) {
  const hasItems = remainingCount > 0;

  return (
    <div className={styles.reviewBar} role="region" aria-label="AI confidence review">
      <div className={`${styles.reviewBar__label}${!hasItems ? ` ${styles.reviewBar__label_idle}` : ''}`}>
        {hasItems ? `${remainingCount} ${remainingCount === 1 ? 'field' : 'fields'} remaining` : 'No items to review'}
      </div>

      <div className={styles.reviewBar__divider} />

      <div className={styles.reviewBar__nav}>
        <Button
          buttonVariant="ghost"
          size="sm"
          startAdornment="arrow-left"
          onPress={onPrev}
          isDisabled={!hasItems || currentIndex <= 1}
        >
          Prev
        </Button>

        <div className={styles.reviewBar__counter}>
          {hasItems ? `${currentIndex} / ${totalCount}` : '—'}
        </div>

        <Button
          buttonVariant="ghost"
          size="sm"
          endAdornment="arrow-right"
          onPress={onNext}
          isDisabled={!hasItems || currentIndex >= totalCount}
        >
          Next
        </Button>
      </div>

      <div className={styles.reviewBar__actions}>
        <Button
          buttonVariant="ghost"
          size="sm"
          startAdornment="check"
          onPress={onAccept}
          isDisabled={!hasItems}
        >
          Accept
        </Button>

        <Button
          buttonVariant="outlined"
          size="sm"
          startAdornment="check-double"
          onPress={onAcceptAll}
          isDisabled={!hasItems}
        >
          Accept All
        </Button>
      </div>
    </div>
  );
}
