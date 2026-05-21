# OwnerPayroll.jsx Documentation

---

## Overview

The **OwnerPayroll** component is a React functional component used by the company owner to administer payroll. It provides functionality to:
- Generate the monthly payroll for all employees.
- Search and filter payroll records by employee.
- Download individual monthly payslips as PDF.
- Download a consolidated tenure payslip for a specific employee.
- Paginate through payroll history.

---

## Flow

1. **State Initialization** – Several `useState` hooks create state variables for payroll data, pagination, loading flags, search, and UI controls.
2. **Data Fetch (`fetchPayrolls`)** – An async function that calls the backend endpoint `GET /payroll/history` with optional `targetUserId`, `page`, and `limit` parameters. The response populates `payrolls` and pagination metadata.
3. **Effect Hook – Data Load** – Runs `fetchPayrolls` whenever `targetUserId`, `page`, or `limit` changes.
4. **Effect Hook – Search Autocomplete** – Debounced API call to `GET /users/all` when the search query is longer than two characters. Results are shown in a dropdown.
5. **User Interaction Handlers** – Functions to select a user, clear the search, handle changes, generate payroll, and download PDFs.
6. **Render** – UI composed of a header with a generate‑payroll button, a search box with autocomplete, a table of payroll rows, and a `Pagination` component.

---

## Patterns

- **Controlled Component** – Search input is fully controlled via `searchQuery` state.
- **Debounce with `setTimeout`** – Reduces API calls while typing.
- **Conditional Rendering** – Shows loaders, error messages, empty states, or the data table based on the component state.
- **Pagination Pattern** – Uses a separate `Pagination` component that receives page/limit metadata and callbacks.
- **File Download via Blob** – Creates a temporary URL from a binary response and programmatically clicks an anchor element.

---

## Mapping (Frontend ↔ Backend)

| Frontend Action | Backend Endpoint | Purpose |
|-----------------|------------------|---------|
| Generate payroll | `POST /payroll/generate` | Triggers payroll calculation on the server for the current month.
| Fetch payroll history | `GET /payroll/history` (query: `targetUserId`, `page`, `limit`) | Returns a paginated list of payroll records.
| Search employees | `GET /users/all` (query: `searchQuery`) | Retrieves user records for autocomplete.
| Download monthly payslip | `GET /payroll/:id/download` | Returns a PDF blob of a single payslip.
| Download tenure payslip | `GET /payroll/tenure/download` (query: `targetUserId`) | Returns a PDF blob containing all payslips for the employee.

---

## Section 5 – Line‑by‑Line Code Explanation

