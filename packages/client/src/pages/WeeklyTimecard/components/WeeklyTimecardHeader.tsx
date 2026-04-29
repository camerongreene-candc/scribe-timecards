import { Button, Icon, SquareIconToggleButton, AutocompleteInput, FieldLabel } from '@castandcrew/platform-ui';
import { EMPLOYEE, BATCH, WEEK_OPTIONS, WEEK_DATES } from '../helpers/WeeklyTimecardPage.data';
import styles from '../WeeklyTimecardPage.module.css';

export default function WeeklyTimecardHeader() {
  return (
    <header className={styles.wtc_header}>
      <Button buttonVariant='ghost' startAdornment='chevron-left'>Back to List</Button>

      <div className={styles.wtc_header__nameRow}>
        <h2 className={`spotlight_heading-sm ${styles.wtc_header__empName}`}>
          {EMPLOYEE.name}
        </h2>
        <div className={styles.wtc_header__weekEnding}>
          <span className={styles.wtc_header__weekEndingLabel}>
            Week Ending: {EMPLOYEE.weekEnding}
          </span>
          <Icon iconName='chevron-down' size='sm' />
        </div>
        <span className={styles.wtc_header__batchInfo}>
          Batch: {BATCH.code} – {BATCH.name}
        </span>
      </div>

      <div className={styles.wtc_header__actionsRow}>
        <div className={styles.wtc_header__btnGroup}>
          <Button buttonVariant='solid'    size='sm'>Submit for Approval</Button>
          <Button buttonVariant='outlined' size='sm'>Disable Auto-Coding</Button>
          <Button buttonVariant='solid'    size='sm'>Save / Calculate</Button>
          <Button buttonVariant='outlined' size='sm' isDestructive startAdornment='trash'>Delete</Button>
          <Button buttonVariant='ghost'    size='sm' startAdornment='arrow-rotate-left'>Revert</Button>
          <SquareIconToggleButton iconName='print' aria-label='Print' />
        </div>

        <div className={styles.wtc_header__weekSelectors}>
          <div className={styles.wtc_header__weekField}>
            <FieldLabel label="Producer's Week" />
            <AutocompleteInput options={WEEK_OPTIONS} defaultSelectedKey={WEEK_DATES[0]} />
          </div>
          <div className={styles.wtc_header__weekField}>
            <FieldLabel label="Employee's Week" />
            <AutocompleteInput options={WEEK_OPTIONS} defaultSelectedKey={WEEK_DATES[0]} />
          </div>
        </div>
      </div>

      <div className={styles.wtc_header__subRow}>
        <Button buttonVariant='outlined' size='xs' startAdornment='file-lines'>
          View Deal Memos
        </Button>
      </div>
    </header>
  );
}
