// components/RecruiterProtectedRoute.jsx
import ProtectedRoute from './ProtectedRoute';

const RecruiterProtectedRoute = ({ children, ...props }) => {
  return (
    <ProtectedRoute 
      allowedRoles={['recruiter']} 
      redirectTo="/recruiter/dashboard"
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
};

export default RecruiterProtectedRoute;