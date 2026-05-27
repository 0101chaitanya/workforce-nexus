# Story: Employee Dashboard (`/employee` or `/`)

This document explains the end-to-end flow of the Employee Dashboard, which aggregates user logs across attendance, leaves, and payroll in parallel to present real-time compliance statistics.

---

## 1. User Story & Narrative

> **As an** Employee,  
> **I want** to see an overview of my shifts, average working hours, leave approval statistics, and payslips count,  
> **So that** I can track my attendance compliance and check for payroll statements on a single screen.

### The Journey:
1. **Accessing the Dashboard**: The Employee logs into the portal and lands on `/` (or `/employee`).
2. **Aggregating History Stats**:
   - The frontend triggers `fetchStats()`. If the aggregated stats are already cached in the Redux store, they display immediately.
   - If not (or on manual **Refresh**), a loading spinner appears, and the frontend triggers three API calls in parallel: `/api/attendance/history`, `/api/leaves/history`, and `/api/payroll/history`.
   - The backend limits each fetch response to records belonging to the authenticated employee's ID.
3. **Reviewing Metrics**: The client side computes metrics dynamically and shows:
   - **Attendance Rate**: The total number of logged shifts.
   - **Average Shift Hours**: The average duration of all clocked-in shifts.
   - **Leave Approvals**: The ratio of approved leave applications to total applications submitted.
   - **Payslips Generated**: The total number of monthly payslips prepared by the owner.
4. **Detailed Overviews**: Below the metric cards, the Employee can read a summary box detailing their overall workday presence and leave counts.
5. **Refreshing Statistics**: The Employee can click the **Refresh** button in the header, bypassing Redux cache flags, to run parallel history fetches again and recalculate metrics.

---

## 2. Frontend Design & State Flow

### View Component:
- **File**: `frontend/src/features/reports/EmployeeDashboard.jsx`
- **Conditional Rendering**: Checks `role?.toLowerCase() !== 'owner'` to load the employee layout containing shift and leave compliance details.

### Redux State Integration:
- **Slice**: `frontend/src/features/reports/dashboardSlice.js`
- **State Properties**:
  - `stats`: The data object containing current figures.
  - `loading`: Flag indicating if a network request is ongoing.
  - `isCached`: Flag indicating if stats are cached in the store.

### Parallel Data Loading and Calculations:
- In `fetchStats(force)`:
  - If `!force && isCached`, the method returns immediately.
  - Otherwise, it runs:
    ```javascript
    const [attRes, leaveRes, payRes] = await Promise.all([
      api.get('/attendance/history'),
      api.get('/leaves/history'),
      api.get('/payroll/history')
    ]);
    ```
  - Parses outputs:
    - **Total Minutes**: `attendanceData.reduce((acc, curr) => acc + (curr.totalHours || 0), 0)`
    - **Average Hours**: `((totalMinutes / 60) / attendanceData.length).toFixed(1)` (or `0` if empty)
    - **Leaves Applied**: `leavesData.length`
    - **Leaves Approved**: `leavesData.filter(l => l.status === 'approved').length`
    - **Payroll Count**: `payrollData.length`
  - Dispatches `setStats()` to store calculations and set `isCached = true`.

---

## 3. Backend Integration & Logic

### Endpoints:
1. `GET /api/attendance/history` (Returns user-specific shift logs)
2. `GET /api/leaves/history` (Returns user-specific leave requests)
3. `GET /api/payroll/history` (Returns user-specific monthly payroll items)

### Controller Details:
- **Controllers**: `attendanceController.js`, `leaveController.js`, `payrollController.js`

### Key Logical Processes:
- **Context Locking**:
  - Each endpoint uses the `protect` middleware to parse the active user context (`req.user`).
  - Since the user's role is `'employee'`, each controller overrides search parameters to enforce: `{ user: req.user._id }`.
  - This ensures that employees can never retrieve logs of other workers, keeping credentials and metrics secure.

---

## 4. Database Collections Used

- **`Attendance`**: Used to count shifts and accumulate shift hours.
- **`Leave`**: Used to count submitted applications and filter approved ones.
- **`Payroll`**: Used to count the salary slip documents generated for the employee.
