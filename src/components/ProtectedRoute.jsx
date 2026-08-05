import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { session, role, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }
  // console.log('role:', role, 'allowed:', allowedRoles);


  return children;
}