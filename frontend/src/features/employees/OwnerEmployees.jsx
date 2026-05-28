import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, UserPlus, Edit2, Shield, Loader2, Phone, Briefcase, RefreshCcw, Trash2 } from 'lucide-react';
import api from '../../app/axiosInterceptors';
import { toast } from 'react-toastify';
import {
  setEmployees,
  setLoading,
  setSearchQuery,
  setSelectedUser,
  setModalLoading,
  setPage,
  setLimit,
  setPaginationInfo
} from './employeesSlice';
import { validateForm } from '../../utils/validation';
import { employeeSchemas } from './employeeSchemas';
import Pagination from '../../components/common/Pagination';
 
export default function OwnerEmployees() {
  const dispatch = useDispatch();
  const {
    employees,
    loading,
    searchQuery,
    selectedUser,
    modalLoading,
    page,
    limit,
    paginationInfo,
    isCached,
    cachedParams
  } = useSelector((state) => state.employees);
 
  // Local state for search input (to debounce and avoid query page-reset issues)
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [statusFilter, setStatusFilter] = useState('active');
 
  // Modals (local UI states)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
 
  // Form Data (local UI states)
  const [addForm, setAddForm] = useState({ fullName: '', email: '', salary: '', branch: '', position: '' });
  const [editForm, setEditForm] = useState({ fullName: '', salary: '', branch: '', position: '', phone: '', address: '' });
 
  const fetchEmployees = useCallback(async (queryVal, pageVal, limitVal, statusFilterVal, force = false) => {
    if (!force && isCached && cachedParams &&
        cachedParams.page === pageVal &&
        cachedParams.limit === limitVal &&
        cachedParams.searchQuery === queryVal &&
        cachedParams.statusFilter === statusFilterVal) {
      return;
    }

    dispatch(setLoading(true));
    try {
      const params = { page: pageVal, limit: limitVal };
      if (queryVal && queryVal.trim() !== "") {
        params.query = queryVal;
      }
      if (statusFilterVal) {
        params.statusFilter = statusFilterVal;
      }
      const res = await api.get('/users/search-users-or-get-all', { params });
      dispatch(setEmployees({ employees: res.data?.data || [], statusFilter: statusFilterVal }));
      if (res.data?.pagination) {
        dispatch(setPaginationInfo(res.data.pagination));
      } else {
        dispatch(setPaginationInfo({
          total: (res.data?.data || []).length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch directory');
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, isCached, cachedParams]);
 
  // Debounced search query update
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (localSearch === '' || localSearch.length >= 2) {
        dispatch(setSearchQuery(localSearch));
        dispatch(setPage(1));
      }
    }, 500);
 
    return () => clearTimeout(debounceTimer);
  }, [localSearch, dispatch]);
 
  // Main fetch hook: runs instantly whenever searchQuery, page, limit, or statusFilter changes
  useEffect(() => {
    fetchEmployees(searchQuery, page, limit, statusFilter);
  }, [searchQuery, page, limit, statusFilter, fetchEmployees]);
 
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const validated = validateForm(employeeSchemas.addUser, addForm);
    if (!validated) return;
 
    dispatch(setModalLoading(true));
    try {
      await api.post('/users/add', validated);
      toast.success('Employee added successfully. An email with temporary password has been sent.');
      setIsAddModalOpen(false);
      setAddForm({ fullName: '', email: '', salary: '', branch: '', position: '' });
      fetchEmployees(searchQuery, page, limit, statusFilter, true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add employee');
    } finally {
      dispatch(setModalLoading(false));
    }
  };
 
  const handleEditClick = (user) => {
    dispatch(setSelectedUser(user));
    setEditForm({
      fullName: user.fullName || '',
      salary: user.salary || '',
      branch: user.branch || '',
      position: user.position || '',
      phone: user.phone || '',
      address: user.address || ''
    });
    setIsEditModalOpen(true);
  };
 
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const validated = validateForm(employeeSchemas.updateUserByAdmin, editForm);
    if (!validated) return;
 
    dispatch(setModalLoading(true));
    try {
      const payload = { ...validated, role: 'employee' };
      await api.put(`/users/admin-update/${selectedUser._id}`, payload);
      toast.success('Employee updated successfully.');
      setIsEditModalOpen(false);
      fetchEmployees(searchQuery, page, limit, statusFilter, true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update employee');
    } finally {
      dispatch(setModalLoading(false));
    }
  };
  
  const handleDeleteClick = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.fullName}? This action cannot be undone.`)) {
      dispatch(setLoading(true));
      try {
        await api.delete(`/users/delete/${user._id}`);
        toast.success('Employee deleted successfully.');
        fetchEmployees(searchQuery, page, limit, statusFilter, true);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete employee');
      } finally {
        dispatch(setLoading(false));
      }
    }
  };

  if (loading && employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-3 bg-white rounded-2xl border">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
        <span className="text-slate-400 text-sm font-bold tracking-wide">Loading directory...</span>
      </div>
    );
  }
 
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Shield className="text-indigo-600" size={26} />
            Employee Directory
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage personnel records, roles, and administrative profiles.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchEmployees(searchQuery, page, limit, statusFilter, true)}
            disabled={loading}
            className="p-2.5 text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition border border-slate-200/60 active:scale-95 disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition active:scale-95 shadow-md shadow-indigo-200">
            <UserPlus size={18} />
            Add New Employee
          </button>
        </div>
      </div>

      {/* Search Bar & Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, email or ID (min. 2 characters)..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium text-slate-700"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0 bg-white px-4 py-3 border border-slate-200/80 rounded-xl relative">
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); dispatch(setPage(1)); }}
            className="appearance-none bg-transparent w-full outline-none text-sm font-bold text-slate-600 cursor-pointer pr-6"
          >
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="both">Both</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center px-0 text-slate-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {employees.map(emp => (
                <tr key={emp._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0">
                        {emp.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{emp.fullName}</div>
                        <div className="text-xs text-slate-500 font-medium">{emp.identity || 'No ID'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${emp.role === 'owner' ? 'bg-amber-50 text-amber-700 border-amber-200/50' : 'bg-slate-50 text-slate-600 border-slate-200/50'}`}>
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {emp.isActive === false ? (
                      <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border bg-red-50 text-red-600 border-red-200/50">
                        Inactive
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border bg-emerald-50 text-emerald-600 border-emerald-200/50">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Briefcase size={14} className="text-slate-400" />
                      <span className="text-sm font-semibold truncate">{emp.position || 'N/A'} - {emp.branch || 'HQ'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="text-xs font-medium text-slate-500">{emp.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone size={12} className="text-slate-400" />
                        <span className="text-xs font-medium text-slate-500">{emp.phone || 'Not provided'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEditClick(emp)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit Info">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteClick(emp)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete Employee">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium text-sm">
                    No employees found matching the current search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        limit={limit}
        total={paginationInfo.total}
        totalPages={paginationInfo.totalPages}
        hasNext={paginationInfo.hasNext}
        hasPrev={paginationInfo.hasPrev}
        onPageChange={(p) => dispatch(setPage(p))}
        onLimitChange={(newLimit) => {
          dispatch(setLimit(newLimit));
          dispatch(setPage(1));
        }}
      />

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-slate-800 mb-6">Register Employee</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                  <input
                    required
                    type="text"
                    value={addForm.fullName}
                    onChange={e => setAddForm({ ...addForm, fullName: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                  <input
                    required
                    type="email"
                    value={addForm.email}
                    onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Salary Base</label>
                  <input
                    type="number"
                    min="0"
                    value={addForm.salary}
                    onChange={e => setAddForm({ ...addForm, salary: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Branch</label>
                  <input
                    type="text"
                    value={addForm.branch}
                    onChange={e => setAddForm({ ...addForm, branch: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Position</label>
                  <input
                    type="text"
                    value={addForm.position}
                    onChange={e => setAddForm({ ...addForm, position: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl">Cancel</button>
                <button type="submit" disabled={modalLoading} className="flex-1 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl disabled:bg-indigo-400">{modalLoading ? 'Saving...' : 'Add User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-slate-800 mb-6">Edit Profile</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                  <input
                    required
                    type="text"
                    value={editForm.fullName}
                    onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>


                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Salary Base</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.salary}
                    onChange={e => setEditForm({ ...editForm, salary: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Branch</label>
                  <input
                    type="text"
                    value={editForm.branch}
                    onChange={e => setEditForm({ ...editForm, branch: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Position</label>
                  <input
                    type="text"
                    value={editForm.position}
                    onChange={e => setEditForm({ ...editForm, position: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
                  <textarea
                    rows={2}
                    value={editForm.address}
                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl">Cancel</button>
                <button type="submit" disabled={modalLoading} className="flex-1 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl disabled:bg-indigo-400">{modalLoading ? 'Saving...' : 'Update'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
