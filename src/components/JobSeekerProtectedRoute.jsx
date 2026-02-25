// components/JobSeekerProtectedRoute.jsx
import ProtectedRoute from './ProtectedRoute';

const JobSeekerProtectedRoute = ({ children, ...props }) => {
  return (
    <ProtectedRoute 
      allowedRoles={['job_seeker']} 
      redirectTo="/"
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
};

export default JobSeekerProtectedRoute;