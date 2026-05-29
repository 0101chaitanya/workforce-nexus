import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../app/axiosInterceptors';
import Pagination from '../../components/common/Pagination';
import { toast } from 'react-toastify';
import {
  CalendarCheck, Clock, Loader2,
  History, Play, Square, CheckCircle, Coffee, RefreshCcw
} from 'lucide-react';
import {
  setEmployeeHistory,
  setEmployeeLoading,
  setEmployeeActionLoading,
  setEmployeeTodayRecord,
  setEmployeePage,
  setEmployeeLimit,
  setEmployeePaginationInfo
} from './attendanceSlice';

const formatHours = (storedMinutes) => {
  if (storedMinutes === undefined || storedMinutes === null) return '--';
  const h = Math.floor(storedMinutes / 60);
  const m = Math.round(storedMinutes % 60);
  return `${h}:${m.toString().padStart(2, '0')}`;
};

export default function EmployeeAttendance() {
  const dispatch = useDispatch();
  const {
    history,
    loading,
    actionLoading,
    todayRecord,
    page,
    limit,
    paginationInfo,
    isCached,
    cachedParams
  } = useSelector((state) => state.attendance.employee);
 
  const fetchAttendance = useCallback(async (force = false) => {
    if (!force && isCached && cachedParams &&
        cachedParams.page === page &&
        cachedParams.limit === limit) {
      return;
    }

    dispatch(setEmployeeLoading(true));
    try {
      const response = await api.get('/attendance/history', {
        params: { page, limit }
      });
      if (response.data?.success) {
        const data = response.data.data || [];
        dispatch(setEmployeeHistory(data));
 
        if (response.data.pagination) {
          dispatch(setEmployeePaginationInfo(response.data.pagination));
        } else {
          dispatch(setEmployeePaginationInfo({
            total: data.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false
          }));
        }
 
        // Only check today's record from page 1 data
        if (page === 1) {
          const todayStr = new Date().toDateString();
          const todayRec = data.find(rec => new Date(rec.date).toDateString() === todayStr);
          dispatch(setEmployeeTodayRecord(todayRec || null));
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load attendance history.');
    } finally {
      dispatch(setEmployeeLoading(false));
    }
  }, [page, limit, dispatch, isCached, cachedParams]);
 
  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);
 
  const handleClockIn = async () => {
    dispatch(setEmployeeActionLoading(true));
 
    const performClockIn = async (coords = null) => {
      try {
        const payload = coords ? { latitude: coords.latitude, longitude: coords.longitude } : {};
        const response = await api.post('/attendance/clock-in', payload);
        if (response.data?.success) {
          toast.success('Clocked in successfully! Have a great day at work.');
          if (page === 1) {
            await fetchAttendance(true);
          } else {
            dispatch(setEmployeePage(1));
          }
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Clock-in failed.');
      } finally {
        dispatch(setEmployeeActionLoading(false));
      }
    };
 
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          performClockIn({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => {
          // If browser location fails, still call performClockIn without coords.
          // The backend will check if proximity coordinates are configured, and if they are, it will fail gracefully and prompt the user.
          performClockIn(null);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      performClockIn(null);
    }
  };
 
  const handleClockOut = async () => {
    dispatch(setEmployeeActionLoading(true));

    const performClockOut = async (coords = null) => {
      try {
        const payload = coords ? { latitude: coords.latitude, longitude: coords.longitude } : {};
        const response = await api.put('/attendance/clock-out', payload);
        if (response.data?.success) {
          toast.success('Clocked out successfully! Thank you for your work.');
          if (page === 1) {
            fetchAttendance(true);
          } else {
            dispatch(setEmployeePage(1));
          }
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Clock-out failed.');
      } finally {
        dispatch(setEmployeeActionLoading(false));
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          performClockOut({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => {
          performClockOut(null);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      performClockOut(null);
    }
  };
 
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <CalendarCheck className="text-indigo-600" size={26} />
            My Attendance
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Clock in/out to log your daily shifts and monitor compliance.
          </p>
        </div>
        <button
          onClick={() => fetchAttendance(true)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Clock Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Actions panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase flex items-center gap-2">
              <Clock size={16} className="text-indigo-600" />
              Daily Shift Status
            </h3>
            <p className="text-xs text-slate-400 mt-1">Ensure you clock-in at the start of your shift and clock-out when finishing.</p>
          </div>

          <div className="flex flex-col items-center justify-center py-6 space-y-3">
            {todayRecord ? (
              todayRecord.checkOutTime ? (
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
                    <CheckCircle size={28} />
                  </div>
                  <h4 className="text-base font-black text-slate-800">Shift Completed</h4>
                  <p className="text-xs text-slate-500 font-medium">You have clocked out for today. Total hours logged: <span className="font-extrabold text-indigo-600">{todayRecord.totalHours !== undefined ? formatHours(todayRecord.totalHours) : '0:00'} hrs</span></p>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mx-auto animate-pulse">
                    <Coffee size={28} />
                  </div>
                  <h4 className="text-base font-black text-slate-800">Shift Active</h4>
                  <p className="text-xs text-slate-500 font-medium">Clocked in at <span className="font-bold text-slate-700">{new Date(todayRecord.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></p>
                </div>
              )
            ) : (
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
                  <Clock size={28} />
                </div>
                <h4 className="text-base font-black text-slate-800">Not Clocked In</h4>
                <p className="text-xs text-slate-500 font-medium">Log your attendance for today's shifts below.</p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            {!todayRecord ? (
              <button
                onClick={handleClockIn}
                disabled={actionLoading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-indigo-200 transition-all duration-200 flex justify-center items-center gap-2 transform active:scale-98 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
                Clock In
              </button>
            ) : !todayRecord.checkOutTime ? (
              <button
                onClick={handleClockOut}
                disabled={actionLoading}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-rose-200 transition-all duration-200 flex justify-center items-center gap-2 transform active:scale-98 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <Square size={14} />}
                Clock Out
              </button>
            ) : (
              <button
                disabled
                className="w-full py-3.5 bg-slate-100 text-slate-400 rounded-xl font-bold text-sm border cursor-not-allowed flex justify-center items-center gap-2"
              >
                <CheckCircle size={16} />
                Today's Shift Logged
              </button>
            )}
          </div>
        </div>

        {/* Info panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase">Today's Details</h3>
            <div className="space-y-3.5 text-xs text-slate-600 font-semibold">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-400">Date:</span>
                <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-400">Status:</span>
                <span className="capitalize">{todayRecord?.status || 'Not registered'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-400">Check In Time:</span>
                <span>{todayRecord?.checkInTime ? new Date(todayRecord.checkInTime).toLocaleTimeString() : '--:--'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-400">Check Out Time:</span>
                <span>{todayRecord?.checkOutTime ? new Date(todayRecord.checkOutTime).toLocaleTimeString() : '--:--'}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-indigo-50/50 border border-indigo-100/50 rounded-xl text-[11px] text-slate-500 leading-relaxed font-medium">
            Note: All check-ins and check-outs are tracked securely with timestamps. Please make sure to check out at the end of your shift to record working hours accurately.
          </div>
        </div>
      </div>

      {/* History Log */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <History className="text-slate-400" size={18} />
          <h3 className="font-black text-slate-800 text-sm">Attendance History Log</h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-2">
            <Loader2 className="animate-spin text-indigo-600" size={24} />
            <span className="text-slate-400 text-xs font-bold">Syncing history...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-bold text-slate-800">No History Records</p>
            <p className="text-xs text-slate-400 font-medium">Your clock-in histories will be listed here once recorded.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-semibold text-slate-600">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Check In</th>
                  <th className="px-6 py-4">Check Out</th>
                  <th className="px-6 py-4">Total Hours</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {new Date(record.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {record.totalHours !== undefined ? `${formatHours(record.totalHours)} hrs` : '--'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${record.status === 'present'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : record.status === 'half-day'
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : record.status === 'leave'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                              : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-6 pb-6">
          <Pagination
            page={page}
            limit={limit}
            total={paginationInfo.total}
            totalPages={paginationInfo.totalPages}
            hasNext={paginationInfo.hasNext}
            hasPrev={paginationInfo.hasPrev}
            onPageChange={(p) => dispatch(setEmployeePage(p))}
            onLimitChange={(newLimit) => {
              dispatch(setEmployeeLimit(newLimit));
              dispatch(setEmployeePage(1));
            }}
          />
        </div>
      </div>
    </div>
  );
}
