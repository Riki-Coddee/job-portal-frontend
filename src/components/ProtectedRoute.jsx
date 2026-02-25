import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ 
  children, 
  allowedRoles = [],
  redirectTo = null
}) => {
  const { isAuthorized, user, loading, initialized } = useAuth();
  const location = useLocation();

  // Show loading only during initial app load, not during navigation
  if (loading && !initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If auth check is complete and not authorized
  if (initialized && !isAuthorized) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user exists but role checking is needed
  if (initialized && allowedRoles.length > 0 && user?.role) {
    const normalizedUserRole = user.role.toLowerCase().replace(/_/g, '');
    const normalizedAllowedRoles = allowedRoles.map(role => 
      role.toLowerCase().replace(/_/g, '')
    );

    const hasAccess = normalizedAllowedRoles.includes(normalizedUserRole);
    
    if (!hasAccess) {
      if (redirectTo) {
        return <Navigate to={redirectTo} replace />;
      }
      
      // Redirect based on user role
      switch(user.role) {
        case 'recruiter':
          return <Navigate to="/recruiter/dashboard" replace />;
        case 'job_seeker':
          return <Navigate to="/" replace />;
        default:
          return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  // Return children while auth is being checked (for smooth transitions)
  return children;
};

export default ProtectedRoute;