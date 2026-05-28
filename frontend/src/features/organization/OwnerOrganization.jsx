import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../app/axiosInterceptors';
import { Building2, MapPin, Phone, Mail, ShieldCheck, Loader2, AlertCircle, UserCircle, Edit2, Save, X, Calendar, CreditCard, Navigation, RefreshCcw } from 'lucide-react';
import { toast } from 'react-toastify';
import { validateForm } from '../../utils/validation';
import { organizationSchemas } from './organizationSchemas';
import { userSchemas } from '../profile/userSchemas';
import {
    setCompany,
    setLoading,
    setCompanySaving,
    setOwnerProfile,
    setOwnerLoading,
    setOwnerSaving
} from './organizationSlice';
 
const OwnerOrganization = () => {
    const dispatch = useDispatch();
    const { 
        company, 
        loading, 
        saving,
        ownerProfile,
        ownerLoading,
        ownerSaving,
        isCached,
        ownerProfileIsCached
    } = useSelector((state) => state.organization);
 
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ companyName: '', address: '', phone: '', latitude: '', longitude: '', proximityRadius: '' });
 
    const [isEditingOwner, setIsEditingOwner] = useState(false);
    const [ownerForm, setOwnerForm] = useState({ fullName: '', phone: '', address: '', dateOfBirth: '', bankAccount: '' });
 
    const fetchOwnerProfile = async (ownerId, force = false) => {
        if (!force && ownerProfileIsCached && ownerProfile && ownerProfile._id === ownerId) {
            setOwnerForm({
                fullName: ownerProfile.fullName || '',
                phone: ownerProfile.phone || '',
                address: ownerProfile.address || '',
                dateOfBirth: ownerProfile.dateOfBirth ? ownerProfile.dateOfBirth.split('T')[0] : '',
                bankAccount: ownerProfile.bankAccount || ''
            });
            return;
        }

        dispatch(setOwnerLoading(true));
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
            toast.error(err.response?.data?.message || 'Failed to fetch owner profile details.');
        } finally {
            dispatch(setOwnerLoading(false));
        }
    };
 
    const fetchCompany = async (force = false) => {
        if (!force && isCached && company) {
            setEditForm({
                companyName: company.companyName || '',
                address: company.address || '',
                phone: company.phone || '',
                latitude: company.latitude !== undefined && company.latitude !== null ? company.latitude : '',
                longitude: company.longitude !== undefined && company.longitude !== null ? company.longitude : '',
                proximityRadius: company.proximityRadius !== undefined && company.proximityRadius !== null ? company.proximityRadius : '200'
            });
            if (company?.owner?._id) {
                fetchOwnerProfile(company.owner._id, force);
            }
            return;
        }

        dispatch(setLoading(true));
        try {
            const response = await api.get('/company/protected');
            const companyData = response.data.data;
            dispatch(setCompany(companyData));
            setEditForm({
                companyName: companyData.companyName || '',
                address: companyData.address || '',
                phone: companyData.phone || '',
                latitude: companyData.latitude !== undefined && companyData.latitude !== null ? companyData.latitude : '',
                longitude: companyData.longitude !== undefined && companyData.longitude !== null ? companyData.longitude : '',
                proximityRadius: companyData.proximityRadius !== undefined && companyData.proximityRadius !== null ? companyData.proximityRadius : '200'
            });
 
            if (companyData?.owner?._id) {
                fetchOwnerProfile(companyData.owner._id, force);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Unable to fetch organization details.');
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
            phone: company.phone || '',
            latitude: company.latitude !== undefined && company.latitude !== null ? company.latitude : '',
            longitude: company.longitude !== undefined && company.longitude !== null ? company.longitude : '',
            proximityRadius: company.proximityRadius !== undefined && company.proximityRadius !== null ? company.proximityRadius : '200'
        });
    };
 
    const [gpsLoading, setGpsLoading] = useState(false);
    const [resolveLoading, setResolveLoading] = useState(false);
 
    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }
        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const latStr = lat.toFixed(6);
                const lonStr = lon.toFixed(6);
 
                let addressResolved = '';
                try {
                    const geoResponse = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
                        {
                            headers: {
                                "Accept-Language": "en",
                                "User-Agent": "EmployeeManagementSystem/1.0"
                            }
                        }
                    );
                    if (geoResponse.ok) {
                        const geoData = await geoResponse.json();
                        addressResolved = geoData.display_name || '';
                    }
                } catch (err) {
                    console.error("Reverse geocoding address resolution failed:", err);
                }
 
                setEditForm(prev => ({
                    ...prev,
                    latitude: latStr,
                    longitude: lonStr,
                    address: addressResolved || prev.address
                }));
                setGpsLoading(false);
            },
            (error) => {
                alert("Failed to retrieve location: " + error.message);
                setGpsLoading(false);
            },
            { enableHighAccuracy: true }
        );
    };
 
    const handleResolveLocation = async () => {
        const lat = editForm.latitude;
        const lon = editForm.longitude;
        if (lat === '' || lon === '' || lat === null || lon === null || lat === undefined || lon === undefined) {
            alert("Please enter both Office Latitude and Office Longitude to resolve the address.");
            return;
        }
        setResolveLoading(true);
        try {
            const geoResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
                {
                    headers: {
                        "Accept-Language": "en",
                        "User-Agent": "EmployeeManagementSystem/1.0"
                    }
                }
            );
            if (geoResponse.ok) {
                const geoData = await geoResponse.json();
                if (geoData.display_name) {
                    setEditForm(prev => ({
                        ...prev,
                        address: geoData.display_name
                    }));
                } else {
                    alert("Could not resolve address for the given coordinates.");
                }
            } else {
                alert("Failed to resolve address. Geocoding service error.");
            }
        } catch (err) {
            console.error("Reverse geocoding address resolution failed:", err);
            alert("An error occurred while resolving the address.");
        } finally {
            setResolveLoading(false);
        }
    };
 
    const handleSave = async (e) => {
        e.preventDefault();
        const validated = validateForm(organizationSchemas.updateCompany, editForm);
        if (!validated) return;
 
        dispatch(setCompanySaving(true));
        try {
            await api.put('/company/update', validated);
            await fetchCompany(true);
            setIsEditing(false);
            toast.success('Organization details updated successfully.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update organization details.');
        } finally {
            dispatch(setCompanySaving(false));
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
        const validated = validateForm(userSchemas.updateProfile, {
            ...ownerForm,
            dateOfBirth: ownerForm.dateOfBirth ? new Date(ownerForm.dateOfBirth).toISOString() : ""
        });
        if (!validated) return;
 
        dispatch(setOwnerSaving(true));
        try {
            await api.put('/users/profile', validated);
            if (company?.owner?._id) {
                await fetchOwnerProfile(company.owner._id, true);
            }
            setIsEditingOwner(false);
            toast.success('Owner profile updated successfully.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update owner profile details.');
        } finally {
            dispatch(setOwnerSaving(false));
        }
    };
 
    useEffect(() => {
        fetchCompany();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 
    if (loading) {
        return (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 shadow-sm text-center">
                <Loader2 className="animate-spin mx-auto text-indigo-600" size={40} />
                <p className="mt-4 text-slate-500">Loading organization information...</p>
            </div>
        );
    }
 
    if (!company) {
        return (
            <div className="bg-rose-50 rounded-3xl border border-rose-100 p-8 text-rose-700 shadow-sm">
                <div className="flex items-center gap-3 font-semibold">
                    <AlertCircle size={20} />
                    Organization data unavailable
                </div>
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
                    <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
                        <button
                            onClick={() => fetchCompany(true)}
                            disabled={loading || ownerLoading}
                            className="p-3 text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 rounded-2xl transition border border-slate-200/60 active:scale-95 disabled:opacity-50"
                            title="Refresh Data"
                        >
                            <RefreshCcw className={`w-4 h-4 ${loading || ownerLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <div className="rounded-3xl bg-indigo-50 p-4 text-indigo-700">
                            <span className="text-sm font-semibold uppercase tracking-wide">Verified Owner Access</span>
                            <p className="mt-2 text-sm text-slate-700">Only the owner can view this protected company record.</p>
                        </div>
                    </div>
                </div>
            </div>

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
                                <div className="flex flex-col sm:flex-row gap-4 items-end">
                                    <div className="flex-grow w-full">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Office Latitude</label>
                                        <input
                                            type="number"
                                            step="0.000001"
                                            value={editForm.latitude}
                                            onChange={(e) => setEditForm({ ...editForm, latitude: e.target.value })}
                                            className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                            placeholder="e.g. 37.7749"
                                        />
                                    </div>
                                    <div className="flex-grow w-full">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Office Longitude</label>
                                        <input
                                            type="number"
                                            step="0.000001"
                                            value={editForm.longitude}
                                            onChange={(e) => setEditForm({ ...editForm, longitude: e.target.value })}
                                            className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                            placeholder="e.g. -122.4194"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleResolveLocation}
                                        disabled={resolveLoading}
                                        className="w-full sm:w-auto h-11 px-4 bg-slate-50 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition border border-slate-200 flex items-center justify-center gap-2 whitespace-nowrap"
                                    >
                                        {resolveLoading ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                                        Resolve
                                    </button>
                                </div>

                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-slate-200"></div>
                                    <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold tracking-wider uppercase">OR</span>
                                    <div className="flex-grow border-t border-slate-200"></div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleGetCurrentLocation}
                                    disabled={gpsLoading}
                                    className="w-full h-11 px-4 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-100/80 transition border border-indigo-100/50 flex items-center justify-center gap-2"
                                >
                                    {gpsLoading ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                                    Set my location as company location
                                </button>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Proximity Radius (meters)</label>
                                    <input
                                        type="number"
                                        value={editForm.proximityRadius}
                                        onChange={(e) => setEditForm({ ...editForm, proximityRadius: e.target.value })}
                                        className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        placeholder="e.g. 200"
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
                                <div className="flex items-start gap-3">
                                    <span className="mt-1 text-indigo-600"><Navigation size={18} /></span>
                                    <div>
                                        {company.latitude !== undefined && company.latitude !== null && company.longitude !== undefined && company.longitude !== null ? (
                                            <>
                                                <p className="font-semibold text-slate-900">
                                                    Enabled ({company.proximityRadius || 200}m radius)
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    Coordinates: {company.latitude.toFixed(6)}, {company.longitude.toFixed(6)}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="font-semibold text-slate-500">
                                                Disabled (Not configured)
                                            </p>
                                        )}
                                        <p className="text-slate-500">Geolocation Proximity</p>
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
