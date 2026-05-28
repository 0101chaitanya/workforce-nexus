import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../app/axiosInterceptors';
import Pagination from '../../components/common/Pagination';
import { toast } from 'react-toastify';
import { Loader2, CreditCard, Download, ArrowUpRight, Search, X, RefreshCcw } from 'lucide-react';
import {
  setOwnerPayrolls,
  setOwnerTargetUserId,
  setOwnerLoading,
  setOwnerGenerating,
  setOwnerDownloadLoading,
  setOwnerTenureDownloading,
  setOwnerRowTenureDownloading,
  setOwnerPage,
  setOwnerLimit,
  setOwnerPaginationInfo,
  setOwnerSearchQuery,
  setOwnerSearchResults,
  setOwnerSelectedUserObj,
  setOwnerShowDropdown,
  setOwnerSearchLoading
} from './payrollSlice';
 
const OwnerPayroll = () => {
  const dispatch = useDispatch();
  const {
    payrolls,
    targetUserId,
    loading,
    generating,
    downloadLoading,
    tenureDownloading,
    rowTenureDownloading,
    page,
    limit,
    paginationInfo,
    searchQuery,
    searchResults,
    selectedUserObj,
    showDropdown,
    searchLoading,
    isCached,
    cachedParams
  } = useSelector((state) => state.payroll.owner);
 
  const fetchPayrolls = async (force = false) => {
    if (!force && isCached && cachedParams &&
        cachedParams.page === page &&
        cachedParams.limit === limit &&
        cachedParams.targetUserId === targetUserId) {
      return;
    }

    dispatch(setOwnerLoading(true));
    try {
      const response = await api.get('/payroll/history', {
        params: {
          ...(targetUserId ? { targetUserId } : {}),
          page,
          limit
        }
      });
      dispatch(setOwnerPayrolls(response.data.data || []));
      if (response.data.pagination) {
        dispatch(setOwnerPaginationInfo(response.data.pagination));
      } else {
        dispatch(setOwnerPaginationInfo({
          total: (response.data.data || []).length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }));
      }
    } catch (err) { // eslint-disable-line no-unused-vars {
      toast.error(err.response?.data?.message || 'Unable to fetch payroll history.');
    } finally {
      dispatch(setOwnerLoading(false));
    }
  };
 
  useEffect(() => {
    fetchPayrolls();
  }, [targetUserId, page, limit]);
 
  // Search user autocomplete effect
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      dispatch(setOwnerSearchResults([]));
      dispatch(setOwnerShowDropdown(false));
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
      dispatch(setOwnerSearchLoading(true));
      try {
        const response = await api.get('/users/search-users-or-get-all', {
          params: { query: searchQuery, includeInactive: 'true' }
        });
        dispatch(setOwnerSearchResults(response.data.data || []));
        dispatch(setOwnerShowDropdown(true));
      } catch (err) { // eslint-disable-line no-unused-vars {
        console.error(err);
      } finally {
        dispatch(setOwnerSearchLoading(false));
      }
    }, 300);
 
    return () => clearTimeout(timer);
  }, [searchQuery, selectedUserObj]);
 
  const handleSelectUser = (user) => {
    dispatch(setOwnerTargetUserId(user._id));
    dispatch(setOwnerSelectedUserObj(user));
    dispatch(setOwnerSearchQuery(user.identity || user.fullName || user.email));
    dispatch(setOwnerShowDropdown(false));
    dispatch(setOwnerPage(1));
  };
 
  const handleClearSearch = () => {
    dispatch(setOwnerSearchQuery(''));
    dispatch(setOwnerTargetUserId(''));
    dispatch(setOwnerSelectedUserObj(null));
    dispatch(setOwnerSearchResults([]));
    dispatch(setOwnerShowDropdown(false));
    dispatch(setOwnerPage(1));
  };
 
  const handleSearchChange = (val) => {
    dispatch(setOwnerSearchQuery(val));
    if (val === '') {
      handleClearSearch();
    } else {
      if (selectedUserObj &&
          val !== selectedUserObj.fullName &&
          val !== selectedUserObj.email &&
          val !== selectedUserObj.identity) {
        dispatch(setOwnerTargetUserId(''));
        dispatch(setOwnerSelectedUserObj(null));
      }
    }
  };
 
  const handleGeneratePayroll = async () => {
    dispatch(setOwnerGenerating(true));
    try {
      const response = await api.post('/payroll/generate');
      toast.success(response.data.message || 'Payroll generated successfully.');
      if (page === 1) {
        fetchPayrolls(true);
      } else {
        dispatch(setOwnerPage(1));
      }
    } catch () {
      toast.error(err.response?.data?.message || 'Payroll generation failed.');
    } finally {
      dispatch(setOwnerGenerating(false));
    }
  };
 
  const handleDownload = async (id) => {
    dispatch(setOwnerDownloadLoading(id));
    try {
      const response = await api.get(`/payroll/${id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch () {
      toast.error(err.response?.data?.message || 'Could not download payslip.');
    } finally {
      dispatch(setOwnerDownloadLoading(''));
    }
  };
 
  const handleDownloadTenure = async () => {
    if (!targetUserId) return;
    dispatch(setOwnerTenureDownloading(true));
    try {
      const response = await api.get('/payroll/tenure/download', {
        params: { targetUserId },
        responseType: 'blob'
      });
      const name = selectedUserObj?.fullName?.replace(/\s+/g, '_') || 'Employee';
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Tenure_Payslip_${name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch () {
      toast.error('Could not download consolidated payslip.');
    } finally {
      dispatch(setOwnerTenureDownloading(false));
    }
  };
 
  const handleDownloadRowTenure = async (userId, fullName) => {
    if (!userId) return;
    dispatch(setOwnerRowTenureDownloading(userId));
    try {
      const response = await api.get('/payroll/tenure/download', {
        params: { targetUserId: userId },
        responseType: 'blob'
      });
      const name = fullName?.replace(/\s+/g, '_') || 'Employee';
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Tenure_Payslip_${name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch () {
      toast.error('Could not download consolidated payslip.');
    } finally {
      dispatch(setOwnerRowTenureDownloading(''));
    }
  };
 
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Payroll Administration</h1>
            <p className="mt-2 text-slate-500">Generate company payroll, review payouts, and download payslips for employees.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchPayrolls(true)}
              disabled={loading}
              className="p-3 text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 rounded-2xl transition border border-slate-200/60 active:scale-95 disabled:opacity-50 shrink-0"
              title="Refresh Data"
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleGeneratePayroll}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300 shrink-0 text-sm font-semibold"
            >
              <ArrowUpRight size={18} />
              {generating ? 'Generating...' : 'Generate Payroll'}
            </button>
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
          <div className="flex flex-wrap items-center gap-4 self-end sm:self-auto">
            {targetUserId && (
              <button
                type="button"
                onClick={handleDownloadTenure}
                disabled={tenureDownloading || payrolls.length === 0}
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-white transition hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-sm font-semibold animate-fade-in"
              >
                {tenureDownloading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Download size={16} />
                )}
                Tenure Payslip
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
            <Loader2 className="mx-auto animate-spin text-indigo-600" size={36} />
            <p className="mt-4">Loading payroll history...</p>
          </div>
        ) : payrolls.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 p-10 text-center text-slate-500">
            <CreditCard size={32} className="mx-auto text-indigo-600" />
            <p className="mt-4">No payroll records were found for this selection.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-4 text-left font-semibold">Employee ID</th>
                  <th className="px-4 py-4 text-left font-semibold">Employee</th>
                  <th className="px-4 py-4 text-left font-semibold">Period</th>
                  <th className="px-4 py-4 text-left font-semibold">Gross Pay</th>
                  <th className="px-4 py-4 text-left font-semibold">Deductions</th>
                  <th className="px-4 py-4 text-left font-semibold">Net Pay</th>
                  <th className="px-4 py-4 text-left font-semibold">Status</th>
                  <th className="px-4 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {payrolls.map((row) => {
                  const calculatedGross = row.grossPay || (row.basicPay + (row.hra || 0) + (row.conveyance || 0) + (row.medical || 0) + (row.bonus || 0));
                  const calculatedDeductions = row.unpaidLeaveDeductions || 0;
                  return (
                    <tr key={row._id}>
                      <td className="px-4 py-4 text-slate-700 font-mono text-xs">
                        {row.user?.identity ? (
                          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-bold">
                            {row.user.identity}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-4 text-slate-700">{row.user?.fullName || row.user?.email || 'Unknown'}</td>
                      <td className="px-4 py-4 text-slate-700">{row.month}/{row.year}</td>
                      <td className="px-4 py-4 text-slate-700">Rs. {calculatedGross.toFixed(2)}</td>
                      <td className="px-4 py-4 text-rose-600 font-medium">Rs. {calculatedDeductions.toFixed(2)}</td>
                      <td className="px-4 py-4 text-slate-700 font-semibold">Rs. {row.netPay?.toFixed(2)}</td>
                      <td className="px-4 py-4 text-slate-700 capitalize">{row.status}</td>
                      <td className="px-4 py-4 flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(row._id)}
                          disabled={downloadLoading === row._id}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-white transition hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-xs font-semibold"
                        >
                          <Download size={14} />
                          {downloadLoading === row._id ? 'Monthly...' : 'Monthly Payslip'}
                        </button>
                        <button
                          onClick={() => handleDownloadRowTenure(row.user?._id, row.user?.fullName)}
                          disabled={rowTenureDownloading === row.user?._id}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-600 hover:bg-slate-700 text-white transition disabled:bg-slate-300 disabled:cursor-not-allowed text-xs font-semibold px-3 py-1.5"
                        >
                          {rowTenureDownloading === row.user?._id ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            <Download size={14} />
                          )}
                          Tenure Payslip
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
          onPageChange={(p) => dispatch(setOwnerPage(p))}
          onLimitChange={(newLimit) => {
            dispatch(setOwnerLimit(newLimit));
            dispatch(setOwnerPage(1));
          }}
        />
      </div>
    </div>
  );
};

export default OwnerPayroll;
