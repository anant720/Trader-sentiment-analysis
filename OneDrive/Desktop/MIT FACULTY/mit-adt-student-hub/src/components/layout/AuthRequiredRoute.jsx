import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

/**
 * AuthRequiredRoute — redirects unauthenticated users to /onboarding.
 * Unlike ProtectedRoute, it DOES NOT enforce profile completion.
 * Used primarily for the /complete-profile route.
 */
export default function AuthRequiredRoute() {
  const user = useAuthStore(s => s.user);
  const isLoading = useAuthStore(s => s.isLoading);
  const needsPassword = useAuthStore(s => s.needsPassword);
  const location = useLocation();

  if (isLoading) return null;
  if (!user) return <Navigate to="/onboarding" replace />;
  
  if (needsPassword && location.pathname !== '/set-password') {
    return <Navigate to="/set-password" replace />;
  }

  return <Outlet />;
}
