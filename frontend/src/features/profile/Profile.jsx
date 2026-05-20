import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../app/axiosInterceptors';
import { setAuthSuccess } from '../auth/authSlice';
import { 
  User, Mail, Briefcase, Building2, Calendar, Phone, CreditCard, 
  MapPin, Cake, Lock, Loader2, Save, Key, UserCheck
} from 'lucide-react';

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // States
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState(null);

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
  const fetchProfileDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/users/info/${user._id}`);
      if (response.data?.success) {
        const details = response.data.data;
        setProfile(details);
        setProfileForm({
          fullName: details.fullName || '',
          phone: details.phone || '',
          address: details.address || '',
          dateOfBirth: details.dateOfBirth ? details.dateOfBirth.split('T')[0] : '',
          bankAccount: details.bankAccount || ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile info.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchProfileDetails();
    }
  }, [user?._id]);

  // Submit Profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
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
        alert('Profile details updated successfully!');
        
        // Sync Redux state with updated user
        const updatedUser = { ...user, ...response.data.data };
        dispatch(setAuthSuccess({ user: updatedUser, token: localStorage.getItem('token') }));
        
        fetchProfileDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save profile changes.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Submit Password update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New password and confirmation password do not match.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await api.put('/users/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.data?.success) {
        alert('Password changed successfully!');
        setPasswordForm({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
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

  if (error) {
    return (
      <div className="flex items-center gap-3 p-5 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100/50">
        <AlertCircle size={20} className="shrink-0" />
        <div className="text-xs font-bold">{error}</div>
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
              <p className="text-xs text-indigo-600 font-bold capitalize">{profile?.role} • {profile?.position || 'Staff member'}</p>
            </div>

            <div className="pt-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                profile?.isVerified 
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
            <div>
              <h3 className="font-black text-slate-800 text-base tracking-tight">Personal & Contact Details</h3>
              <p className="text-xs text-slate-400 mt-1">Keep your bank details, phone contact, and address updated for payroll compliance.</p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
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

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-indigo-200 transition flex justify-center items-center gap-2 transform active:scale-98 disabled:opacity-50"
                >
                  {saveLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Save Profile Changes
                </button>
              </div>
            </form>
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
