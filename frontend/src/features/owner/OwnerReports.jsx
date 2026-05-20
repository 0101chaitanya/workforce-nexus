import React, { useEffect, useState } from 'react';
import api from '../../app/axiosInterceptors';
import { Loader2, BarChart3, Calendar, FileSpreadsheet, CreditCard, Users, PieChart } from 'lucide-react';

const OwnerReports = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    employeesOnLeave: 0,
    todayAttendance: 0,
    recentPayroll: { amount: 0, month: null, year: null },
    attendanceCount: 0,
    leaveRequests: 0,
    payrollCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsRes, attRes, leaveRes, payRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/attendance/history'),
        api.get('/leaves/history'),
        api.get('/payroll/history')
      ]);

      const attendanceHistory = attRes.data?.data || [];
      const leaveHistory = leaveRes.data?.data || [];
      const payrollHistory = payRes.data?.data || [];

      setStats({
        totalEmployees: statsRes.data?.data?.totalEmployees || 0,
        employeesOnLeave: statsRes.data?.data?.employeesOnLeave || 0,
        todayAttendance: statsRes.data?.data?.todayAttendance || 0,
        recentPayroll: statsRes.data?.data?.recentPayroll || { amount: 0, month: null, year: null },
        attendanceCount: attendanceHistory.length,
        leaveRequests: leaveHistory.length,
        payrollCount: payrollHistory.length
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load owner reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <Loader2 className="mx-auto animate-spin text-indigo-600" size={40} />
        <p className="mt-4 text-slate-500">Loading owner analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Owner Reports</h1>
            <p className="mt-2 text-slate-500">Get company-wide performance metrics for attendance, leaves, payroll and staffing.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <PieChart size={20} /> Company analytics
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs uppercase tracking-wide font-semibold">Employees</span>
            <Users size={24} className="text-indigo-600" />
          </div>
          <p className="mt-6 text-4xl font-black text-slate-900">{stats.totalEmployees}</p>
          <p className="mt-2 text-sm text-slate-500">Total active employees in the company.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs uppercase tracking-wide font-semibold">Attendance Today</span>
            <Calendar size={24} className="text-emerald-600" />
          </div>
          <p className="mt-6 text-4xl font-black text-slate-900">{stats.todayAttendance}</p>
          <p className="mt-2 text-sm text-slate-500">Employees clocked in today.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs uppercase tracking-wide font-semibold">On Leave</span>
            <FileSpreadsheet size={24} className="text-amber-600" />
          </div>
          <p className="mt-6 text-4xl font-black text-slate-900">{stats.employeesOnLeave}</p>
          <p className="mt-2 text-sm text-slate-500">Employees currently on approved leave.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs uppercase tracking-wide font-semibold">Report</span>
            <BarChart3 size={24} className="text-indigo-600" />
          </div>
          <p className="mt-6 text-4xl font-black text-slate-900">{stats.attendanceCount}</p>
          <p className="mt-2 text-sm text-slate-500">Attendance records analyzed.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs uppercase tracking-wide font-semibold">Leave Requests</span>
            <FileSpreadsheet size={24} className="text-purple-600" />
          </div>
          <p className="mt-6 text-4xl font-black text-slate-900">{stats.leaveRequests}</p>
          <p className="mt-2 text-sm text-slate-500">Leave requests in system.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs uppercase tracking-wide font-semibold">Payroll Entries</span>
            <CreditCard size={24} className="text-slate-600" />
          </div>
          <p className="mt-6 text-4xl font-black text-slate-900">{stats.payrollCount}</p>
          <p className="mt-2 text-sm text-slate-500">Payroll records generated so far.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">Recent payroll cycle</p>
            <p className="mt-2 text-xl font-black text-slate-900">Rs. {stats.recentPayroll.amount?.toLocaleString() || 0}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-4 py-3 text-slate-600">
            {stats.recentPayroll.month ? `${stats.recentPayroll.month}/${stats.recentPayroll.year}` : 'No payroll generated'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerReports;
