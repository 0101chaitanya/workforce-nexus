import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../app/axiosInterceptors';
import { setOwnerStats, setOwnerLoading } from './dashboardSlice';
import { toast } from 'react-toastify';
import {
  BarChart3, Loader2, Calendar, FileText, Clock, PieChart, Users, RefreshCcw
} from 'lucide-react';

export default function OwnerDashboard() {
  const dispatch = useDispatch();
  const { stats: reduxStats, loading, isCached } = useSelector((state) => state.dashboard.owner);
  
  const stats = {
    totalEmployees: 0,
    todayAttendance: 0,
    employeesOnLeave: 0,
    recentPayrollAmount: 0,
    recentPayrollMonth: '',
    recentPayrollYear: '',
    ...reduxStats
  };

  const fetchStats = async (force = false) => {
    if (!force && isCached) {
      return;
    }
    dispatch(setOwnerLoading(true));
    try {
      const res = await api.get('/dashboard/stats');
      const data = res.data?.data || {};
      dispatch(setOwnerStats({
        totalEmployees: data.totalEmployees || 0,
        todayAttendance: data.todayAttendance || 0,
        employeesOnLeave: data.employeesOnLeave || 0,
        recentPayrollAmount: data.recentPayroll?.amount || 0,
        recentPayrollMonth: data.recentPayroll?.month || '',
        recentPayrollYear: data.recentPayroll?.year || ''
      }));
    } catch {
      toast.error('Some report components could not be fully aggregated.');
    } finally {
      dispatch(setOwnerLoading(false));
    }
  };

  useEffect(() => {
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-3 bg-white rounded-2xl border">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
        <span className="text-slate-400 text-sm font-bold tracking-wide">Assembling organizational statistics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <BarChart3 className="text-indigo-600" size={26} />
            Owner Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Analyze aggregated insights about organizational operations, attendance, and payroll.
          </p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Employees</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800">{stats.totalEmployees}</h3>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Active employees in company.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Active Shifts Today</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Clock size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800">{stats.todayAttendance}</h3>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Employees clocked in today.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Absences Today</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Calendar size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800">{stats.employeesOnLeave}</h3>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Employees on approved leave.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Last Payroll Disbursed</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800">${stats.recentPayrollAmount}</h3>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">{stats.recentPayrollMonth} {stats.recentPayrollYear}</p>
          </div>
        </div>
      </div>

      {/* Visual report layout */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-black text-slate-800 text-sm tracking-wide uppercase flex items-center gap-2">
          <PieChart size={16} className="text-indigo-600" />
          Company Overview
        </h3>
        <p className="text-xs text-slate-400 font-medium">
          Summary of organizational statistics and metrics. Review the tabs for more granular data.
        </p>
      </div>
    </div>
  );
}
