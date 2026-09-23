import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LoadingState } from './ui/Spinner.jsx';
import EmptyState from './ui/EmptyState.jsx';
import { buttonStyles } from './ui/Button.jsx';
import { Link } from 'react-router-dom';

/** Admin-only routes — backend enforces this too (requireRole), this is UX only. */
export default function AdminRoute() {
  const { user, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="container-page py-20">
        <LoadingState label="Checking your session…" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (user.role !== 'ADMIN') {
    return (
      <div className="container-page py-16">
        <h1 className="sr-only">Admins only</h1>
        <EmptyState
          title="Admins only"
          description="Your account doesn't have permission to view the admin dashboard."
          action={<Link to="/" className={buttonStyles({ variant: 'secondary' })}>Back home</Link>}
        />
      </div>
    );
  }
  return <Outlet />;
}
