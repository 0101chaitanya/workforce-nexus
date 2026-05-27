import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../app/axiosInterceptors';
import Pagination from '../../components/common/Pagination';
import { toast } from 'react-toastify';
import {
  CreditCard, Download, Loader2, FileText, Calendar, RefreshCcw
} from 'lucide-react';
import {
  setEmployeePayrolls,
  setEmployeeLoading,
  setEmployeeDownloadingId,
  setEmployeeTenureDownloading,
  setEmployeePage,
  setEmployeeLimit,
  setEmployeePaginationInfo
} from './payrollSlice';

export default function EmployeePayroll() {
  const dispatch = useDispatch();
  const {
    payrolls,
    loading,
    downloadingId,
    tenureDownloading,
    page,
    limit,
    paginationInfo,
    isCached,
    cachedParams
  } = useSelector((state) => state.payroll.employee);

  const fetchPayroll = async (force = false) => {
    if (!force && isCached && cachedParams &&
        cachedParams.page === page &&
        cachedParams.limit === limit) {
      return;
    }

    dispatch(setEmployeeLoading(true));
    try {
      const response = await api.get('/payroll/history', {
        params: { page, limit }
      });
      if (response.data?.success) {
        dispatch(setEmployeePayrolls(response.data.data || []));
        if (response.data.pagination) {
          dispatch(setEmployeePaginationInfo(response.data.pagination));
        } else {
          dispatch(setEmployeePaginationInfo({
            total: (response.data.data || []).length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false
          }));
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load payroll records.');
    } finally {
      dispatch(setEmployeeLoading(false));
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [page, limit]);

  const handleDownload = async (payrollId, filename) => {
    dispatch(setEmployeeDownloadingId(payrollId));
    try {
      const response = await api.get(`/payroll/${payrollId}/download`, {
        responseType: 'blob'
      });

      // Create a temporary link to download blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || `Payslip_${payrollId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to download payslip. Please try again.');
    } finally {
      dispatch(setEmployeeDownloadingId(null));
    }
  };

  const handleDownloadTenure = async () => {
    dispatch(setEmployeeTenureDownloading(true));
    try {
      const response = await api.get('/payroll/tenure/download', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Tenure_Payslip_${new Date().getFullYear()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to download consolidated payslip. Please try again.');
    } finally {
      dispatch(setEmployeeTenureDownloading(false));
    }
  };

  // Month mapping helper
  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  return (
    <div className="space-y-6">

      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <CreditCard className="text-indigo-600" size={26} />
            My Payroll
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track your monthly earnings, tax deductions, and download computer-generated payslips.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchPayroll(true)}
            disabled={loading}
            className="p-2.5 text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition border border-slate-200/60 active:scale-95 disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleDownloadTenure}
            disabled={tenureDownloading || payrolls.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition disabled:opacity-50 shrink-0"
          >
            {tenureDownloading ? (
              <Loader2 className="animate-spin" size={12} />
            ) : (
              <Download size={12} />
            )}
            Download Consolidated Payslip
          </button>
        </div>
      </div>

      {/* Main Payslip History Log */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <FileText className="text-slate-400" size={18} />
          <h3 className="font-black text-slate-800 text-sm">Payslip Statements</h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-2">
            <Loader2 className="animate-spin text-indigo-600" size={24} />
            <span className="text-slate-400 text-xs font-bold">Syncing records...</span>
          </div>
        ) : payrolls.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-bold text-slate-800">No Payroll Statements</p>
            <p className="text-xs text-slate-400 font-medium">Your monthly payslips will appear here once generated.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-semibold text-slate-600">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-4">Pay Period</th>
                  <th className="px-6 py-4">Gross Salary</th>
                  <th className="px-6 py-4">Leave Deductions</th>
                  <th className="px-6 py-4">Tax Deductions</th>
                  <th className="px-6 py-4">Net Payout</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payrolls.map((pay) => {
                  const filename = `Payslip_${getMonthName(pay.month)}_${pay.year}.pdf`;
                  const calculatedGross = pay.grossPay || (pay.basicPay + (pay.hra || 0) + (pay.conveyance || 0) + (pay.medical || 0) + (pay.bonus || 0));
                  const calculatedDeductions = pay.unpaidLeaveDeductions || 0;
                  return (
                    <tr key={pay._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2">
                        <Calendar size={14} className="text-indigo-500" />
                        {getMonthName(pay.month)} {pay.year}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        ₹{calculatedGross.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-rose-600 font-medium">
                        ₹{calculatedDeductions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-rose-600 font-medium">
                        ₹{pay.taxes.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-black text-slate-800">
                        ₹{pay.netPay.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-100 capitalize">
                          {pay.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDownload(pay._id, filename)}
                          disabled={downloadingId === pay._id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-bold text-xs transition disabled:opacity-50"
                        >
                          {downloadingId === pay._id ? (
                            <Loader2 className="animate-spin" size={12} />
                          ) : (
                            <Download size={12} />
                          )}
                          Payslip PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
