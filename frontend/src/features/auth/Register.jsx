import { useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../../app/authApi';
import { setLoading } from './authSlice';
import { ShieldCheck, Mail, Lock, Building, User, CheckCircle, Briefcase, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { validateForm } from '../../utils/validation';
import { authSchemas } from './authSchemas';

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        companyName: '',
        fullName: '',
        email: '',
        otp: '',
        password: '',
        confirmPassword: ''
    });

    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async () => {
        const validated = validateForm(authSchemas.sendOtp, {
            email: formData.email,
            companyName: formData.companyName
        });
        if (!validated) return;

        setOtpLoading(true);
        try {
            await authApi.post('/auth/send-otp', validated);
            setIsOtpSent(true);
            toast.success("OTP verification code transmitted successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP code.");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        const validated = validateForm(authSchemas.verifyOtp, {
            email: formData.email,
            otp: formData.otp
        });
        if (!validated) return;

        setOtpLoading(true);
        try {
            await authApi.post('/auth/verify-otp', validated);
            setIsEmailVerified(true);
            toast.success("Email verification confirmed!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid validation code.");
        } finally {
            setOtpLoading(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isEmailVerified) {
            toast.error("Please complete verification steps first.");
            return;
        }

        const validated = validateForm(authSchemas.register, formData);
        if (!validated) return;

        dispatch(setLoading(true));
        try {
            await authApi.post('/auth/register', validated);
            toast.success("Company created successfully! Redirecting to login view...");
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration sequence failed.");
            dispatch(setLoading(false));
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-900 selection:bg-indigo-500 selection:text-white cursor-default">
            {/* Left Design Sidebar */}
            <div className="hidden lg:flex lg:w-5/12 bg-indigo-600 relative overflow-hidden flex-col justify-between p-12">
                <div className="absolute inset-0 bg-linear-to-br from-indigo-500 to-indigo-800 opacity-90 z-0" />
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-900/40 rounded-full blur-2xl" />
                
                <div className="relative z-10 flex items-center gap-3">
                    <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                        <Briefcase className="text-white" size={26} />
                    </div>
                    <span className="text-xl font-black tracking-wider text-white">EMS PORTAL</span>
                </div>

                <div className="relative z-10 text-white max-w-md">
                    <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
                        Streamline Corporate Workforce Logistics.
                    </h1>
                    <p className="text-indigo-100 mt-4 text-base font-medium leading-relaxed opacity-90">
                        Create your corporate workspace profile to manage payroll setups, schedule operations, and monitor workforce metrics in real time.
                    </p>
                </div>

                <div className="relative z-10 text-xs font-semibold tracking-wide text-indigo-200/70">
                    &copy; EMS Solutions Ecosystem. All rights reserved.
                </div>
            </div>

            {/* Right Interactive Form Area */}
            <div className="w-full lg:w-7/12 bg-slate-50 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
                <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10 transition-all duration-300">
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Create Organization</h2>
                        <p className="text-slate-400 mt-1.5 font-medium text-sm">Register your enterprise environment to begin initialization</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Company Name</label>
                                <div className="relative mt-1.5">
                                    <Building className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                                    <input type="text" name="companyName" onChange={handleChange} required disabled={isEmailVerified}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200 text-sm font-medium text-slate-700" placeholder="Acme Logistics Inc" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Owner Full Name</label>
                                <div className="relative mt-1.5">
                                    <User className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                                    <input type="text" name="fullName" onChange={handleChange} required disabled={isEmailVerified}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200 text-sm font-medium text-slate-700" placeholder="Alexander Wright" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Corporate Email</label>
                            <div className="flex gap-2 mt-1.5">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                                    <input type="email" name="email" onChange={handleChange} required disabled={isEmailVerified}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200 text-sm font-medium text-slate-700" placeholder="alex@company.com" />
                                </div>
                                <button type="button" onClick={handleSendOtp} disabled={otpLoading || isEmailVerified || !formData.email || !formData.companyName || !formData.fullName}
                                    className="px-5 flex justify-center items-center gap-1.5 bg-indigo-50 text-indigo-600 rounded-2xl font-bold text-xs hover:bg-indigo-100 disabled:bg-slate-100 disabled:text-slate-400 border border-indigo-100/50 shadow-sm transition-colors duration-200 min-w-[100px]">
                                    {otpLoading ? <><Loader2 size={14} className="animate-spin" /> Sending</> : isOtpSent ? 'Resend' : 'Send OTP'}
                                </button>
                            </div>
                        </div>

                        {isOtpSent && !isEmailVerified && (
                            <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/50 space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-indigo-900">Enter Secret Verification OTP</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <ShieldCheck className="absolute left-3.5 top-3.5 text-indigo-500" size={18} />
                                        <input type="text" name="otp" onChange={handleChange} placeholder="5-Digit Authorization Code"
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-indigo-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono tracking-widest font-bold text-sm text-indigo-950" />
                                    </div>
                                    <button type="button" onClick={handleVerifyOtp} disabled={otpLoading || !formData.otp}
                                        className="px-6 flex justify-center items-center gap-1.5 bg-indigo-600 text-white rounded-2xl font-bold text-xs hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors duration-200">
                                        {otpLoading ? <><Loader2 size={14} className="animate-spin" /> Verifying</> : 'Verify'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {isEmailVerified && (
                            <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-xs font-bold">
                                <CheckCircle size={16} /> Email Verification Finalized
                            </div>
                        )}

                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300 ${isEmailVerified ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Create Password</label>
                                <div className="relative mt-1.5">
                                    <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                                    <input type={showPassword ? "text" : "password"} name="password" onChange={handleChange} required={isEmailVerified}
                                        className="w-full pl-11 pr-12 py-3 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium text-slate-700" placeholder="••••••••" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-indigo-600 transition-colors">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirm Password</label>
                                <div className="relative mt-1.5">
                                    <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" onChange={handleChange} required={isEmailVerified}
                                        className="w-full pl-11 pr-12 py-3 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium text-slate-700" placeholder="••••••••" />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-indigo-600 transition-colors">
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button type="submit" disabled={loading || !isEmailVerified || !formData.password || !formData.confirmPassword}
                            className={`w-full flex justify-center items-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white shadow-xl transition-all duration-200 transform active:scale-98 mt-4 ${
                                (loading || !isEmailVerified) ? 'bg-slate-300 text-slate-500 shadow-none cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                            }`}>
                            {loading ? <><Loader2 size={18} className="animate-spin" /> Registering...</> : 'Register'}
                        </button>

                        <p className="text-center text-sm text-slate-400 font-medium mt-6">
                            Already Registered?{' '}
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold ml-1">
                                Sign In
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
