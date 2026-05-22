import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShieldOff, FileQuestion } from 'lucide-react';
import { logout } from '../../features/auth/authSlice';

const UnauthorizedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { role } = useSelector((state) => state.auth);
  const is404 = !location.pathname.includes('unauthorized');

  const handleNavigation = () => {
    if (role === 'owner') {
      navigate('/owner');
    } else if (role === 'employee') {
      navigate('/employee');
    } else {
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${is404 ? 'bg-slate-100' : 'bg-rose-50'}`}>
          {is404
            ? <FileQuestion size={32} className="text-slate-400" />
            : <ShieldOff size={32} className="text-rose-500" />
          }
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {is404 ? '404 — Page Not Found' : 'Access Restricted'}
        </h1>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          {is404
            ? "The page you're looking for doesn't exist or has been moved."
            : 'Your account does not have permission to view this page. Please sign in with an authorized account.'
          }
        </p>

        <button
          onClick={handleNavigation}
          className="mt-8 inline-block rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition shadow-md shadow-indigo-100"
        >
          {role === 'owner' || role === 'employee' ? 'Go to Dashboard' : (is404 ? 'Go to Login' : 'Return to Login')}
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
