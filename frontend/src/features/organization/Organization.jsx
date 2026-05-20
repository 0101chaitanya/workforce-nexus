import React, { useEffect, useState } from 'react';
import api from '../../app/axiosInterceptors';
import { Building2, MapPin, Phone, Mail, ShieldCheck, Loader2, AlertCircle, UserCircle } from 'lucide-react';

const Organization = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompany = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/company/protected');
      setCompany(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to fetch organization details.');
    } finally {
      setLoading(false);
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-3 text-slate-800 font-bold text-lg">
            <Building2 size={24} /> Company Information
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
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-3 text-slate-800 font-bold text-lg">
            <UserCircle size={24} /> Owner & Account
          </div>
          <div className="space-y-3 text-slate-600 text-sm">
            <p className="font-semibold text-slate-900">{company.owner?.fullName || 'Owner details unavailable'}</p>
            <p className="text-slate-500">Owner name</p>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">Account Status</p>
              <p className="mt-2 text-slate-700">{company.isVerified ? 'Verified' : 'Unverified'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Organization;
