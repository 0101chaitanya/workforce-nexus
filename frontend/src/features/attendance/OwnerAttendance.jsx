import React, { useEffect, useState } from 'react';
import api from '../../app/axiosInterceptors';
import Pagination from '../../components/common/Pagination';
import { Loader2, CalendarCheck, Search, X } from 'lucide-react';

const OwnerAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [targetUserId, setTargetUserId] = useState('');
  const [selectedUserObj, setSelectedUserObj] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/attendance/history', {
        params: {
          ...(targetUserId ? { targetUserId } : {}),
          page,
          limit
        }
      });
      setAttendance(response.data.data || []);
      if (response.data.pagination) {
        setPaginationInfo(response.data.pagination);
      } else {
        setPaginationInfo({
          total: (response.data.data || []).length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not fetch attendance history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [targetUserId, page, limit]);

  // Search user autocomplete effect
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    // Skip search query if it exactly matches the currently selected user
    if (selectedUserObj && (
      searchQuery === selectedUserObj.fullName ||
      searchQuery === selectedUserObj.email ||
      searchQuery === selectedUserObj.identity
    )) {
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await api.get('/users/all', {
          params: { query: searchQuery }
        });
        setSearchResults(response.data.data || []);
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedUserObj]);

  const handleSelectUser = (user) => {
    setTargetUserId(user._id);
    setSelectedUserObj(user);
    setSearchQuery(user.identity || user.fullName || user.email);
    setShowDropdown(false);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setTargetUserId('');
    setSelectedUserObj(null);
    setSearchResults([]);
    setShowDropdown(false);
    setPage(1);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (val === '') {
      handleClearSearch();
    } else {
      if (selectedUserObj &&
          val !== selectedUserObj.fullName &&
          val !== selectedUserObj.email &&
          val !== selectedUserObj.identity) {
        setTargetUserId('');
        setSelectedUserObj(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Attendance Management</h1>
            <p className="mt-2 text-slate-500">View company attendance history and look up employee records.</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        {/* Lookup Search Box */}
        <div className="relative mb-6 w-full max-w-md">
          <label className="block text-sm font-semibold text-slate-600 mb-2">Look Up Employee</label>
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Type name, email, or employee ID to look up..."
              className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-4 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2 space-y-1">
                {searchResults.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition font-medium"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">{user.fullName}</span>
                      {user.identity && (
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                          {user.identity}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">{user.email} • {user.position || 'Employee'}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showDropdown && searchResults.length === 0 && !searchLoading && searchQuery.trim().length >= 2 && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg p-4 text-center text-sm text-slate-500">
              No matching employees found
            </div>
          )}
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
            <p className="mt-4">No attendance records were found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-4 text-left font-semibold">Employee ID</th>
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
                      <td className="px-4 py-4 text-slate-700 font-mono text-xs">
                        {item.user?.identity ? (
                          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-bold">
                            {item.user.identity}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
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

            {/* Pagination Controls */}
            <Pagination
              page={page}
              limit={limit}
              total={paginationInfo.total}
              totalPages={paginationInfo.totalPages}
              hasNext={paginationInfo.hasNext}
              hasPrev={paginationInfo.hasPrev}
              onPageChange={setPage}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default OwnerAttendance;
