# EmployeeDashboard.jsx Documentation

---

## Overview

The **EmployeeDashboard** component renders a dynamic analytics view that adapts to the logged‑in user’s role (owner vs employee). It aggregates statistics from several backend endpoints and displays them in a responsive grid of metric cards, followed by a short textual report.

---

## Flow

1. **Role detection** – The Redux `auth` slice provides `role`; the component normalises it to a boolean `isOwner`.
2. **State initialisation** – `stats` holds either owner‑level or employee‑level metrics, `loading` tracks the async fetch, and `error` records any failure.
3. **`fetchStats`** –
   - If `isOwner` is true, a single request to `GET /dashboard/stats` returns a compact summary.
   - Otherwise three parallel requests (`attendance/history`, `leaves/history`, `payroll/history`) are fired via `Promise.all`. The responses are reduced to meaningful numbers (total hours, average shift length, leaves approved, payroll count, etc.).
4. **`useEffect`** – Executes `fetchStats` once on mount.
5. **Conditional rendering** –
   - While loading, a spinner UI is shown.
   - If an error occurs, a red alert banner appears.
   - The main UI renders a banner, a metrics grid (owner cards or employee cards), and a brief textual "visual report" section.
6. **Metrics grid** – Uses Tailwind‑styled cards with icons from `lucide-react`. Owner cards display totals (employees, today’s attendance, leaves, recent payroll amount). Employee cards show attendance count, average hours, leave approvals, and payroll count.
7. **Styling** – The component relies exclusively on utility‑first Tailwind classes; no external CSS files are required.

---

## Patterns

- **Role‑based branching** – A single component serves two distinct UI trees based on the `isOwner` flag.
- **Parallel data fetching** – `Promise.all` runs three independent API calls concurrently, reducing overall latency.
- **Derived calculations** – Helper expressions compute totals, averages, and formatting directly in the response handling block.
- **Conditional UI blocks** – `&&` short‑circuiting renders loading spinners, error alerts, and role‑specific metric cards.
- **Stateless functional component** – No class component, only hooks (`useState`, `useEffect`).

---

## Mapping (Frontend ↔ Backend)

| Frontend Action | Backend Endpoint | Purpose |
|-----------------|------------------|---------|
| Owner dashboard stats | `GET /dashboard/stats` | Returns a single object containing `totalEmployees`, `todayAttendance`, `employeesOnLeave`, and a nested `recentPayroll` (amount, month, year). |
| Employee attendance history | `GET /attendance/history` | Provides an array of attendance records used to compute total shifts and average hours. |
| Employee leave history | `GET /leaves/history` | Supplies leave entries; the component counts total leaves and filters those with `status === 'approved'`. |
| Employee payroll history | `GET /payroll/history` | Returns payroll rows; the component counts how many payslips exist for the employee. |

---

## Section 5 – Line‑by‑Line Code Explanation

| Line | Code (trimmed) | Explanation |
|------|----------------|-------------|
| 1 | `import React, { useState, useEffect } from 'react';` | Pulls React and the two hooks used in the component. |
| 2 | `import { useSelector } from 'react-redux';` | Allows access to the Redux store to read the authenticated user’s role. |
| 3 | `import api from '../../app/axiosInterceptors';` | Pre‑configured Axios instance that injects auth headers and interceptors. |
| 4‑6 | `import { BarChart3, Loader2, AlertCircle, Calendar, Briefcase, FileText, CheckCircle, Clock, PieChart, Users } from 'lucide-react';` | Imports SVG icons used throughout the UI. |
| 8 | `export default function EmployeeDashboard() {` | Declares the component. |
| 9 | `  const { role } = useSelector(state => state.auth);` | Extracts the `role` string from Redux state. |
|10| `  const isOwner = role?.toLowerCase() === 'owner';` | Normalises the role to a boolean flag. |
|12‑16| `  const [stats, setStats] = useState(isOwner ? { …owner defaults… } : { …employee defaults… });` | Initialises `stats` with appropriate shape for the current role. |
|17| `  const [loading, setLoading] = useState(true);` | Loading flag for the async request. |
|18| `  const [error, setError] = useState(null);` | Holds any error message. |
|20‑63| `  const fetchStats = async () => { … }` | Async function that retrieves data.
|21| `    setLoading(true);` | Show spinner. |
|22| `    setError(null);` | Reset previous error. |
|24‑34| **Owner branch** – Calls `/dashboard/stats`, extracts fields, and updates `stats` with owner‑specific keys.
|35‑57| **Employee branch** – Executes three parallel GET requests (`attendance/history`, `leaves/history`, `payroll/history`).
|43‑45| Safely extracts `.data?.success ? .data.data : []` arrays for each response.
|47‑48| Calculates `totalHours` by reducing the attendance array, then derives `avgHrs` (average shift length) with a guard for zero length.
|50‑56| Calls `setStats` with employee‑specific metrics (`attendanceCount`, `averageHours`, `leavesApplied`, `leavesApproved`, `payrollCount`). |
|58‑60| Error handling – stores a generic message if any request fails. |
|61| `    setLoading(false);` | Hide spinner in `finally`. |
|65‑67| `useEffect(() => { fetchStats(); }, []);` – Runs `fetchStats` once after the component mounts. |
|69‑76| **Loading UI** – Returns a centred `Loader2` spinner with a descriptive label when `loading` is true and no data yet. |
|78‑214| **Main render** – Returns the full JSX tree.
|81‑92| Banner with `BarChart3` icon, title, and subtitle. |
|94‑99| Conditional error banner using `AlertCircle` when `error` is truthy. |
|102‑214| **Metrics Grid** – A responsive Tailwind grid.
|104‑157| **Owner cards** – Four metric cards (`Total Employees`, `Active Shifts Today`, `Absences Today`, `Last Payroll Disbursed`). Each card shows a label, an icon, and the corresponding value from `stats`.
|159‑211| **Employee cards** – Four cards (`Attendance Rate`, `Average Shift Hours`, `Leave Approvals`, `Payslips Generated`). Values are derived from `stats` computed earlier.
|216‑226| Visual report layout – a heading with `PieChart` icon and a paragraph describing the purpose of the section.
|228‑241| Optional employee‑only supplemental panels (attendance summary, leaves summary) rendered when `!isOwner`.
|243‑245| Closing JSX tags. |

---

*Generated by Antigravity on 2026‑05‑21.*
