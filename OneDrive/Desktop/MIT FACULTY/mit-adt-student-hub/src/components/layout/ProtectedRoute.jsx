import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

/**
 * ProtectedRoute — redirects unauthenticated users to /onboarding.
 * Wraps all tabbed pages + admin page.
 */
export default function ProtectedRoute() {
  const user = useAuthStore(s => s.user);
  const needsProfile = useAuthStore(s => s.needsProfile);
  const needsPassword = useAuthStore(s => s.needsPassword);

  if (!user) return <Navigate to="/onboarding" replace />;
  
  // Force password creation if signed up via Google
  if (needsPassword) return <Navigate to="/set-password" replace />;
  
  // Force profile completion before allowing access to shielded areas
  if (needsProfile) return <Navigate to="/complete-profile" replace />;

  return <Outlet />;
}
