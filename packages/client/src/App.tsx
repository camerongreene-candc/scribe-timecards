import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ProductNavigation } from '@castandcrew/platform-ui';
import DailyTimesheetPage from './pages/DailyTimesheets';
import WeeklyTimecardPage from './pages/WeeklyTimecard';
import TransferOrbDevPage from './pages/TransferOrbDevPage';
import styles from './App.module.css';

const NAV_LINKS = [
  { id: 'daily-timesheets', label: 'Daily Timesheets' },
  { id: 'timesheet', label: 'Timesheet' },
  { id: 'orb-dev', label: 'Orb Dev' },
];

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const selectedKey = pathname.replace(/^\//, '') || 'daily-timesheets';

  return (
    <div className={styles.app_root}>
      <header className={styles.app_header}>
      <ProductNavigation
        links={NAV_LINKS}
        selectedKey={selectedKey}
        onSelectionChange={(key) => navigate(`/${key}`)}
        hideHelpIcon
      />
      </header>
      <main className={styles.app_main}>
        <Routes>
          <Route index element={<Navigate to="/daily-timesheets" replace />} />
          <Route path="daily-timesheets" element={<DailyTimesheetPage />} />
          <Route path="timesheet" element={<WeeklyTimecardPage />} />
          <Route path="orb-dev" element={<TransferOrbDevPage />} />
        </Routes>
      </main>
    </div>
  );
}
