import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import useSettingsStore from './store/settingsStore';

import ProtectedRoute from './components/layout/ProtectedRoute';
import AuthRequiredRoute from './components/layout/AuthRequiredRoute';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import arcusLogo from './assets/arcus_logo.png';

import OnboardingPage from './pages/auth/OnboardingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import SetPasswordPage from './pages/auth/SetPasswordPage';
import CompleteProfilePage from './pages/auth/CompleteProfilePage';

import FacultyPage from './pages/FacultyPage';
import HubPage from './pages/HubPage';
import TasksPage from './pages/TasksPage';
import DevPage from './pages/DevPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

import AppShell from './components/layout/AppShell';
import AdminRoute from './components/layout/AdminRoute';

export default function App() {
  const init = useAuthStore(s => s.init);
  const isLoading = useAuthStore(s => s.isLoading);
  const loadSettings = useSettingsStore(s => s.load);

  useEffect(() => {
    loadSettings();
    const unsub = init();
    
    // Tell Capacitor Updater the app booted successfully (prevents rollbacks)
    try {
      CapacitorUpdater.notifyAppReady();
    } catch (e) {}
    
    return unsub;
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F2F2F7]">
        <div style={{background:'#F2F2F7', borderRadius:'20px', padding:'12px', boxShadow:'0 4px 16px rgba(0,0,0,0.08)'}}>
          <img src={arcusLogo} alt="Arcus" className="arcus-logo arcus-logo--appicon" />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<AuthRequiredRoute />}>
          <Route path="/set-password" element={<SetPasswordPage />} />
          <Route path="/complete-profile" element={<CompleteProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<FacultyPage />} />
            <Route path="/hub" element={<HubPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/dev" element={<DevPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
