import { Button, Icon, IconButton, TextField } from '@castandcrew/platform-ui';
import type { ProcessApiResponse } from '@scribe-timecards/shared';
import { ExtractModal } from '../../../components/extract-modal/ExtractModal';
import AdditionalFieldsSelect from './AdditionalFieldsSelect';
import styles from '../DailyTimesheetPage.module.css';

interface DailyTimesheetHeaderProps {
  projectId: string;
  extraCols: Set<string>;
  onExtraColsChange: (cols: Set<string>) => void;
  onExtractComplete: (data: ProcessApiResponse) => void;
  onSave: () => void;
}

export default function DailyTimesheetHeader({
  projectId,
  extraCols,
  onExtraColsChange,
  onExtractComplete,
  onSave,
}: DailyTimesheetHeaderProps) {
  return (
    <header className={styles.dts_header}>
      <div className={styles.dts_header__row}>
        <div className={styles.dts_header__dateSection}>
          <span className={styles.dts_header__dateLabel}>Date:</span>
          <div className={styles.dts_header__dateControls}>
            <IconButton
              buttonVariant='ghost'
              iconName='chevron-left'
              aria-label='Previous day'
            />
            <div className={styles.dts_header__dateInputWrapper}>
              <TextField
                aria-label='Selected date'
                value='Tuesday, 04/28'
                className={styles.dts_header__dateInput}
                size='sm'
                endAdornment={<Icon iconName='calendar' />}
              />
            </div>
            <IconButton
              buttonVariant='ghost'
              iconName='chevron-right'
              aria-label='Next day'
            />
          </div>
        </div>

        <div className={styles.dts_header__actions}>
          <Button buttonVariant='solid' onPress={onSave}>Save</Button>
          <ExtractModal projectId={projectId} onComplete={onExtractComplete} />
          <Button buttonVariant='ghost'>Clear All Changes</Button>
        </div>

        <div className={styles.dts_header__secondary}>
          <AdditionalFieldsSelect
            selectedCols={extraCols}
            onChange={onExtraColsChange}
          />
        </div>
      </div>
    </header>
  );
}
