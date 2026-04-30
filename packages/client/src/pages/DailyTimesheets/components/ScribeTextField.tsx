import React from 'react';
import { Tooltip, TextField } from '@castandcrew/platform-ui';
import styles from './ScribeTextField.module.css';

type BaseProps = Omit<
  React.ComponentProps<typeof TextField>,
  'isInvalid' | 'endAdornment'
>;

interface ScribeTextFieldProps extends BaseProps {
  needsReview?: boolean;
  isActive?: boolean;
  isAccepted?: boolean;
  isDiscrepancy?: boolean;
  discrepancyMessage?: string;
  endAdornment?: React.ReactNode;
}

export default function ScribeTextField({
  needsReview,
  isActive,
  isAccepted,
  isDiscrepancy,
  discrepancyMessage = 'Data discrepancy detected',
  endAdornment,
  ...props
}: ScribeTextFieldProps) {
  const stateClass = isActive
    ? styles.activeCell
    : isAccepted
      ? styles.acceptedCell
      : needsReview
        ? styles.mediumConfidence
        : isDiscrepancy
          ? styles.discrepancyWarning
          : undefined;

  return (
    <TextField
      {...props}
      className={
        [props.className, stateClass, isDiscrepancy ? styles.discrepancyWarning : undefined].filter(Boolean).join(' ') || undefined
      }
      endAdornment={
        isDiscrepancy ? (
          <Tooltip
            triggerClassName={styles.discrepancyTooltip}
            title={discrepancyMessage}
            iconName='circle-exclamation'
            iconFamilyVariant='regular'
            iconClassName={styles.discrepancyIcon}
          />
        ) : (
          endAdornment
        )
      }
    />
  );
}
