# EmployeePayroll.jsx Documentation

---

## Overview

The **EmployeePayroll** component allows a logged‑in employee to view their own payroll history, download individual payslips, and optionally download a consolidated tenure payslip covering all periods. It mirrors the owner‑side view but limits data to the authenticated employee.

---

## Flow

1. **State Setup** – `useState` hooks hold payroll rows, loading flags, pagination data, and error messages.
2. **Fetch Payroll** – `fetchPayroll` calls `GET /payroll/history` (no `targetUserId` filter, the backend returns only the current user's records).
3. **Effect Hook** – Triggers `fetchPayroll` on mount and when pagination changes.
4. **Download Handlers** – `handleDownload` fetches a single payslip blob, `handleDownloadTenure` fetches a PDF containing the employee’s entire payslip history.
5. **Render** – Displays a banner, a table of payroll rows, and a `Pagination` component.

---

## Patterns

- **Data‑fetch‑on‑mount** – `useEffect` with `[page, limit]` dependency.
- **Conditional UI** – Shows loaders, error messages, empty states, or the table based on component state.
- **Blob‑download** – Creates a temporary object URL from binary data and programmatically clicks an `<a>` element.
- **Pagination Component** – Re‑uses the generic `Pagination` UI.
- **Helper Function** – `getMonthName` maps numeric month to human‑readable string.

---

## Mapping (Frontend ↔ Backend)

| Frontend Action | Backend Endpoint | Purpose |
|-----------------|------------------|---------|
| Fetch payroll list | `GET /payroll/history` (page, limit) | Returns payroll records for the authenticated employee.
| Download single payslip | `GET /payroll/:id/download` | Returns a PDF for the given payroll entry.
| Download tenure payslip | `GET /payroll/tenure/download` | Returns a consolidated PDF for the employee.

---

## Section 5 – Line‑by‑Line Code Explanation

| Line | Code (trimmed) | Explanation |
|------|----------------|-------------|
| 1 | `import React, { useState, useEffect } from 'react';` | Imports React and required hooks.
| 2 | `import api from '../../app/axiosInterceptors';` | Axios instance with auth interceptors.
| 3 | `import Pagination from '../../components/common/Pagination';` | Pagination UI component.
| 4‑6 | `import { CreditCard, Download, Loader2, AlertCircle, FileText, Calendar, DollarSign } from 'lucide-react';` | Icon set for UI elements.
| 8 | `export default function EmployeePayroll() {` | Defines the component.
| 9 | `  const [payrolls, setPayrolls] = useState([]);` | Stores payroll rows.
|10| `  const [loading, setLoading] = useState(true);` | Loading flag for data fetch.
|11| `  const [downloadingId, setDownloadingId] = useState(null);` | Tracks which payslip is currently being downloaded.
|12| `  const [tenureDownloading, setTenureDownloading] = useState(false);` | Flag for tenure‑pay slip download.
|13| `  const [error, setError] = useState(null);` | Stores any error message.
|15| `  const [page, setPage] = useState(1);` | Current pagination page.
|16| `  const [limit, setLimit] = useState(10);` | Rows per page.
|17‑22| `  const [paginationInfo, setPaginationInfo] = useState({ ... });` | Holds pagination metadata returned from the API.
|24| `  const fetchPayroll = async () => {` | Async function to request payroll data.
|25| `    setLoading(true);` | Show loader.
|26| `    setError(null);` | Reset error.
|27‑30| `    const response = await api.get('/payroll/history', { params: { page, limit } });` | Calls backend with pagination.
|31‑42| Handles success: stores data, updates paginationInfo (uses backend‑provided meta if available, otherwise derives from data length).
|44‑46| `catch` block sets a user‑friendly error message.
|47‑48| `finally` clears loading flag.
|51| `  useEffect(() => { fetchPayroll(); }, [page, limit]);` | Runs fetch on mount and pagination change.
|55| `  const handleDownload = async (payrollId, filename) => {` | Initiates download of a single payslip.
|56| `    setDownloadingId(payrollId);` | UI disables the button for that row.
|59‑71| Makes GET request with `responseType: 'blob'`, creates temporary URL, programmatically clicks a hidden anchor, then cleans up.
|73‑76| Error handling for download failures.
|77| Reset `downloadingId`.
|79| `  const handleDownloadTenure = async () => {` | Handles consolidated tenure download.
|80‑82| Set loading flag and reset errors.
|83‑94| Calls `/payroll/tenure/download`, creates Blob URL, triggers download with a generated filename, then cleans up.
|95‑98| Error handling and final state reset.
|102‑107| `getMonthName` helper converts month number to localized month name.
|109‑236| JSX return block rendering:
- Banner with title and tenure‑download button.
- Conditional panels for loading, error, empty state, or the payroll table.
- Table rows map over `payrolls`, displaying period, gross, deductions, taxes, net, status, and action buttons.
- Each row’s **Download** button calls `handleDownload` with appropriate ID and filename.
- Pagination component receives page/limit/meta and callbacks.
|237| `}` – End of component.

---

*Generated by Antigravity on 2026‑05‑21.*
