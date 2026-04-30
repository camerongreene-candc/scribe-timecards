import { Button, IconButton } from '@castandcrew/platform-ui';
import styles from './ReviewBar.module.css';

interface ReviewBarProps {
  totalCount: number;
  remainingCount: number;
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onAccept: () => void;
  onAcceptAll: () => void;
  onClose: () => void;
}

export function ReviewBar({
  totalCount,
  remainingCount,
  currentIndex,
  onPrev,
  onNext,
  onAccept,
  onAcceptAll,
  onClose,
}: ReviewBarProps) {
  return (
    <div className={styles.reviewBar} role="region" aria-label="AI confidence review">
      <div className={styles.reviewBar__label}>
        {remainingCount} of {totalCount} {totalCount === 1 ? 'field needs' : 'fields need'} review
      </div>

      <div className={styles.reviewBar__divider} />

      <div className={styles.reviewBar__nav}>
        <Button
          buttonVariant="ghost"
          size="sm"
          startAdornment="arrow-left"
          onPress={onPrev}
          isDisabled={currentIndex <= 1}
        >
          Prev
        </Button>

        <div className={styles.reviewBar__counter}>
          {currentIndex} / {totalCount}
        </div>

        <Button
          buttonVariant="ghost"
          size="sm"
          endAdornment="arrow-right"
          onPress={onNext}
          isDisabled={currentIndex >= totalCount}
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
        >
          Accept
        </Button>

        <Button
          buttonVariant="outlined"
          size="sm"
          startAdornment="copy"
          onPress={onAcceptAll}
        >
          Accept All
        </Button>
      </div>

      <div className={styles.reviewBar__close}>
        <IconButton
          buttonVariant="ghost"
          size="sm"
          iconName="xmark"
          aria-label="Dismiss review bar"
          onPress={onClose}
        />
      </div>
    </div>
  );
}
