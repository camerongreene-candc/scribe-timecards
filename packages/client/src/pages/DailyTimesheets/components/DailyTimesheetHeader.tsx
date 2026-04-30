import { Button, Icon, IconButton, TextField } from '@castandcrew/platform-ui';
import type { ProcessResponse } from '@scribe-timecards/shared';
import { ExtractModal } from '../../../components/extract-modal/ExtractModal';
import AdditionalFieldsSelect from './AdditionalFieldsSelect';
import styles from '../DailyTimesheetPage.module.css';

interface DailyTimesheetHeaderProps {
  extraCols: Set<string>;
  onExtraColsChange: (cols: Set<string>) => void;
  onExtractComplete: (data: ProcessResponse) => void;
}

export default function DailyTimesheetHeader({ extraCols, onExtraColsChange, onExtractComplete }: DailyTimesheetHeaderProps) {
  return (
    <header className={styles.dts_header}>
      <div className={styles.dts_header__row}>

        <div className={styles.dts_header__dateSection}>
          <span className={styles.dts_header__dateLabel}>Date:</span>
          <div className={styles.dts_header__dateControls}>
            <IconButton buttonVariant='ghost' iconName='chevron-left' aria-label='Previous day' />
            <div className={styles.dts_header__dateInputWrapper}>
              <TextField
                aria-label='Selected date'
                value='Tuesday, 04/28'
                className={styles.dts_header__dateInput}
                size='sm'
                endAdornment={<Icon iconName='calendar' />}
              />
            </div>
            <IconButton buttonVariant='ghost' iconName='chevron-right' aria-label='Next day' />
          </div>
        </div>

        <div className={styles.dts_header__actions}>
          <Button buttonVariant='solid'>Save</Button>
          <Button buttonVariant='outlined'>List Timecards</Button>
          <Button buttonVariant='ghost'>Clear All Changes</Button>
          <ExtractModal onComplete={onExtractComplete} />
        </div>

        <div className={styles.dts_header__secondary}>
          <ExtractModal onComplete={onExtractComplete} />
          <AdditionalFieldsSelect selectedCols={extraCols} onChange={onExtraColsChange} />
        </div>

      </div>
    </header>
  );
}
