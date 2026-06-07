import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import useAuthStore from '../../store/authStore';
import arcusLogo from '../../assets/arcus_logo.png';

/**
 * AppShell — wraps all tabbed screens.
 * Provides the safe-area padding, bottom nav on mobile, and sidebar on desktop.
 */
export default function AppShell() {
  const location = useLocation();
  const user = useAuthStore(s => s.user);

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 min-h-screen bg-gray-50 relative w-full flex flex-col">
        {/* Mobile Header */}
        <header
          className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4"
          style={{ paddingTop: 'var(--safe-top)' }}
        >
          <div className="h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={arcusLogo} alt="Arcus" className="w-6 h-6 object-contain" />
              <span className="text-lg font-bold text-gray-900 tracking-tight">Arcus</span>
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between h-16 px-8 bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <span>Arcus</span>
            <span>/</span>
            <span className="text-gray-900 font-medium capitalize">{location.pathname.split('/')[1] || 'Directory'}</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm border border-indigo-100">
               {user?.displayName?.charAt(0).toUpperCase() || 'U'}
             </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 w-full mx-auto overflow-y-auto pb-[calc(var(--nav-height)+var(--safe-bottom)+20px)] md:pb-8 p-4 md:p-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Nav */}
        <BottomNav />
      </div>
    </div>
  );
}
