import React, { useState, useEffect } from 'react';
import api from '../../app/axiosInterceptors';
import Pagination from '../../components/common/Pagination';
import {
  CreditCard, Download, Loader2, AlertCircle, FileText, Calendar, DollarSign
} from 'lucide-react';

export default function EmployeePayroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [tenureDownloading, setTenureDownloading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });

  const fetchPayroll = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/payroll/history', {
        params: { page, limit }
      });
      if (response.data?.success) {
        setPayrolls(response.data.data || []);
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
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payroll records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [page, limit]);

  const handleDownload = async (payrollId, filename) => {
    setDownloadingId(payrollId);
    setError(null);
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
      setError('Failed to download payslip. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadTenure = async () => {
    setTenureDownloading(true);
    setError(null);
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
      setError('Failed to download consolidated payslip. Please try again.');
    } finally {
      setTenureDownloading(false);
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
        <button
          onClick={handleDownloadTenure}
          disabled={tenureDownloading || payrolls.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition disabled:opacity-50"
        >
          {tenureDownloading ? (
            <Loader2 className="animate-spin" size={12} />
          ) : (
            <Download size={12} />
          )}
          Download Tenure Payslip
        </button>
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
        ) : error ? (
          <div className="p-6 text-center text-xs font-bold text-rose-500">{error}</div>
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
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </div>
      </div>

    </div>
  );
}
