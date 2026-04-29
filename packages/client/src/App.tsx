import { useState } from 'react';
import { ProductNavigation } from '@castandcrew/platform-ui';
import DailyTimesheetPage from './DailyTimesheetPage';
import styles from './App.module.css';

const NAV_LINKS = [
  { id: 'daily-timesheets', label: 'Daily Timesheets' },
  { id: 'timesheet', label: 'Timesheet' },
];

export default function App() {
  const [selectedKey, setSelectedKey] = useState('daily-timesheets');

  return (
    <div className={styles.app_root}>
      <ProductNavigation
        links={NAV_LINKS}
        selectedKey={selectedKey}
        onSelectionChange={setSelectedKey}
        hideHelpIcon
      />
      <main className={styles.app_main}>
        {selectedKey === 'daily-timesheets' && <DailyTimesheetPage />}
        {selectedKey === 'timesheet' && (
          <div className={styles.app_placeholder}>Timesheet coming soon</div>
        )}
      </main>
    </div>
  );
}
