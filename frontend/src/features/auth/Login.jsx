import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axiosInterceptors from '../../app/axiosInterceptors';
import { setAuthSuccess, setAuthFailed, clearError } from './authSlice';
import { Mail, Lock, Briefcase } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error } = useSelector((state) => state.auth);

  const [isForgotMode, setIsForgotMode] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Data inputs
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch, isForgotMode]);

  const handleInputChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // Auth processing submission routine
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(clearError());

    try {
      const payload = {
        email: loginData.identifier.trim().toLowerCase(),
        password: loginData.password,
      };

      const response = await axiosInterceptors.post('/auth/login', payload);
      dispatch(setAuthSuccess(response.data));

      // Navigate directly to the role-specific dashboard — no intermediate redirect needed
      const role = response.data?.user?.role?.toLowerCase();
      const normalizedRole = role;
      const destination = normalizedRole === 'owner' ? '/owner' : '/employee';
      navigate(destination);
    } catch (err) {
      dispatch(setAuthFailed(err.response?.data?.message || "Invalid credentials provided."));
    } finally {
      setLoading(false);
    }
  };

  // Password reset transmission block
  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    setLoading(true);
    dispatch(clearError());
    setSuccessMessage('');

    try {
      await axiosInterceptors.post('/auth/forgot-password-otp', { email: recoveryEmail });
      setSuccessMessage("Recovery instructions forwarded! Check your inbox.");
      setIsOtpMode(true);
    } catch (err) {
      dispatch(setAuthFailed(err.response?.data?.message || "Failed to issue password restoration ticket."));
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) return;
    setLoading(true);
    dispatch(clearError());
    setSuccessMessage('');

    try {
      await axiosInterceptors.post('/auth/reset-password', { email: recoveryEmail, otp, newPassword });
      setSuccessMessage("Password reset successfully! You can now login.");
      setTimeout(() => {
        setIsForgotMode(false);
        setIsOtpMode(false);
        setOtp('');
        setNewPassword('');
        setRecoveryEmail('');
      }, 2000);
    } catch (err) {
      dispatch(setAuthFailed(err.response?.data?.message || "Failed to reset password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Left Design Sidebar */}
      <div className="hidden lg:flex lg:w-5/12 bg-indigo-600 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-600 to-indigo-900 opacity-95 z-0" />
        <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-indigo-500/30 rounded-full blur-2xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <Briefcase className="text-white" size={26} />
          </div>
          <span className="text-xl font-black tracking-wider text-white">EMS PORTAL</span>
        </div>

        <div className="relative z-10 text-white max-w-sm">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            Central Workforce Coordination Terminal.
          </h1>
          <p className="text-indigo-100 mt-4 text-sm font-medium leading-relaxed opacity-90">
            Sign in to access your administrative operations dashboard, schedule tasks, or verify attendance compliance items.
          </p>
        </div>

        <div className="relative z-10 text-xs font-semibold tracking-wide text-indigo-200/70">
          &copy; EMS Solutions Ecosystem. All rights reserved.
        </div>
      </div>

      {/* Right Interactive Core Area */}
      <div className="w-full lg:w-7/12 bg-slate-50 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100 p-8 md:p-10 transition-all duration-300">

          {!isForgotMode ? (
            <>
              {/* Login State Section Header */}
              <div className="mb-6">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Workspace Login</h2>
                <p className="text-slate-400 mt-1.5 font-medium text-sm">Provide your user credentials to access your session</p>
              </div>

              {error && (
                <div className="mb-5 p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100/50 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0" /> {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-5 p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-bold border border-emerald-100/50 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" /> {successMessage}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Corporate Email
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                    <input type="email" name="identifier" value={loginData.identifier} onChange={handleInputChange} required
                      className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200 text-sm font-medium text-slate-700"
                      placeholder="name@company.com" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Security Password</label>
                    <button type="button" onClick={() => setIsForgotMode(true)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                    <input type="password" name="password" value={loginData.password} onChange={handleInputChange} required
                      className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200 text-sm font-medium text-slate-700" placeholder="••••••••" />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-indigo-600 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition transform active:scale-98 disabled:bg-slate-300 disabled:shadow-none cursor-not-allowed mt-2">
                  {loading ? 'Authorizing Connection...' : 'Enter Workspace'}
                </button>

                <p className="text-center text-sm text-slate-400 font-medium mt-6">
                  Need to register a firm?{' '}
                  <Link to="/register" className="text-indigo-600 hover:text-indigo-700 underline font-bold ml-1">
                    Create Workspace Architecture
                  </Link>
                </p>
              </form>
            </>
          ) : (
            <>
              {/* Forgot Password Section */}
              <div className="mb-6">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Account Recovery</h2>
                <p className="text-slate-400 mt-1.5 font-medium text-sm">Provide your registered system email to dispatch reset instructions</p>
              </div>

              {error && (
                <div className="mb-5 p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100/50 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0" /> {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-5 p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-bold border border-emerald-100/50 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" /> {successMessage}
                </div>
              )}

              {!isOtpMode ? (
                <form onSubmit={handleRecoverySubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered Email Address</label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                      <input type="email" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} required
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200 text-sm font-medium text-slate-700" placeholder="yourname@company.com" />
                    </div>
                  </div>

                  <button type="submit" disabled={loading || !recoveryEmail}
                    className="w-full py-3.5 bg-indigo-600 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition transform active:scale-98 disabled:bg-slate-300 disabled:shadow-none cursor-not-allowed mt-2">
                    {loading ? 'Transmitting Token...' : 'Send Recovery Link'}
                  </button>

                  <button type="button" onClick={() => { setIsForgotMode(false); setIsOtpMode(false); setRecoveryEmail(''); }}
                    className="w-full text-center text-sm font-bold text-slate-500 hover:text-slate-800 transition mt-2">
                    Return to Sign-In View
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">One-Time Password (OTP)</label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                      <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200 text-sm font-medium text-slate-700" placeholder="Enter OTP" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">New Password</label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200 text-sm font-medium text-slate-700" placeholder="••••••••" />
                    </div>
                  </div>

                  <button type="submit" disabled={loading || !otp || !newPassword}
                    className="w-full py-3.5 bg-indigo-600 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition transform active:scale-98 disabled:bg-slate-300 disabled:shadow-none cursor-not-allowed mt-2">
                    {loading ? 'Resetting Password...' : 'Reset Password'}
                  </button>

                  <button type="button" onClick={() => setIsOtpMode(false)}
                    className="w-full text-center text-sm font-bold text-slate-500 hover:text-slate-800 transition mt-2">
                    Back to Email
                  </button>
                </form>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
