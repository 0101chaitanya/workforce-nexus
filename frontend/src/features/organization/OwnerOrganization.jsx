import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../app/axiosInterceptors';
import { Building2, MapPin, Phone, Mail, ShieldCheck, Loader2, AlertCircle, UserCircle, Edit2, Save, X } from 'lucide-react';
import {
    setCompany,
    setLoading,
    setError,
    setSuccessMessage,
    setSaving
} from './organizationSlice';

const OwnerOrganization = () => {
    const dispatch = useDispatch();
    const { company, loading, error, successMessage, saving } = useSelector((state) => state.organization);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ companyName: '', address: '', phone: '' });

    const fetchCompany = async () => {
        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const response = await api.get('/company/protected');
            dispatch(setCompany(response.data.data));
            setEditForm({
                companyName: response.data.data.companyName || '',
                address: response.data.data.address || '',
                phone: response.data.data.phone || ''
            });
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

    useEffect(() => {
        fetchCompany();
    }, []);

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

                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-800 font-bold text-lg">
                        <UserCircle size={24} /> Owner
                    </div>
                    <p className="mt-4 text-slate-600">{company.owner?.fullName || 'Owner details unavailable'}</p>
                </div>
            </div>
        </div>
    );
};

export default OwnerOrganization;
