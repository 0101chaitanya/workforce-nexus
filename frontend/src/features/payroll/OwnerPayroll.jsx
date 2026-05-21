import React, { useEffect, useState } from 'react';
import api from '../../app/axiosInterceptors';
import Pagination from '../../components/common/Pagination';
import { Loader2, CreditCard, Download, Users, ArrowUpRight, AlertTriangle } from 'lucide-react';

const OwnerPayroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [users, setUsers] = useState([]);
  const [targetUserId, setTargetUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/all');
      setUsers(response.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPayrolls = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await api.get('/payroll/history', {
        params: {
          ...(targetUserId ? { targetUserId } : {}),
          page,
          limit
        }
      });
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
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to fetch payroll history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchPayrolls();
  }, [targetUserId, page, limit]);

  const handleGeneratePayroll = async () => {
    setGenerating(true);
    setError(null);
    setMessage(null);
    try {
      const response = await api.post('/payroll/generate');
      setMessage(response.data.message || 'Payroll generated successfully.');
      if (page === 1) {
        fetchPayrolls();
      } else {
        setPage(1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payroll generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (id) => {
    setDownloadLoading(id);
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
    } catch (err) {
      setError(err.response?.data?.message || 'Could not download payslip.');
    } finally {
      setDownloadLoading('');
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
          <button
            onClick={handleGeneratePayroll}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            <ArrowUpRight size={18} />
            {generating ? 'Generating...' : 'Generate Payroll'}
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-600">Filter by employee</label>
            <select
              value={targetUserId}
              onChange={(e) => {
                setTargetUserId(e.target.value);
                setPage(1);
              }}
              className="mt-2 w-full max-w-xs rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">All employees</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>{user.fullName || user.email}</option>
              ))}
            </select>
          </div>
          {message && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
        </div>

        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
            <Loader2 className="mx-auto animate-spin text-indigo-600" size={36} />
            <p className="mt-4">Loading payroll history...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
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
                  <th className="px-4 py-4 text-left font-semibold">Employee</th>
                  <th className="px-4 py-4 text-left font-semibold">Period</th>
                  <th className="px-4 py-4 text-left font-semibold">Net Pay</th>
                  <th className="px-4 py-4 text-left font-semibold">Status</th>
                  <th className="px-4 py-4 text-left font-semibold">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {payrolls.map((row) => (
                  <tr key={row._id}>
                    <td className="px-4 py-4 text-slate-700">{row.user?.fullName || row.user?.email || 'Unknown'}</td>
                    <td className="px-4 py-4 text-slate-700">{row.month}/{row.year}</td>
                    <td className="px-4 py-4 text-slate-700">Rs. {row.netPay?.toFixed(2)}</td>
                    <td className="px-4 py-4 text-slate-700 capitalize">{row.status}</td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleDownload(row._id)}
                        disabled={downloadLoading === row._id}
                        className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-3 py-2 text-white transition hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                      >
                        <Download size={16} />
                        {downloadLoading === row._id ? 'Downloading...' : 'Download'}
                      </button>
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
    </div>
  );
};

export default OwnerPayroll;
