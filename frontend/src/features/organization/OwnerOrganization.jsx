import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../app/axiosInterceptors';
import { Building2, MapPin, Phone, Mail, ShieldCheck, Loader2, AlertCircle, UserCircle, Edit2, Save, X, Calendar, CreditCard } from 'lucide-react';
import {
    setCompany,
    setLoading,
    setError,
    setSuccessMessage,
    setSaving,
    setOwnerProfile,
    setOwnerLoading,
    setOwnerSaving,
    setOwnerError,
    setOwnerSuccessMessage
} from './organizationSlice';

const OwnerOrganization = () => {
    const dispatch = useDispatch();
    const { 
        company, 
        loading, 
        error, 
        successMessage, 
        saving,
        ownerProfile,
        ownerLoading,
        ownerSaving,
        ownerError,
        ownerSuccessMessage
    } = useSelector((state) => state.organization);

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ companyName: '', address: '', phone: '' });

    const [isEditingOwner, setIsEditingOwner] = useState(false);
    const [ownerForm, setOwnerForm] = useState({ fullName: '', phone: '', address: '', dateOfBirth: '', bankAccount: '' });

    const fetchOwnerProfile = async (ownerId) => {
        dispatch(setOwnerLoading(true));
        dispatch(setOwnerError(null));
        try {
            const response = await api.get(`/users/info/${ownerId}`);
            if (response.data?.success) {
                const details = response.data.data;
                dispatch(setOwnerProfile(details));
                setOwnerForm({
                    fullName: details.fullName || '',
                    phone: details.phone || '',
                    address: details.address || '',
                    dateOfBirth: details.dateOfBirth ? details.dateOfBirth.split('T')[0] : '',
                    bankAccount: details.bankAccount || ''
                });
            }
        } catch (err) {
            dispatch(setOwnerError(err.response?.data?.message || 'Failed to fetch owner profile details.'));
        } finally {
            dispatch(setOwnerLoading(false));
        }
    };

    const fetchCompany = async () => {
        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const response = await api.get('/company/protected');
            const companyData = response.data.data;
            dispatch(setCompany(companyData));
            setEditForm({
                companyName: companyData.companyName || '',
                address: companyData.address || '',
                phone: companyData.phone || ''
            });

            if (companyData?.owner?._id) {
                fetchOwnerProfile(companyData.owner._id);
            }
        } catch (err) {
            dispatch(setError(err.response?.data?.message || 'Unable to fetch organization details.'));
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditForm({
            companyName: company.companyName || '',
            address: company.address || '',
            phone: company.phone || ''
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        dispatch(setSaving(true));
        dispatch(setError(null));
        dispatch(setSuccessMessage(null));
        try {
            await api.put('/company/update', editForm);
            await fetchCompany();
            setIsEditing(false);
            dispatch(setSuccessMessage('Organization details updated successfully.'));
        } catch (err) {
            dispatch(setError(err.response?.data?.message || 'Failed to update organization details.'));
        } finally {
            dispatch(setSaving(false));
        }
    };

    const handleEditOwner = () => {
        setIsEditingOwner(true);
    };

    const handleCancelOwner = () => {
        setIsEditingOwner(false);
        if (ownerProfile) {
            setOwnerForm({
                fullName: ownerProfile.fullName || '',
                phone: ownerProfile.phone || '',
                address: ownerProfile.address || '',
                dateOfBirth: ownerProfile.dateOfBirth ? ownerProfile.dateOfBirth.split('T')[0] : '',
                bankAccount: ownerProfile.bankAccount || ''
            });
        }
    };

    const handleSaveOwner = async (e) => {
        e.preventDefault();
        dispatch(setOwnerSaving(true));
        dispatch(setOwnerError(null));
        dispatch(setOwnerSuccessMessage(null));
        try {
            const payload = {
                fullName: ownerForm.fullName,
                phone: ownerForm.phone || undefined,
                address: ownerForm.address || undefined,
                dateOfBirth: ownerForm.dateOfBirth ? new Date(ownerForm.dateOfBirth).toISOString() : undefined,
                bankAccount: ownerForm.bankAccount || undefined
            };
            await api.put('/users/profile', payload);
            if (company?.owner?._id) {
                await fetchOwnerProfile(company.owner._id);
            }
            setIsEditingOwner(false);
            dispatch(setOwnerSuccessMessage('Owner profile updated successfully.'));
        } catch (err) {
            dispatch(setOwnerError(err.response?.data?.message || 'Failed to update owner profile details.'));
        } finally {
            dispatch(setOwnerSaving(false));
        }
    };

    useEffect(() => {
        fetchCompany();
    }, []);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                dispatch(setSuccessMessage(null));
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, dispatch]);

    useEffect(() => {
        if (ownerSuccessMessage) {
            const timer = setTimeout(() => {
                dispatch(setOwnerSuccessMessage(null));
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [ownerSuccessMessage, dispatch]);

    if (loading) {
        return (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 shadow-sm text-center">
                <Loader2 className="animate-spin mx-auto text-indigo-600" size={40} />
                <p className="mt-4 text-slate-500">Loading organization information...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-rose-50 rounded-3xl border border-rose-100 p-8 text-rose-700 shadow-sm">
                <div className="flex items-center gap-3 font-semibold">
                    <AlertCircle size={20} />
                    Organization data unavailable
                </div>
                <p className="mt-3 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="space-y-4">
                        <h1 className="text-3xl font-black text-slate-900">Organization Details</h1>
                        <p className="text-slate-500 max-w-2xl">
                            This page displays protected company details for the owner. Use it as the home for business settings and company identity.
                        </p>
                    </div>
                    <div className="rounded-3xl bg-indigo-50 p-4 text-indigo-700">
                        <span className="text-sm font-semibold uppercase tracking-wide">Verified Owner Access</span>
                        <p className="mt-2 text-sm text-slate-700">Only the owner can view this protected company record.</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-3 p-5 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100/50 text-xs font-bold">
                    <AlertCircle size={20} className="shrink-0" />
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="flex items-center gap-3 p-5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100/50 text-xs font-bold">
                    <AlertCircle size={20} className="shrink-0" />
                    {successMessage}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Company Information Card */}
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-5">
                    {isEditing ? (
                        <form onSubmit={handleSave} className="space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-slate-800 font-bold text-lg">
                                    <Building2 size={24} /> Company Information
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={handleCancel} className="flex items-center gap-2 px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300 transition">
                                        <X size={14} /> Cancel
                                    </button>
                                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition disabled:bg-emerald-400">
                                        <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Company Name</label>
                                    <input
                                        type="text"
                                        value={editForm.companyName}
                                        onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                                        className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                                    <input
                                        type="text"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                        className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
                                    <textarea
                                        value={editForm.address}
                                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                        className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-slate-800 font-bold text-lg">
                                    <Building2 size={24} /> Company Information
                                </div>
                                <button type="button" onClick={handleEdit} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition">
                                    <Edit2 size={14} /> Edit
                                </button>
                            </div>

                            <div className="space-y-3 text-slate-600 text-sm">
                                <div className="flex items-center gap-3">
                                    <span className="text-indigo-600"><ShieldCheck size={18} /></span>
                                    <div>
                                        <p className="font-semibold text-slate-900">{company.companyName || 'Unknown Company'}</p>
                                        <p className="text-slate-500">Company name</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-slate-500"><Mail size={18} /></span>
                                    <div>
                                        <p className="font-semibold text-slate-900">{company.email || 'No email provided'}</p>
                                        <p className="text-slate-500">Company email</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-slate-500"><Phone size={18} /></span>
                                    <div>
                                        <p className="font-semibold text-slate-900">{company.phone || 'Not set'}</p>
                                        <p className="text-slate-500">Company phone</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="mt-1 text-slate-500"><MapPin size={18} /></span>
                                    <div>
                                        <p className="font-semibold text-slate-900">{company.address || 'Not set'}</p>
                                        <p className="text-slate-500">Business address</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Owner Profile Card */}
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-5">
                    {ownerLoading ? (
                        <div className="text-center py-10">
                            <Loader2 className="animate-spin mx-auto text-indigo-600" size={32} />
                            <p className="mt-3 text-slate-500 text-xs">Loading owner profile...</p>
                        </div>
                    ) : ownerProfile ? (
                        <>
                            {isEditingOwner ? (
                                <form onSubmit={handleSaveOwner} className="space-y-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-slate-800 font-bold text-lg">
                                            <UserCircle size={24} /> Owner Profile Details
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={handleCancelOwner} className="flex items-center gap-2 px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300 transition">
                                                <X size={14} /> Cancel
                                            </button>
                                            <button type="submit" disabled={ownerSaving} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition disabled:bg-emerald-400">
                                                <Save size={14} /> {ownerSaving ? 'Saving...' : 'Save'}
                                            </button>
                                        </div>
                                    </div>

                                    {ownerError && (
                                        <div className="flex items-center gap-3 p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100/50 text-xs font-bold">
                                            <AlertCircle size={16} />
                                            {ownerError}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">Full Name *</label>
                                            <input
                                                type="text"
                                                value={ownerForm.fullName}
                                                onChange={(e) => setOwnerForm({ ...ownerForm, fullName: e.target.value })}
                                                className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                                            <input
                                                type="text"
                                                value={ownerForm.phone}
                                                onChange={(e) => setOwnerForm({ ...ownerForm, phone: e.target.value })}
                                                className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
                                            <textarea
                                                value={ownerForm.address}
                                                onChange={(e) => setOwnerForm({ ...ownerForm, address: e.target.value })}
                                                className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                                rows={2}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">Date of Birth</label>
                                            <input
                                                type="date"
                                                value={ownerForm.dateOfBirth}
                                                onChange={(e) => setOwnerForm({ ...ownerForm, dateOfBirth: e.target.value })}
                                                className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">Bank Account</label>
                                            <input
                                                type="text"
                                                value={ownerForm.bankAccount}
                                                onChange={(e) => setOwnerForm({ ...ownerForm, bankAccount: e.target.value })}
                                                className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                            />
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-slate-800 font-bold text-lg">
                                            <UserCircle size={24} /> Owner Profile Details
                                        </div>
                                        <button type="button" onClick={handleEditOwner} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition">
                                            <Edit2 size={14} /> Edit
                                        </button>
                                    </div>

                                    {ownerSuccessMessage && (
                                        <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100/50 text-xs font-bold">
                                            <AlertCircle size={16} />
                                            {ownerSuccessMessage}
                                        </div>
                                    )}

                                    {ownerError && (
                                        <div className="flex items-center gap-3 p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100/50 text-xs font-bold">
                                            <AlertCircle size={16} />
                                            {ownerError}
                                        </div>
                                    )}

                                    <div className="space-y-3 text-slate-600 text-sm">
                                        <div className="flex items-center gap-3">
                                            <span className="text-indigo-600"><UserCircle size={18} /></span>
                                            <div>
                                                <p className="font-semibold text-slate-900">{ownerProfile.fullName || 'N/A'}</p>
                                                <p className="text-slate-500">Full name</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-500"><Mail size={18} /></span>
                                            <div>
                                                <p className="font-semibold text-slate-900">{ownerProfile.email || 'No email set'}</p>
                                                <p className="text-slate-500">Email address</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-500"><Phone size={18} /></span>
                                            <div>
                                                <p className="font-semibold text-slate-900">{ownerProfile.phone || 'Not set'}</p>
                                                <p className="text-slate-500">Phone number</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-500"><ShieldCheck size={18} /></span>
                                            <div>
                                                <p className="font-semibold text-slate-900 uppercase text-xs">{ownerProfile.role || 'owner'}</p>
                                                <p className="text-slate-500">System role</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="mt-1 text-slate-500"><MapPin size={18} /></span>
                                            <div>
                                                <p className="font-semibold text-slate-900">{ownerProfile.address || 'Not set'}</p>
                                                <p className="text-slate-500">Residential address</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-500"><Calendar size={18} /></span>
                                            <div>
                                                <p className="font-semibold text-slate-900">{ownerProfile.dateOfBirth ? new Date(ownerProfile.dateOfBirth).toLocaleDateString() : 'Not set'}</p>
                                                <p className="text-slate-500">Date of birth</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-500"><CreditCard size={18} /></span>
                                            <div>
                                                <p className="font-semibold text-slate-900">{ownerProfile.bankAccount || 'Not set'}</p>
                                                <p className="text-slate-500">Bank account info</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <p className="text-slate-500 text-sm">Owner details unavailable</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OwnerOrganization;
