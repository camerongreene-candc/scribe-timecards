import { useNavigate } from 'react-router-dom';
import { Tag } from '@castandcrew/platform-ui';
import styles from './TimecardsListPage.module.css';

interface TimecardRow {
  id: number;
  employee: string;
  weekEnding: string;
  occupation: string;
  status: string;
}

type TagColorScheme = 'info' | 'critical' | 'neutral' | 'positive' | 'attention';

const STATUS_LABEL: Record<string, string> = {
  draft:              'Draft',
  pending_pa_review:  'PA Review',
  pending_upm_review: 'UPM Review',
  sent_to_cnc:        'Sent to C&C',
};

const STATUS_COLOR: Record<string, TagColorScheme> = {
  draft:              'neutral',
  pending_pa_review:  'attention',
  pending_upm_review: 'info',
  sent_to_cnc:        'positive',
};

const TIMECARDS: TimecardRow[] = [
  { id: 1, employee: 'SACZEK, Joanna', weekEnding: '2022-04-02', occupation: 'CCO', status: 'pending_pa_review' },
];

export default function TimecardsListPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.tc_page}>
      <table className={styles.tc_table}>
        <thead>
          <tr>
            <th className={styles.tc_th}>Employee</th>
            <th className={styles.tc_th}>Week Ending</th>
            <th className={styles.tc_th}>Occupation</th>
            <th className={styles.tc_th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {TIMECARDS.map((tc) => (
            <tr
              key={tc.id}
              className={styles.tc_tr}
              onClick={() => navigate(`/timecards/${tc.id}`)}
            >
              <td className={styles.tc_td}>{tc.employee}</td>
              <td className={styles.tc_td}>{tc.weekEnding}</td>
              <td className={styles.tc_td}>{tc.occupation}</td>
              <td className={styles.tc_td}>
                <Tag
                  tagText={STATUS_LABEL[tc.status] ?? tc.status}
                  colorScheme={STATUS_COLOR[tc.status] ?? 'neutral'}
                  size='sm'
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
