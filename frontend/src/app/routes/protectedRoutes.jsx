import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { token, role } = useSelector((state) => state.auth);

  // If there is no token, send the user to the login screen
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If roles are defined for this route, confirm the user has access
  if (allowedRoles.length > 0) {
    const normalizedUserRole = role?.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map((r) => r.toLowerCase());

    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Render the protected content if authenticated and authorized
  return children;
};

export default ProtectedRoute;