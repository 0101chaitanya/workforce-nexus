import React from 'react';

const OwnerFeature = ({ title, description }) => {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-black text-slate-900">{title}</h1>
        <p className="mt-3 text-slate-600 text-sm leading-7">
          {description || `Welcome to the ${title} workspace. This owner-only section is wired into the router and ready for feature expansion.`}
        </p>
      </div>
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-700">
        <p className="text-sm font-medium">Owner access only</p>
        <p className="mt-2 text-sm text-slate-500">
          Browse this page when you want to manage your organization, review attendance, approve leaves, generate payroll, or view company reports.
        </p>
      </div>
    </div>
  );
};

export default OwnerFeature;
