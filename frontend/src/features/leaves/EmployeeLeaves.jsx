import React, { useState, useEffect } from 'react';
import api from '../../app/axiosInterceptors';
import {
  FileSpreadsheet, Send, History, Loader2, AlertCircle, Plus, Calendar, Type, FileText, CheckCircle, Clock, XCircle
} from 'lucide-react';

export default function EmployeeLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const [form, setForm] = useState({
    type: 'sick',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const fetchLeaves = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/leaves/history');
      if (response.data?.success) {
        setLeaves(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leave history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (new Date(form.startDate) > new Date(form.endDate)) {
      setError('Start date cannot be after end date.');
      return;
    }

    if (form.reason.trim().length < 5) {
      setError('Reason must be at least 5 characters long.');
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await api.post('/leaves/apply', {
        type: form.type,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        reason: form.reason.trim()
      });

      if (response.data?.success) {
        setSuccessMessage('Leave application submitted successfully!');
        setForm({
          type: 'sick',
          startDate: '',
          endDate: '',
          reason: ''
        });
        setIsApplyModalOpen(false);
        fetchLeaves();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply for leave.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="text-indigo-600" size={26} />
            My Leaves
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Apply for leave of absence and track the approval status of your submissions.
          </p>
        </div>
        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-indigo-200 transition transform active:scale-98 shrink-0"
        >
          <Plus size={18} />
          Apply for Leave
        </button>
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

      {/* Leave Summary Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pending Approvals</span>
            <h3 className="text-xl font-black text-slate-800">
              {leaves.filter(l => l.status === 'pending').length}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Approved Leaves</span>
            <h3 className="text-xl font-black text-slate-800">
              {leaves.filter(l => l.status === 'approved').length}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <XCircle size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Rejected Requests</span>
            <h3 className="text-xl font-black text-slate-800">
              {leaves.filter(l => l.status === 'rejected').length}
            </h3>
          </div>
        </div>
      </div>

      {/* History Log */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <History className="text-slate-400" size={18} />
          <h3 className="font-black text-slate-800 text-sm">Leave Requests Log</h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-2">
            <Loader2 className="animate-spin text-indigo-600" size={24} />
            <span className="text-slate-400 text-xs font-bold">Syncing history...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-xs font-bold text-rose-500">{error}</div>
        ) : leaves.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-bold text-slate-800">No Leave History</p>
            <p className="text-xs text-slate-400 font-medium">Any leave applications you submit will be listed here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-semibold text-slate-600">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-4">Leave Type</th>
                  <th className="px-6 py-4">Start Date</th>
                  <th className="px-6 py-4">End Date</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Admin Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-bold text-slate-800 capitalize">
                      {leave.type}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(leave.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 max-w-[200px] truncate text-slate-500 font-medium" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${leave.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : leave.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-medium italic">
                      {leave.remarks || '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL: APPLY FOR LEAVE --- */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl p-6 md:p-8 space-y-6 relative">
            <button
              onClick={() => setIsApplyModalOpen(false)}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition"
            >
              <XCircle size={18} />
            </button>

            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Apply for Leave</h2>
              <p className="text-slate-400 text-xs font-medium mt-1">Submit your leaves request detail for administrative approval.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Leave Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700 transition"
                >
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal Leave</option>
                  <option value="annual">Annual Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Start Date</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl outline-none focus:bg-white text-sm font-medium text-slate-700 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">End Date</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl outline-none focus:bg-white text-sm font-medium text-slate-700 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Reason for Request *</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Provide details about your leave..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700 transition resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg transition flex justify-center items-center gap-2"
                >
                  {submitLoading && <Loader2 className="animate-spin" size={16} />}
                  {submitLoading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
