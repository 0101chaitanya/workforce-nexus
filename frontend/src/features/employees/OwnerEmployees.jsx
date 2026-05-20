import React, { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, Edit2, Shield, Loader2, AlertCircle, Phone, MapPin, Briefcase } from 'lucide-react';
import api from '../../app/axiosInterceptors';

export default function OwnerEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form Data
  const [addForm, setAddForm] = useState({ fullName: '', email: '', salary: '', branch: '', position: '' });
  const [editForm, setEditForm] = useState({ fullName: '', role: 'employee', salary: '', branch: '', position: '', phone: '', address: '' });

  const fetchEmployees = useCallback(async (query = '') => {
    setLoading(true);
    try {
      // For initial load (empty query), fetch all users without pagination limit
      // For search, use pagination
      const params = query ? { query, page: 1, limit: 10 } : { query };
      const res = await api.get('/users/all', { params });
      setEmployees(res.data?.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch directory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchEmployees();
  }, [fetchEmployees]);

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      // Only search if query is empty or has at least 2 characters
      if (searchQuery === '' || searchQuery.length >= 2) {
        fetchEmployees(searchQuery);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, fetchEmployees]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const payload = { ...addForm, role: 'employee' };
      if (payload.salary) payload.salary = Number(payload.salary);
      await api.post('/users/add', payload);
      setSuccessMessage('Employee added successfully. An email with temporary password has been sent.');
      setIsAddModalOpen(false);
      setAddForm({ fullName: '', email: '', salary: '', branch: '', position: '' });
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add employee');
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName || '',
      role: user.role || 'employee',
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
    setModalLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const payload = { ...editForm };
      if (payload.salary) payload.salary = Number(payload.salary);
      await api.put(`/users/admin-update/${selectedUser._id}`, payload);
      setSuccessMessage('Employee updated successfully.');
      setIsEditModalOpen(false);
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update employee');
    } finally {
      setModalLoading(false);
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
        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition active:scale-95 shadow-md shadow-indigo-200">
          <UserPlus size={18} />
          Add New Employee
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-5 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100/50 text-xs font-bold">
          <AlertCircle size={20} className="shrink-0" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 p-5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100/50 text-xs font-bold">
          <AlertCircle size={20} className="shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search by name or email (min. 2 characters)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium text-slate-700"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(emp => (
          <div key={emp._id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl shrink-0">
                  {emp.fullName?.charAt(0).toUpperCase()}
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${emp.role === 'owner' ? 'bg-amber-50 text-amber-700 border-amber-200/50' : 'bg-slate-50 text-slate-600 border-slate-200/50'}`}>
                  {emp.role}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-800">{emp.fullName}</h3>
              <p className="text-xs font-medium text-slate-400 mt-0.5">{emp.email}</p>

              <div className="mt-4 space-y-2 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <Briefcase size={14} className="text-slate-400" />
                  {emp.position || 'N/A'} - {emp.branch || 'HQ'}
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  {emp.phone || 'Not provided'}
                </div>
              </div>
            </div>

            <button onClick={() => handleEditClick(emp)} className="mt-6 w-full flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition border border-slate-200/50">
              <Edit2 size={14} /> Edit Info
            </button>
          </div>
        ))}
        {employees.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-slate-500 font-medium text-sm">
            No employees found matching the current search.
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-slate-800 mb-6">Register Employee</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                  <input required type="text" value={addForm.fullName} onChange={e => setAddForm({...addForm, fullName: e.target.value})} className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                  <input required type="email" value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Salary Base</label>
                  <input type="number" min="0" value={addForm.salary} onChange={e => setAddForm({...addForm, salary: e.target.value})} className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Branch</label>
                  <input type="text" value={addForm.branch} onChange={e => setAddForm({...addForm, branch: e.target.value})} className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Position</label>
                  <input type="text" value={addForm.position} onChange={e => setAddForm({...addForm, position: e.target.value})} className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
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
                  <input required type="text" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                  <select required value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                    <option value="employee">Employee</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Salary Base</label>
                  <input type="number" min="0" value={editForm.salary} onChange={e => setEditForm({...editForm, salary: e.target.value})} className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Branch</label>
                  <input type="text" value={editForm.branch} onChange={e => setEditForm({...editForm, branch: e.target.value})} className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Position</label>
                  <input type="text" value={editForm.position} onChange={e => setEditForm({...editForm, position: e.target.value})} className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                  <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
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
