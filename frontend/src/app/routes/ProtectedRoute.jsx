import { useSelector, useDispatch } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import api from '../../app/axiosInterceptors';

/**
 * **Route protection wrapper** component.
 * Validates active session access tokens and enforces **role-based endpoint filters**.
 * Redirects to `/login` if unauthenticated, or `/404` (Unauthorized) on role mismatches.
 * @param {Object} props
 * @param {React.ReactNode} [props.children] - Target route children components.
 * @param {Array<string>} [props.allowedRoles] - Permitted role identifiers.
 * @returns {React.ReactNode} Renderable output.
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { token, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // 1. Force unauthenticated clients back to login screen
  if (!token) {
    if (role) {
      setTimeout(() => {
        api.post('/auth/logout').catch(() => {});
        dispatch(logout());
      }, 0);
    }
    return <Navigate to="/login" replace />;
  }

  // 3. Strict security check — redirect to 404 catch-all route on role mismatch
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/404" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;