import React from 'react';
import { Tooltip, TextField } from '@castandcrew/platform-ui';
import styles from './ScribeTextField.module.css';

type BaseProps = Omit<React.ComponentProps<typeof TextField>, 'isInvalid' | 'endAdornment'>;

interface ScribeTextFieldProps extends BaseProps {
  needsReview?: boolean;
  isDiscrepancy?: boolean;
  endAdornment?: React.ReactNode;
}

export default function ScribeTextField({
  needsReview,
  isDiscrepancy,
  endAdornment,
  ...props
}: ScribeTextFieldProps) {
  return (
    <TextField
      {...props}
      className={[props.className, needsReview ? styles.mediumConfidence : undefined].filter(Boolean).join(' ') || undefined}
      endAdornment={
        isDiscrepancy ? (
          <Tooltip
            triggerClassName={styles.discrepancyTooltip}
            title='Data discrepancy detected'
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
