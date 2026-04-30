import { Icon, Button, GridTable, ExpandableSection } from '@castandcrew/platform-ui';
import { COMMENT_ROWS, ALLOWANCE_ROWS, BREAKDOWN_ROWS, HISTORY_ROWS } from '../helpers/WeeklyTimecardPage.data';
import { COMMENT_COLS, ALLOWANCE_COLS, BREAKDOWN_COLS, HISTORY_COLS } from '../helpers/WeeklyTimecardPage.columns';
import styles from '../WeeklyTimecardPage.module.css';

export function CommentsSection() {
  return (
    <ExpandableSection
      defaultExpanded
      className={styles.wtc_section}
      headerClassName={styles.wtc_section__header}
      sectionTitle={
        <div className={styles.wtc_section__expandableTitle}>
          <Icon iconName='comment' size='sm' />
          <span className={styles.wtc_section__title}>Comments</span>
          <span className={styles.wtc_section__badge}>{COMMENT_ROWS.length}</span>
          <Button buttonVariant='ghost' size='xs'>Add Comment</Button>
        </div>
      }
    >
      <GridTable data={COMMENT_ROWS} columns={COMMENT_COLS} enablePagination={false} enableSorting={false} />
    </ExpandableSection>
  );
}

export function AllowancesSection() {
  return (
    <ExpandableSection
      defaultExpanded
      className={styles.wtc_section}
      headerClassName={styles.wtc_section__header}
      sectionTitle={
        <div className={styles.wtc_section__expandableTitle}>
          <Icon iconName='dollar-sign' size='sm' />
          <span className={styles.wtc_section__title}>Allowances</span>
        </div>
      }
    >
      <GridTable data={ALLOWANCE_ROWS} columns={ALLOWANCE_COLS} enablePagination={false} enableSorting={false} />
    </ExpandableSection>
  );
}

export function BreakdownSection() {
  return (
    <section className={styles.wtc_section}>
      <div className={styles.wtc_section__header}>
        <Icon iconName='chart-bar' size='sm' />
        <span className={styles.wtc_section__title}>Breakdown</span>
      </div>
      <GridTable data={BREAKDOWN_ROWS} columns={BREAKDOWN_COLS} enablePagination={false} enableSorting={false} />
    </section>
  );
}

export function HistorySection() {
  return (
    <section className={styles.wtc_section}>
      <div className={styles.wtc_section__header}>
        <Icon iconName='history' size='sm' />
        <span className={styles.wtc_section__title}>History</span>
      </div>
      <GridTable data={HISTORY_ROWS} columns={HISTORY_COLS} enablePagination={false} enableSorting={false} />
    </section>
  );
}
