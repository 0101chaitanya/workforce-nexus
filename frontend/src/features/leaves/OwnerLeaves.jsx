import React, { useEffect, useState } from 'react';
import api from '../../app/axiosInterceptors';
import { Loader2, User, FileSpreadsheet, CheckCircle2, XCircle, RefreshCcw } from 'lucide-react';

const OwnerLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [users, setUsers] = useState([]);
  const [targetUserId, setTargetUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState(null);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/all');
      setUsers(response.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeaves = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/leaves/history', {
        params: targetUserId ? { targetUserId } : {}
      });
      setLeaves(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [targetUserId]);

  const updateLeave = async (leaveId, status) => {
    setActionPending(leaveId);
    try {
      await api.put(`/leaves/${leaveId}/status`, { status });
      await fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update leave status.');
    } finally {
      setActionPending(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Leave Approval</h1>
            <p className="mt-2 text-slate-500">Review leave requests and approve or reject them for your team.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <RefreshCcw size={18} /> Company leave management
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-600">Filter by employee</label>
            <select
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="mt-2 w-full max-w-xs rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">All employees</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>{user.fullName || user.email}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>

        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
            <Loader2 className="mx-auto animate-spin text-indigo-600" size={36} />
            <p className="mt-4">Loading leave requests...</p>
          </div>
        ) : leaves.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 p-10 text-center text-slate-500">
            <FileSpreadsheet size={32} className="mx-auto text-indigo-600" />
            <p className="mt-4">No leave requests match the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-4 text-left font-semibold">Employee</th>
                  <th className="px-4 py-4 text-left font-semibold">Type</th>
                  <th className="px-4 py-4 text-left font-semibold">Dates</th>
                  <th className="px-4 py-4 text-left font-semibold">Status</th>
                  <th className="px-4 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td className="px-4 py-4 text-slate-700">
                      {leave.user?.fullName || leave.user?.email || 'Unknown employee'}
                    </td>
                    <td className="px-4 py-4 text-slate-700 capitalize">{leave.type}</td>
                    <td className="px-4 py-4 text-slate-700">{new Date(leave.startDate).toLocaleDateString()} – {new Date(leave.endDate).toLocaleDateString()}</td>
                    <td className="px-4 py-4 text-slate-700">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${leave.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : leave.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {leave.status === 'pending' ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => updateLeave(leave._id, 'approved')}
                            disabled={actionPending === leave._id}
                            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-3 py-2 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                          >
                            <CheckCircle2 size={16} /> Approve
                          </button>
                          <button
                            onClick={() => updateLeave(leave._id, 'rejected')}
                            disabled={actionPending === leave._id}
                            className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-3 py-2 text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
                          >
                            <XCircle size={16} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500">No action needed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerLeaves;
