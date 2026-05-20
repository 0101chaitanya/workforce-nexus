import React, { useEffect, useState } from 'react';
import api from '../../app/axiosInterceptors';
import { Loader2, Search, CalendarCheck, User, Clock } from 'lucide-react';

const OwnerAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [users, setUsers] = useState([]);
  const [targetUserId, setTargetUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/all');
      setUsers(response.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/attendance/history', {
        params: targetUserId ? { targetUserId } : {}
      });
      setAttendance(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not fetch attendance history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [targetUserId]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Attendance Management</h1>
            <p className="mt-2 text-slate-500">View company attendance history and filter by employee.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <span className="text-sm text-slate-500">Filter by employee</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <label className="block text-sm font-semibold text-slate-600">Employee filter</label>
          <select
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            className="w-full max-w-xs rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">All employees</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>{user.fullName || user.email}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
            <Loader2 className="mx-auto animate-spin text-indigo-600" size={36} />
            <p className="mt-4">Loading attendance history...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
            {error}
          </div>
        ) : attendance.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 p-10 text-center text-slate-500">
            <CalendarCheck size={32} className="mx-auto text-indigo-600" />
            <p className="mt-4">No attendance records were found for the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-4 text-left font-semibold">Employee</th>
                  <th className="px-4 py-4 text-left font-semibold">Date</th>
                  <th className="px-4 py-4 text-left font-semibold">Check-in</th>
                  <th className="px-4 py-4 text-left font-semibold">Check-out</th>
                  <th className="px-4 py-4 text-left font-semibold">Hours</th>
                  <th className="px-4 py-4 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {attendance.map((item) => (
                  <tr key={item._id}>
                    <td className="px-4 py-4 text-slate-700">
                      {item.user?.fullName || item.user?.email || 'Unknown'}
                    </td>
                    <td className="px-4 py-4 text-slate-700">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="px-4 py-4 text-slate-700">{item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString() : '-'}</td>
                    <td className="px-4 py-4 text-slate-700">{item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString() : '-'}</td>
                    <td className="px-4 py-4 text-slate-700">{item.totalHours ? `${item.totalHours}h` : '-'}</td>
                    <td className="px-4 py-4 text-slate-700">{item.status || 'N/A'}</td>
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

export default OwnerAttendance;
