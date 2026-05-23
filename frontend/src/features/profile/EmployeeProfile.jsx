import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../app/axiosInterceptors';
import { setAuthSuccess } from '../auth/authSlice';
import { toast } from 'react-toastify';
import {
  setProfile, setLoading, setSaveLoading, setPasswordLoading, setError, setSuccessMessage
} from './profileSlice';
import {
  User, Mail, Briefcase, Building2, Calendar, Phone, CreditCard,
  MapPin, Loader2, Save, Key, UserCheck, AlertCircle,
  Edit2, X
} from 'lucide-react';

export default function EmployeeProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Selector
  const { profile, loading, saveLoading, passwordLoading, error, successMessage } = useSelector((state) => state.profile);

  const [isEditing, setIsEditing] = useState(false);

  // Forms
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    bankAccount: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch full details
  const fetchProfileDetails = useCallback(async (silent = false) => {
    if (!silent) dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await api.get(`/users/info/${user._id}`);
      if (response.data?.success) {
        const details = response.data.data;
        dispatch(setProfile(details));
        setProfileForm({
          fullName: details.fullName || '',
          phone: details.phone || '',
          address: details.address || '',
          dateOfBirth: details.dateOfBirth ? details.dateOfBirth.split('T')[0] : '',
          bankAccount: details.bankAccount || ''
        });
      }
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Failed to fetch profile info.'));
    } finally {
      if (!silent) dispatch(setLoading(false));
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (user?._id) {
      fetchProfileDetails();
    }
  }, [user?._id, fetchProfileDetails]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(setSuccessMessage(null));
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(setError(null));
    }
  }, [error, dispatch]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setProfileForm({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        address: profile.address || '',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        bankAccount: profile.bankAccount || ''
      });
    }
  };

  // Submit Profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    dispatch(setSaveLoading(true));
    dispatch(setError(null));
    dispatch(setSuccessMessage(null));
    try {
      const payload = {
        fullName: profileForm.fullName || undefined,
        phone: profileForm.phone || undefined,
        address: profileForm.address || undefined,
        dateOfBirth: profileForm.dateOfBirth ? new Date(profileForm.dateOfBirth).toISOString() : undefined,
        bankAccount: profileForm.bankAccount || undefined
      };

      const response = await api.put('/users/profile', payload);
      if (response.data?.success) {
        dispatch(setSuccessMessage('Profile details updated successfully!'));

        // Sync Redux state with updated user
        const updatedUser = { ...user, ...response.data.data };
        dispatch(setAuthSuccess({ user: updatedUser, accessToken: localStorage.getItem('token') }));

        await fetchProfileDetails(true);
        setIsEditing(false);
      }
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Failed to save profile changes.'));
    } finally {
      dispatch(setSaveLoading(false));
    }
  };

  // Submit Password update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    dispatch(setError(null));
    dispatch(setSuccessMessage(null));

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      dispatch(setError("New password and confirmation password do not match."));
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      dispatch(setError("New password must be at least 6 characters."));
      return;
    }

    dispatch(setPasswordLoading(true));
    try {
      const response = await api.put('/users/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.data?.success) {
        dispatch(setSuccessMessage('Password changed successfully!'));
        setPasswordForm({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Failed to change password.'));
    } finally {
      dispatch(setPasswordLoading(false));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-3 bg-white rounded-2xl border">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
        <span className="text-slate-400 text-sm font-bold tracking-wide">Syncing profile details...</span>
      </div>
    );
  }

  const initials = profile?.fullName ? profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '?';

  return (
    <div className="space-y-6">

      {/* Banner card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <User className="text-indigo-600" size={26} />
            My Profile Settings
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your personal verification details, residential contact, banking accounts, and password credentials.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Info card (Left) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-4">
            <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center text-3xl font-black mx-auto shadow-md">
              {initials}
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">{profile?.fullName}</h3>
              <p className="text-xs text-indigo-600 font-bold capitalize">{profile?.role} • {profile?.position || 'Employee'}</p>
            </div>

            <div className="pt-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${profile?.isVerified
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50'
                : 'bg-amber-50 text-amber-700 border border-amber-100/50'
                }`}>
                <UserCheck size={14} />
                {profile?.isVerified ? 'Verified Profile' : 'Pending Verification'}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase">Corporate Specs</h4>

            <div className="space-y-3.5 text-xs font-semibold text-slate-600">
              {profile?.identity && (
                <div className="flex items-center gap-2.5">
                  <UserCheck size={16} className="text-slate-400 shrink-0" />
                  <span className="font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold">ID: {profile.identity}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-slate-400 shrink-0" />
                <span className="truncate">{profile?.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Briefcase size={16} className="text-slate-400 shrink-0" />
                <span>{profile?.position || 'No Title Set'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Building2 size={16} className="text-slate-400 shrink-0" />
                <span>{profile?.branch || 'No Branch Set'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar size={16} className="text-slate-400 shrink-0" />
                <span>Joined {profile?.joinDate ? new Date(profile.joinDate).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action cards (Right - forms) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Edit Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            {!isEditing ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-800 text-base tracking-tight">Personal & Contact Details</h3>
                    <p className="text-xs text-slate-400 mt-1">Keep your bank details, phone contact, and address updated for payroll compliance.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                </div>

                <div className="space-y-4 text-slate-600 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-600"><User size={18} /></span>
                    <div>
                      <p className="font-semibold text-slate-900">{profile?.fullName || 'N/A'}</p>
                      <p className="text-slate-500 text-xs">Full name</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500"><Phone size={18} /></span>
                    <div>
                      <p className="font-semibold text-slate-900">{profile?.phone || 'Not set'}</p>
                      <p className="text-slate-500 text-xs">Phone number</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500"><Calendar size={18} /></span>
                    <div>
                      <p className="font-semibold text-slate-900">{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not set'}</p>
                      <p className="text-slate-500 text-xs">Date of birth</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500"><CreditCard size={18} /></span>
                    <div>
                      <p className="font-semibold text-slate-900">{profile?.bankAccount || 'Not set'}</p>
                      <p className="text-slate-500 text-xs">Bank account details</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 text-slate-500"><MapPin size={18} /></span>
                    <div>
                      <p className="font-semibold text-slate-900">{profile?.address || 'Not set'}</p>
                      <p className="text-slate-500 text-xs">Residential address</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-800 text-base tracking-tight">Personal & Contact Details</h3>
                    <p className="text-xs text-slate-400 mt-1">Keep your bank details, phone contact, and address updated for payroll compliance.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300 transition"
                    >
                      <X size={14} /> Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition disabled:bg-emerald-400"
                    >
                      <Save size={14} /> {saveLoading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700 transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +919876543210"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Date of Birth</label>
                    <input
                      type="date"
                      value={profileForm.dateOfBirth}
                      onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                      className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700 transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Bank Account Details</label>
                    <input
                      type="text"
                      placeholder="e.g. Account Number / IFSC"
                      value={profileForm.bankAccount}
                      onChange={(e) => setProfileForm({ ...profileForm, bankAccount: e.target.value })}
                      className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Residential Address</label>
                  <textarea
                    rows="2"
                    placeholder="Street details, City, Pin code"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700 transition resize-none"
                  />
                </div>
              </form>
            )}
          </div>

          {/* Change Password */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h3 className="font-black text-slate-800 text-base tracking-tight">Security Credentials</h3>
              <p className="text-xs text-slate-400 mt-1">Change your workspace access password details.</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700 transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Retype new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700 transition"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-indigo-200 transition flex justify-center items-center gap-2 transform active:scale-98 disabled:opacity-50"
                >
                  {passwordLoading ? <Loader2 className="animate-spin" size={16} /> : <Key size={16} />}
                  Change Password
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
