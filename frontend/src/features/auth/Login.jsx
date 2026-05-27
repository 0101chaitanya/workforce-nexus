import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../../app/authApi';
import { setAuthSuccess } from './authSlice';
import { Mail, Lock, Briefcase, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { validateForm } from '../../utils/validation';
import { authSchemas } from './authSchemas';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isForgotMode, setIsForgotMode] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Data inputs
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleInputChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // Auth processing submission routine
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const validated = validateForm(authSchemas.login, {
      email: loginData.identifier,
      password: loginData.password
    });
    if (!validated) return;

    setLoading(true);

    try {
      const payload = {
        email: validated.email.toLowerCase(),
        password: validated.password,
      };

      const response = await authApi.post('/auth/login', payload);
      dispatch(setAuthSuccess(response.data));

      // Navigate directly to the role-specific dashboard — no intermediate redirect needed
      const role = response.data?.user?.role?.toLowerCase();
      const normalizedRole = role;
      const destination = normalizedRole === 'owner' ? '/owner' : '/employee';
      navigate(destination);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials provided.");
    } finally {
      setLoading(false);
    }
  };

  // Password reset transmission block
  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    const validated = validateForm(authSchemas.forgotPasswordOtp, { email: recoveryEmail });
    if (!validated) return;

    setLoading(true);

    try {
      await authApi.post('/auth/forgot-password-otp', validated);
      toast.success("Recovery instructions forwarded! Check your inbox.");
      setIsOtpMode(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to issue password restoration ticket.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    const validated = validateForm(authSchemas.resetPassword, {
      email: recoveryEmail,
      otp: otp,
      newPassword: newPassword
    });
    if (!validated) return;

    setLoading(true);

    try {
      await authApi.post('/auth/reset-password', validated);
      toast.success("Password reset successfully! You can now login.");
      setTimeout(() => {
        setIsForgotMode(false);
        setIsOtpMode(false);
        setOtp('');
        setNewPassword('');
        setRecoveryEmail('');
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password.");
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

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Corporate Email or ID
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                    <input type="text" name="identifier" value={loginData.identifier} onChange={handleInputChange} required
                      className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200 text-sm font-medium text-slate-700"
                      placeholder="name@company.com or EMP-XXXXXX" />
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
                    <input type={showPassword ? "text" : "password"} name="password" value={loginData.password} onChange={handleInputChange} required
                      className="w-full pl-11 pr-12 py-3 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200 text-sm font-medium text-slate-700" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-indigo-600 transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading || !loginData.identifier || !loginData.password}
                  className="w-full flex justify-center items-center gap-2 py-3.5 bg-indigo-600 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition transform active:scale-98 disabled:bg-slate-300 disabled:shadow-none mt-2">
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Authorizing...</> : 'Enter Workspace'}
                </button>

                <p className="text-center text-sm text-slate-400 font-medium mt-6">
                  Need to register a firm?{' '}
                  <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold ml-1">
                    Register
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

              {!isOtpMode ? (
                <form onSubmit={handleRecoverySubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered Email or ID</label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                      <input type="text" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} required
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200 text-sm font-medium text-slate-700" placeholder="yourname@company.com or EMP-XXXXXX" />
                    </div>
                  </div>

                  <button type="submit" disabled={loading || !recoveryEmail}
                    className="w-full flex justify-center items-center gap-2 py-3.5 bg-indigo-600 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition transform active:scale-98 disabled:bg-slate-300 disabled:shadow-none mt-2">
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Transmitting...</> : 'Send Recovery Link'}
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
                      <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
                        className="w-full pl-11 pr-12 py-3 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200 text-sm font-medium text-slate-700" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-indigo-600 transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading || !otp || !newPassword}
                    className="w-full flex justify-center items-center gap-2 py-3.5 bg-indigo-600 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition transform active:scale-98 disabled:bg-slate-300 disabled:shadow-none mt-2">
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Resetting...</> : 'Reset Password'}
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
