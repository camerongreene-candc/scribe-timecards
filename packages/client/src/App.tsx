import { useState } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  ProductNavigation,
  IconButton,
  SnackbarProvider,
  Snackbar,
} from '@castandcrew/platform-ui';
import DailyTimesheetPage from './pages/DailyTimesheets';
import ReportsPage from './pages/Reports';
import WeeklyTimecardPage from './pages/WeeklyTimecard';
import AppHeader from './components/AppHeader';
import type { EmployeeRow } from './pages/DailyTimesheets/helpers/DailyTimesheetPage.types';
import styles from './App.module.css';

const NAV_LINKS = [
  { id: 'daily-timesheets', label: 'Daily Timesheets' },
  { id: 'timecards', label: 'Timecards' },
  { id: 'reports', label: 'Reports' },
];

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const selectedKey = pathname.split('/')[1] || 'daily-timesheets';
  const [projectId, setProjectId] = useState('static-bloom');

  //moved table state up from dts page to reports page for generating csv purposes
  //in actuality, dts should save to DB on save & reports can pull from there
  const [rows, setRows] = useState<EmployeeRow[]>([]);
  const [rowsProjectId, setRowsProjectId] = useState<string | null>(null);

  return (
    <div className={styles.app_root}>
      <AppHeader selectedProjectId={projectId} onProjectSelect={setProjectId} />

      <div className={styles.app_body}>
        {/* ── Secondary tab nav + content ──────────────────────────────── */}
        <div className={styles.app_column}>
          <nav className={styles.app_subnav} aria-label='Section navigation'>
            <ProductNavigation
              links={NAV_LINKS}
              leadingSlot={
                <div className={styles.app_subnav__date}>
                  <IconButton
                    buttonVariant='ghost'
                    iconName='chevron-left'
                    aria-label='Previous Year'
                  />
                  <span className='spotlight_label-base spotlight_strong'>
                    2026
                  </span>
                  <IconButton
                    buttonVariant='ghost'
                    iconName='chevron-right'
                    aria-label='Next Year'
                  />
                  <IconButton iconName='gear' buttonVariant='ghost' />
                </div>
              }
              selectedKey={selectedKey}
              onSelectionChange={(key) => navigate(`/${key}`)}
              hideHelpIcon
            />
          </nav>

          <main className={styles.app_main}>
            <SnackbarProvider
              position='top center'
              renderToast={(toast) => <Snackbar toast={toast} />}
            >
              <Routes>
                <Route
                  index
                  element={<Navigate to='/daily-timesheets' replace />}
                />
                <Route
                  path='daily-timesheets'
                  element={
                    <DailyTimesheetPage
                      projectId={projectId}
                      rows={rows}
                      setRows={setRows}
                      rowsProjectId={rowsProjectId}
                      setRowsProjectId={setRowsProjectId}
                    />
                  }
                />
                <Route path='reports' element={<ReportsPage rows={rows} />} />
                <Route path='timecards' element={<WeeklyTimecardPage />} />
              </Routes>
            </SnackbarProvider>
          </main>
        </div>
      </div>
    </div>
  );
}