| Line | Code (trimmed) | Explanation |
|------|----------------|-------------|
| 1 | `import React, { useEffect, useState } from 'react';` | Imports React and the `useEffect`/`useState` hooks needed for component state and side‑effects. |
| 2 | `import api from '../../app/axiosInterceptors';` | Imports a pre‑configured axios instance that adds authentication headers and interceptors. |
| 3 | `import Pagination from '../../components/common/Pagination';` | Imports the reusable Pagination component used to navigate pages of payroll records. |
| 4 | `import { Loader2, CreditCard, Download, Users, ArrowUpRight, AlertTriangle, Search, X } from 'lucide-react';` | Imports SVG icons from the Lucide React library for UI embellishment. |
| 5 | *(blank)* | Empty line for readability. |
| 6 | `const OwnerPayroll = () => {` | Declares the OwnerPayroll functional component. |
| 7 | `  const [payrolls, setPayrolls] = useState([]);` | State array holding payroll records fetched from the server. |
| 8 | `  const [targetUserId, setTargetUserId] = useState('');` | Holds the selected employee's ID for filtered queries. |
| 9 | `  const [loading, setLoading] = useState(true);` | Loading flag for the payroll table fetch operation. |
|10 | `  const [generating, setGenerating] = useState(false);` | Indicates whether a payroll generation request is in progress. |
|11 | `  const [downloadLoading, setDownloadLoading] = useState('');` | Stores the ID of the payroll row currently being downloaded (used to disable its button). |
|12 | `  const [tenureDownloading, setTenureDownloading] = useState(false);` | Flag for the consolidated tenure‑payslip download process. |
|13 | `  const [rowTenureDownloading, setRowTenureDownloading] = useState('');` | Holds the employee ID for which a row‑specific tenure download is running. |
|14 | `  const [error, setError] = useState(null);` | Stores any error message to display to the user. |
|15 | `  const [message, setMessage] = useState(null);` | Stores a success message (e.g., after generating payroll). |
|16 | *(blank)* | – |
|17 | `  const [page, setPage] = useState(1);` | Current pagination page number. |
|18 | `  const [limit, setLimit] = useState(10);` | Number of rows per page. |
|19 | `  const [paginationInfo, setPaginationInfo] = useState({` | Object that will hold metadata returned from the backend (total count, totalPages, etc.). |
|20 | `    total: 0,` | Initial total record count. |
|21 | `    totalPages: 1,` | Initial total pages. |
|22 | `    hasNext: false,` | Flag indicating if a next page exists. |
|23 | `    hasPrev: false` | Flag indicating if a previous page exists. |
|24 | `  });` | End of paginationInfo initialization. |
|25 | *(blank)* | – |
|26 | `  // Search states` | Comment describing the next block of state variables. |
|27 | `  const [searchQuery, setSearchQuery] = useState('');` | Controlled value for the search input. |
|28 | `  const [searchResults, setSearchResults] = useState([]);` | Holds autocomplete results from the users API. |
|29 | `  const [selectedUserObj, setSelectedUserObj] = useState(null);` | Stores the user object selected from the dropdown. |
|30 | `  const [showDropdown, setShowDropdown] = useState(false);` | Controls visibility of the autocomplete dropdown. |
|31 | `  const [searchLoading, setSearchLoading] = useState(false);` | Loading flag for the search API call. |
|32 | *(blank)* | – |
|33 | `  const fetchPayrolls = async () => {` | Async function to retrieve payroll history from the backend. |
|34 | `    setLoading(true);` | Set table loading state before request. |
|35 | `    setError(null);` | Reset any previous error. |
|36 | `    setMessage(null);` | Reset any previous success message. |
|37 | `    try {` | Begin `try` block for API call. |
|38 | `      const response = await api.get('/payroll/history', {` | Calls backend endpoint with query params. |
|39 | `        params: {` | Start of query parameters object. |
|40 | `          ...(targetUserId ? { targetUserId } : {}),` | Conditionally include `targetUserId` if a user is selected. |
|41 | `          page,` | Current page number. |
|42 | `          limit` | Page size. |
|43 | `        }` | End of params. |
|44 | `      });` | End of axios `get`. |
|45 | `      setPayrolls(response.data.data || []);` | Store payroll array from response, fallback to empty array. |
|46 | `      if (response.data.pagination) {` | If backend supplies pagination metadata... |
|47 | `        setPaginationInfo(response.data.pagination);` | …store it. |
|48 | `      } else {` | Otherwise compute pagination locally. |
|49 | `        setPaginationInfo({` | Begin local pagination object. |
|50 | `          total: (response.data.data || []).length,` | Total records equal length of returned data. |
|51 | `          totalPages: 1,` | Single page fallback. |
|52 | `          hasNext: false,` | No next page. |
|53 | `          hasPrev: false` | No previous page. |
|54 | `        });` | End of local pagination object. |
|55 | `      }` | Close conditional. |
|56 | `    } catch (err) {` | Catch any request error. |
|57 | `      setError(err.response?.data?.message || 'Unable to fetch payroll history.');` | Store a user‑friendly error message. |
|58 | `    } finally {` | Cleanup regardless of success/failure. |
|59 | `      setLoading(false);` | Hide loading spinner. |
|60 | `    }` | End of `finally`. |
|61 | `  };` | End of `fetchPayrolls`. |
|62 | *(blank)* | – |
|63 | `  useEffect(() => {` | Effect runs on component mount and whenever dependencies change. |
|64 | `    fetchPayrolls();` | Triggers data load. |
|65 | `  }, [targetUserId, page, limit]);` | Dependency array – re‑run when any of these change. |
|66 | *(blank)* | – |
|67 | `  // Search user autocomplete effect` | Comment for the next effect. |
|68 | `  useEffect(() => {` | Starts autocomplete effect. |
|69 | `    if (searchQuery.trim().length < 2) {` | Guard: ignore short queries. |
|70 | `      setSearchResults([]);` | Clear results. |
|71 | `      setShowDropdown(false);` | Hide dropdown. |
|72 | `      return;` | Exit early. |
|73 | `    }` | End guard. |
|74 | *(blank)* | – |
|75 | `    // Skip search query if it exactly matches the currently selected user` | Comment explaining next conditional. |
|76 | `    if (selectedUserObj && (` | Begin check against selected user. |
|77 | `      searchQuery === selectedUserObj.fullName ||` | Compare full name. |
|78 | `      searchQuery === selectedUserObj.email ||` | Compare email. |
|79 | `      searchQuery === selectedUserObj.identity` | Compare employee ID. |
|80 | `    )) {` | Close condition. |
|81 | `      return;` | Do not run search if query matches selected user. |
|82 | `    }` | End of conditional. |
|83 | *(blank)* | – |
|84 | `    const timer = setTimeout(async () => {` | Debounce: wait 300 ms before issuing request. |
|85 | `      setSearchLoading(true);` | Show spinner in dropdown. |
|86 | `      try {` | Begin try block for search API. |
|87 | `        const response = await api.get('/users/all', {` | Call backend to fetch users matching query. |
|88 | `          params: { query: searchQuery }` | Pass query string. |
|89 | `        });` | End of axios call. |
|90 | `        setSearchResults(response.data.data || []);` | Populate autocomplete list. |
|91 | `        setShowDropdown(true);` | Show dropdown. |
|92 | `      } catch (err) {` | Catch errors. |
|93 | `        console.error(err);` | Log to console (non‑blocking). |
|94 | `      } finally {` | Cleanup after request. |
|95 | `        setSearchLoading(false);` | Hide spinner. |
|96 | `      }` | End of finally. |
|97 | `    }, 300);` | 300 ms debounce interval. |
|98 | *(blank)* | – |
|99 | `    return () => clearTimeout(timer);` | Cleanup timer if query changes before timeout. |
|100| `  }, [searchQuery, selectedUserObj]);` | Effect depends on query and selected user. |
|101| *(blank)* | – |
|102| `  const handleSelectUser = (user) => {` | When a user is chosen from autocomplete. |
|103| `    setTargetUserId(user._id);` | Store selected employee ID for payroll filtering. |
|104| `    setSelectedUserObj(user);` | Save full user object. |
|105| `    setSearchQuery(user.identity || user.fullName || user.email);` | Populate the input with a recognizable identifier. |
|106| `    setShowDropdown(false);` | Hide dropdown. |
|107| `    setPage(1);` | Reset pagination to first page. |
|108| `  };` | End of handler. |
|109| *(blank)* | – |
|110| `  const handleClearSearch = () => {` | Clears the search input and related state. |
|111| `    setSearchQuery('');` | Empty the input field. |
|112| `    setTargetUserId('');` | Remove employee filter. |
|113| `    setSelectedUserObj(null);` | Reset selected user. |
|114| `    setSearchResults([]);` | Clear results array. |
|115| `    setShowDropdown(false);` | Hide dropdown. |
|116| `    setPage(1);` | Reset pagination. |
|117| `  };` | End of handler. |
|118| *(blank)* | – |
|119| `  const handleSearchChange = (val) => {` | Fires on every keystroke in the search box. |
|120| `    setSearchQuery(val);` | Update controlled input state. |
|121| `    if (val === '') {` | If cleared... |
|122| `      handleClearSearch();` | …reset everything. |
|123| `    } else {` | Otherwise, ensure filter consistency. |
|124| `      if (selectedUserObj &&` | If a user was previously selected but the new value differs: |
|125| `          val !== selectedUserObj.fullName &&` |
|126| `          val !== selectedUserObj.email &&` |
|127| `          val !== selectedUserObj.identity) {` |
|128| `        setTargetUserId('');` | Remove employee filter. |
|129| `        setSelectedUserObj(null);` | Clear selected user. |
|130| `      }` |
|131| `    }` |
|132| `  };` |
|133| *(blank)* | – |
|134| `  const handleGeneratePayroll = async () => {` | Initiates payroll generation on the server. |
|135| `    setGenerating(true);` | Show generating spinner/button disabled state. |
|136| `    setError(null);` |
|137| `    setMessage(null);` |
|138| `    try {` |
|139| `      const response = await api.post('/payroll/generate');` |
|140| `      setMessage(response.data.message || 'Payroll generated successfully.');` |
|141| `      if (page === 1) {` |
|142| `        fetchPayrolls();` |
|143| `      } else {` |
|144| `        setPage(1);` |
|145| `      }` |
|146| `    } catch (err) {` |
|147| `      setError(err.response?.data?.message || 'Payroll generation failed.');` |
|148| `    } finally {` |
|149| `      setGenerating(false);` |
|150| `    }` |
|151| `  };` |
|152| *(blank)* | – |
|153| `  const handleDownload = async (id) => {` |
|154| `    setDownloadLoading(id);` |
|155| `    try {` |
|156| `      const response = await api.get(`/payroll/${id}/download`, {` |
|157| `        responseType: 'blob'` |
|158| `      });` |
|159| `      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));` |
|160| `      const link = document.createElement('a');` |
|161| `      link.href = url;` |
|162| `      link.setAttribute('download', `payslip_${id}.pdf`);` |
|163| `      document.body.appendChild(link);` |
|164| `      link.click();` |
|165| `      link.remove();` |
|166| `      window.URL.revokeObjectURL(url);` |
|167| `    } catch (err) {` |
|168| `      setError(err.response?.d…` |
|169| `    } finally {` |
|170| `      setDownloadLoading('');` |
|171| `    }` |
|172| `  };` |
|173| *(blank)* | – |
|174| `  const handleDownloadTenure = async () => {` |
|175| `    if (!targetUserId) return;` |
|176| `    setTenureDownloading(true);` |
|177| `    setError(null);` |
|178| `    try {` |
|179| `      const response = await api.get('/payroll/tenure/download', {` |
|180| `        params: { targetUserId },` |
|181| `        responseType: 'blob'` |
|182| `      });` |
|183| `      const name = selectedUserObj?.fullName?.replace(/\s+/g, '_') || 'Employee';` |
|184| `      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));` |
|185| `      const link = document.createElement('a');` |
|186| `      link.href = url;` |
|187| `      link.setAttribute('download', `Tenure_Payslip_${name}.pdf`);` |
|188| `      document.body.appendChild(link);` |
|189| `      link.click();` |
|190| `      link.remove();` |
|191| `      window.URL.revokeObjectURL(url);` |
|192| `    } catch (err) {` |
|193| `      setError('Could not download consolidated payslip.');` |
|194| `    } finally {` |
|195| `      setTenureDownloading(false);` |
|196| `    }` |
|197| `  };` |
|198| *(blank)* | – |
|199| `  const handleDownloadRowTenure = async (userId, fullName) => {` |
|200| `    if (!userId) return;` |
|201| `    setRowTenureDownloading(userId);` |
|202| `    setError(null);` |
|203| `    try {` |
|204| `      const response = await api.get('/payroll/tenure/download', {` |
|205| `        params: { targetUserId: userId },` |
|206| `        responseType: 'blob'` |
|207| `      });` |
|208| `      const name = fullName?.replace(/\s+/g, '_') || 'Employee';` |
|209| `      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));` |
|210| `      const link = document.createElement('a');` |
|211| `      link.href = url;` |
|212| `      link.setAttribute('download', `Tenure_Payslip_${name}.pdf`);` |
|213| `      document.body.appendChild(link);` |
|214| `      link.click();` |
|215| `      link.remove();` |
|216| `      window.URL.revokeObjectURL(url);` |
|217| `    } catch (err) {` |
|218| `      setError('Could not download consolidated payslip.');` |
|219| `    } finally {` |
|220| `      setRowTenureDownloading('');` |
|221| `    }` |
|222| `  };` |
|223| *(blank)* | – |
|224| `  return (` |
|225| `    <div className="space-y-6">` |
|226| `      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">` |
|227| `        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">` |
|228| `          <div>` |
|229| `            <h1 className="text-3xl font-black text-slate-900">Payroll Administration</h1>` |
|230| `            <p className="mt-2 text-slate-500">Generate company payroll, review payouts, and download payslips for employees.</p>` |
|231| `          </div>` |
|232| `          <button` |
|233| `            onClick={handleGeneratePayroll}` |
|234| `            disabled={generating}` |
|235| `            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"` |
|236| `          >` |
|237| `            <ArrowUpRight size={18} />` |
|238| `            {generating ? 'Generating...' : 'Generate Payroll'}` |
|239| `          </button>` |
|240| `        </div>` |
|241| `      </div>` |
|242| *(blank)* |
|243| `      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">` |
|244| `        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">` |
|245| `          {/* Lookup Search Box */}` |
|246| `          <div className="relative w-full max-w-md">` |
|247| `            <label className="block text-sm font-semibold text-slate-600 mb-2">Filter by employee</label>` |
|248| `            <div className="relative flex items-center">` |
|249| `              <Search className="absolute left-4 text-slate-400" size={18} />` |
|250| `              <input` |
|251| `                type="text"` |
|252| `                value={searchQuery}` |
|253| `                onChange={(e) => handleSearchChange(e.target.value)}` |
|254| `                placeholder="Type name, email, or employee ID to filter..."` |
|255| `                className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"` |
|256| `              />` |
|257| `              {searchQuery && (` |
|258| `                <button` |
|259| `                  type="button"` |
|260| `                  onClick={handleClearSearch}` |
|261| `                  className="absolute right-4 text-slate-400 hover:text-slate-600"` |
|262| `                >` |
|263| `                  <X size={16} />` |
|264| `                </button>` |
|265| `              )}` |
|266| `            </div>` |
|267| *(blank)* |
|268| `            {/* Autocomplete Dropdown */}` |
|269| `            {showDropdown && searchResults.length > 0 && (` |
|270| `              <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg max-h-60 overflow-y-auto">` |
|271| `                <div className="p-2 space-y-1">` |
|272| `                  {searchResults.map((user) => (` |
|273| `                    <button` |
|274| `                      key={user._id}` |
|275| `                      type="button"` |
|276| `                      onClick={() => handleSelectUser(user)}` |
|277| `                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition font-medium"` |
|278| `                    >` |
|279| `                      <div className="flex justify-between items-center">` |
|280| `                        <span className="font-bold text-slate-800">{user.fullName}</span>` |
|281| `                        {user.identity && (` |
|282| `                          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">` |
|283| `                            {user.identity}` |
|284| `                          </span>` |
|285| `                        )}` |
|286| `                      </div>` |
|287| `                      <div className="text-xs text-slate-400">{user.email} • {user.position || 'Employee'}</div>` |
|288| `                    </button>` |
|289| `                  ))}` |
|290| `                </div>` |
|291| `              </div>` |
|292| `            )}` |
|293| *(blank)* |
|294| `            {showDropdown && searchResults.length === 0 && !searchLoading && searchQuery.trim().length >= 2 && (` |
|295| `              <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg p-4 text-center text-sm text-slate-500">` |
|296| `                No matching employees found` |
|297| `              </div>` |
|298| `            )}` |
|299| `          </div>` |
|300| `          <div className="flex flex-wrap items-center gap-4 self-end sm:self-auto">` |
|301| `            {targetUserId && (` |
|302| `              <button` |
|303| `                type="button"` |
|304| `                onClick={handleDownloadTenure}` |
|305| `                disabled={tenureDownloading || payrolls.length === 0}` |
|306| `                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-white transition hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-sm font-semibold animate-fade-in"` |
|307| `              >` |
|308| `                {tenureDownloading ? (` |
|309| `                  <Loader2 className="animate-spin" size={16} />` |
|310| `                ) : (` |
|311| `                  <Download size={16} />` |
|312| `                )}` |
|313| `                Tenure Payslip` |
|314| `              </button>` |
|315| `            )}` |
|316| `            {message && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}` |
|317| `          </div>` |
|318| `        </div>` |
|319| *(blank)* |
|320| `        {loading ? (` |
|321| `          <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500">` |
|322| `            <Loader2 className="mx-auto animate-spin text-indigo-600" size={36} />` |
|323| `            <p className="mt-4">Loading payroll history...</p>` |
|324| `          </div>` |
|325| `        ) : error ? (` |
|326| `          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>` |
|327| `        ) : payrolls.length === 0 ? (` |
|328| `          <div className="rounded-3xl border border-slate-200 p-10 text-center text-slate-500">` |
|329| `            <CreditCard size={32} className="mx-auto text-indigo-600" />` |
|330| `            <p className="mt-4">No payroll records were found for this selection.</p>` |
|331| `          </div>` |
|332| `        ) : (` |
|333| `          <div className="overflow-x-auto">` |
|334| `            <table className="min-w-full divide-y divide-slate-200 text-sm">` |
|335| `              <thead className="bg-slate-50 text-slate-600">` |
|336| `                <tr>` |
|337| `                  <th className="px-4 py-4 text-left font-semibold">Employee ID</th>` |
|338| `                  <th className="px-4 py-4 text-left font-semibold">Employee</th>` |
|339| `                  <th className="px-4 py-4 text-left font-semibold">Period</th>` |
|340| `                  <th className="px-4 py-4 text-left font-semibold">Gross Pay</th>` |
|341| `                  <th className="px-4 py-4 text-left font-semibold">Deductions</th>` |
|342| `                  <th className="px-4 py-4 text-left font-semibold">Net Pay</th>` |
|343| `                  <th className="px-4 py-4 text-left font-semibold">Status</th>` |
|344| `                  <th className="px-4 py-4 text-left font-semibold">Actions</th>` |
|345| `                </tr>` |
|346| `              </thead>` |
|347| `              <tbody className="divide-y divide-slate-200 bg-white">` |
|348| `                {payrolls.map((row) => {` |
|349| `                  const calculatedGross = row.grossPay || (row.basicPay + (row.hra || 0) + (row.conveyance || 0) + (row.medical || 0) + (row.bonus || 0));` |
|350| `                  const calculatedDeductions = row.unpaidLeaveDeductions || 0;` |
|351| `                  return (` |
|352| `                    <tr key={row._id}>` |
|353| `                      <td className="px-4 py-4 text-slate-700 font-mono text-xs">` |
|354| `                        {row.user?.identity ? (` |
|355| `                          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-bold">` |
|356| `                            {row.user.identity}` |
|357| `                          </span>` |
|358| `                        ) : ('-')}` |
|359| `                      </td>` |
|360| `                      <td className="px-4 py-4 text-slate-700">{row.user?.fullName || row.user?.email || 'Unknown'}</td>` |
|361| `                      <td className="px-4 py-4 text-slate-700">{row.month}/{row.year}</td>` |
|362| `                      <td className="px-4 py-4 text-slate-700">Rs. {calculatedGross.toFixed(2)}</td>` |
|363| `                      <td className="px-4 py-4 text-rose-600 font-medium">Rs. {calculatedDeductions.toFixed(2)}</td>` |
|364| `                      <td className="px-4 py-4 text-slate-700 font-semibold">Rs. {row.netPay?.toFixed(2)}</td>` |
|365| `                      <td className="px-4 py-4 text-slate-700 capitalize">{row.status}</td>` |
|366| `                      <td className="px-4 py-4 flex items-center gap-2">` |
|367| `                        <button` |
|368| `                          onClick={() => handleDownload(row._id)}` |
|369| `                          disabled={downloadLoading === row._id}` |
|370| `                          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-white transition hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-xs font-semibold"` |
|371| `                        >` |
|372| `                          <Download size={14} />` |
|373| `                          {downloadLoading === row._id ? 'Monthly...' : 'Monthly Payslip'}` |
|374| `                        </button>` |
|375| `                        <button` |
|376| `                          onClick={() => handleDownloadRowTenure(row.user?._id, row.user?.fullName)}` |
|377| `                          disabled={rowTenureDownloading === row.user?._id}` |
|378| `                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-600 hover:bg-slate-700 text-white transition disabled:bg-slate-300 disabled:cursor-not-allowed text-xs font-semibold px-3 py-1.5"` |
|379| `                        >` |
|380| `                          {rowTenureDownloading === row.user?._id ? (` |
|381| `                            <Loader2 className="animate-spin" size={14} />` |
|382| `                          ) : (` |
|383| `                            <Download size={14} />` |
|384| `                          )}` |
|385| `                          Tenure Payslip` |
|386| `                        </button>` |
|387| `                      </td>` |
|388| `                    </tr>` |
|389| `                  );` |
|390| `                })}` |
|391| `              </tbody>` |
|392| `            </table>` |
|393| `          </div>` |
|394| `        )}` |
|395| `        <Pagination` |
|396| `          page={page}` |
|397| `          limit={limit}` |
|398| `          total={paginationInfo.total}` |
|399| `          totalPages={paginationInfo.totalPages}` |
|400| `          hasNext={paginationInfo.hasNext}` |
|401| `          hasPrev={paginationInfo.hasPrev}` |
|402| `          onPageChange={setPage}` |
|403| `          onLimitChange={(newLimit) => {` |
|404| `            setLimit(newLimit);` |
|405| `            setPage(1);` |
|406| `          }}` |
|407| `        />` |
|408| `      </div>` |
|409| `    </div>` |
|410| `  );` |
|411| `};` |
|412| *(blank)* |
|413| `export default OwnerPayroll;` |
|414| *(blank)* |

---

*Generated by Antigravity on 2026‑05‑21.*
