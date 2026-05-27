# Story: Owner Dashboard (`/owner`)

This document explains the end-to-end flow of the Owner Dashboard, which provides the business owner with high-level analytics about the organization's current workforce status and payroll statistics.

---

## 1. User Story & Narrative

> **As an** Organization Owner,  
> **I want** to see a summary of my active employees, today's attendance rate, absences, and the most recent payroll payout,  
> **So that** I can get an immediate overview of my business health upon logging in.

### The Journey:
1. **Accessing the Route**: The Owner logs into the portal and is redirected to `/owner` (or lands on the dashboard index).
2. **First Render**: The page queries the system backend for aggregated statistics. If the data is already stored in the Redux cache from a previous screen transition, it loads instantly. If not (or if the Owner clicks **Refresh**), it shows a loading spinner and hits the network.
3. **Data Review**: The Owner reviews four metric cards:
   - **Total Employees**: How many people are active in the company.
   - **Active Shifts Today**: How many employees are clocked in right now.
   - **Absences Today**: How many employees are on approved leaves of absence.
   - **Last Payroll Disbursed**: The total salary amount calculated in the latest month's payroll.
4. **On-Demand Refresh**: The Owner can manually trigger a sync by clicking **Refresh** next to the header, which bypasses the cache to fetch real-time updates.

---

## 2. Frontend Design & State Flow

### View Component:
- **File**: `frontend/src/features/reports/EmployeeDashboard.jsx`
- **Conditional Rendering**: Checks `role?.toLowerCase() === 'owner'` to render the administrative metrics layout instead of the employee-specific history layout.

### Redux State Integration:
- **Slice**: `frontend/src/features/reports/dashboardSlice.js`
- **Selects**:
  - `stats`: The data object containing current figures.
  - `loading`: Flag indicating if a network request is ongoing.
  - `isCached`: Flag indicating if stats are cached in the store.
- **Reducers**:
  - `setStats(payload)`: Saves the analytics data and sets `isCached` to `true`.
  - `setLoading(boolean)`: Controls the loading spinner.
  - `invalidateCache()`: Resets `isCached` to `false` (e.g. on logout).

### Caching Check:
- Inside `fetchStats(force)`:
  ```javascript
  if (!force && isCached) {
    return; // Bypasses network request
  }
  ```

---

## 3. Backend Integration & Logic

### Endpoint:
- **Route**: `GET /api/dashboard/stats`
- **Controller**: `backend/src/controllers/dashboardController.js` (Method: `getDashboardStats`)
- **Middlewares**: `protect`, `isAuthorized('owner')`

### Controller Execution Steps:
1. **Company Context**: Extracts `req.company._id` (the owner's company context, established by the auth token middleware).
2. **Total Employees**: Counts all records in the `User` collection matching:
   - `{ company: companyId, role: 'employee' }`
3. **Active Shifts Today**: Counts records in the `Attendance` collection matching:
   - `{ company: companyId, date: todayDateString, checkInTime: { $exists: true } }`
4. **Absences Today**: Counts records in the `Leave` collection matching:
   - `{ company: companyId, status: 'approved', startDate: { $lte: today }, endDate: { $gte: today } }`
5. **Last Payroll**: Finds the single most recent record in the `Payroll` collection matching:
   - `{ company: companyId }` sorted by `{ year: -1, month: -1 }`. Extracts the total payout amount.
6. **Response**: Returns a JSON payload containing the aggregated values.

---

## 4. Database Collections Used

- **`User`**: Holds employee profile entries.
- **`Attendance`**: Holds check-in/out timestamps and statuses.
- **`Leave`**: Holds employee leave applications and status flags.
- **`Payroll`**: Holds monthly salary statements.
