import React, { useEffect, useState } from 'react';
import api from '../../app/axiosInterceptors';
import Pagination from '../../components/common/Pagination';
import { Loader2, User, FileSpreadsheet, CheckCircle2, XCircle, RefreshCcw, MessageSquare, Search, X } from 'lucide-react';

const OwnerLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [targetUserId, setTargetUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState(null);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [remarks, setRemarks] = useState('');

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUserObj, setSelectedUserObj] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/leaves/history', {
        params: {
          ...(targetUserId ? { targetUserId } : {}),
          page,
          limit
        }
      });
      setLeaves(response.data.data || []);
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
      setError(err.response?.data?.message || 'Unable to load leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
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

  const updateLeave = async (leaveId, status) => {
    setSelectedLeave(leaveId);
    setActionType(status);
    setRemarks('');
    setIsModalOpen(true);
  };

  const handleConfirmAction = async () => {
    setActionPending(selectedLeave);
    try {
      await api.put(`/leaves/${selectedLeave}/status`, { status: actionType, remarks });
      await fetchLeaves();
      setIsModalOpen(false);
      setSelectedLeave(null);
      setActionType(null);
      setRemarks('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update leave status.');
    } finally {
      setActionPending(null);
    }
  };

  const handleCancelAction = () => {
    setIsModalOpen(false);
    setSelectedLeave(null);
    setActionType(null);
    setRemarks('');
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
          {/* Lookup Search Box */}
          <div className="relative w-full max-w-md">
            <label className="block text-sm font-semibold text-slate-600 mb-2">Filter by employee</label>
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Type name, email, or employee ID to filter..."
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
          {error && <p className="text-sm text-rose-600 self-end mb-2">{error}</p>}
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
                  <th className="px-4 py-4 text-left font-semibold">Employee ID</th>
                  <th className="px-4 py-4 text-left font-semibold">Employee</th>
                  <th className="px-4 py-4 text-left font-semibold">Type</th>
                  <th className="px-4 py-4 text-left font-semibold">Dates</th>
                  <th className="px-4 py-4 text-left font-semibold">Reason</th>
                  <th className="px-4 py-4 text-left font-semibold">Status</th>
                  <th className="px-4 py-4 text-left font-semibold">Remarks</th>
                  <th className="px-4 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td className="px-4 py-4 text-slate-700 font-mono text-xs">
                      {leave.user?.identity ? (
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-bold">
                          {leave.user.identity}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {leave.user?.fullName || leave.user?.email || 'Unknown employee'}
                    </td>
                    <td className="px-4 py-4 text-slate-700 capitalize">{leave.type}</td>
                    <td className="px-4 py-4 text-slate-700">{new Date(leave.startDate).toLocaleDateString() || '--'} – {new Date(leave.endDate).toLocaleDateString() || '--'}</td>
                    <td className="px-4 py-4 text-slate-500 font-medium max-w-[200px] truncate" title={leave.reason}>
                      {leave.reason || '-'}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${leave.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : leave.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {leave.remarks ? (
                        <div className="flex items-start gap-2">
                          <MessageSquare size={14} className="mt-0.5 text-slate-400 shrink-0" />
                          <span className="text-slate-600">{leave.remarks}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
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
      </div>

      {/* Modal for approve/reject with remarks */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 md:p-8">
            <h2 className="text-2xl font-black text-slate-800 mb-6">
              {actionType === 'approved' ? 'Approve Leave' : 'Reject Leave'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Reason / Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Provide a reason for this action..."
                  className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none"
                  rows={4}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCancelAction}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={actionPending === selectedLeave}
                  className={`flex-1 py-3 text-white font-bold text-sm rounded-xl transition ${
                    actionType === 'approved'
                      ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400'
                      : 'bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400'
                  }`}
                >
                  {actionPending === selectedLeave ? 'Processing...' : actionType === 'approved' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerLeaves;
