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
import TransferOrbDevPage from './pages/TransferOrbDevPage';
import AppHeader from './components/AppHeader';
import styles from './App.module.css';

const NAV_LINKS = [
  { id: 'daily-timesheets', label: 'Daily Timesheets' },
  {id: 'reports', label: 'Reports'},
  { id: 'orb-dev', label: 'Orb Dev' },
];

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const selectedKey = pathname.replace(/^\//, '') || 'daily-timesheets';
  const [projectId, setProjectId] = useState('static-bloom');

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
                  element={<DailyTimesheetPage projectId={projectId} />}
                />
                <Route path='reports' element={<ReportsPage />} />
                <Route path='orb-dev' element={<TransferOrbDevPage />} />
              </Routes>
            </SnackbarProvider>
          </main>
        </div>
      </div>
    </div>
  );
}
