import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

/**
 * AdminRoute — only lets through users with isAdmin=true.
 * Everyone else gets bounced to home. No admin page URL guessing allowed.
 */
export default function AdminRoute() {
  const user    = useAuthStore(s => s.user);
  const isAdmin = useAuthStore(s => s.isAdmin);

  if (!user)    return <Navigate to="/onboarding" replace />;
  if (!isAdmin) return <Navigate to="/"           replace />;

  return <Outlet />;
}
