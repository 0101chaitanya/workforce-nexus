# EmployeeDashboard.jsx

## 1. Overview
The `EmployeeDashboard.jsx` component renders the statistics reports dashboard panel. It adapts based on the user's role:
- **For Owners**: Renders aggregated organizational metrics (total active employees, clock-ins today, employees on leave, and the last disbursed payroll amount).
- **For Regular Employees**: Renders employee-specific stats (total shifts worked, average shift hours, leaves approved/applied ratio, and generated payslips counts).

---

## 2. Key Responsibilities & Flow
- **Role Detection**:
  - Subscribes to the global authentication state via Redux (`state.auth.role`) to determine whether to render administrative metrics or normal worker metrics.
- **Data Aggregation**:
  - **Owner Stats Flow**: Sends a single GET request to `/api/dashboard/stats` to retrieve pre-aggregated organization metrics.
  - **Employee Stats Flow**: Uses `Promise.all` to query three endpoints concurrently:
    1. `/api/attendance/history` (computes workdays present and average shift hours locally).
    2. `/api/leaves/history` (computes leaves applied and filters for approved counts).
    3. `/api/payroll/history` (counts generated payslips).
  - Calculates average hours worked: sums `totalHours` of all shifts and divides by the total shift count.

---

## 3. Code Patterns & Best Practices
- **Role-Based Polymorphism**:
  - Adapts layout structural sections, metric calculations, and API queries dynamically based on the `isOwner` boolean value.
- **Concurrent API Performance**:
  - Regular employee stats aggregation uses `Promise.all` to execute multiple history fetches in parallel, preventing waterfall loading states.
- **Local Summarizations**:
  - Performs simple mathematical aggregations (e.g. sums and averages) locally on data sets returning from historical logs, keeping endpoints lean.

---

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
This frontend component maps to the following backend elements:
- **Routes / Endpoints consumed**:
  - `GET` `/api/dashboard/stats` -> Handled by `dashboardRoutes.js` and `dashboardController.js` (`getStats`). Accessible by Owners only.
  - `GET` `/api/attendance/history` -> Handled by `attendanceRoutes.js` and `attendanceController.js` (`getAttendanceHistory`).
  - `GET` `/api/leaves/history` -> Handled by `leaveRoutes.js` and `leaveController.js` (`getLeaveHistory`).
  - `GET` `/api/payroll/history` -> Handled by `payrollRoutes.js` and `payrollController.js` (`getPayrollHistory`).
- **Mongoose Model Reference**:
  - Displays figures counting elements across `User` (`User.js`), `Attendance` (`Attendance.js`), `Leave` (`Leave.js`), and `Payroll` (`Payroll.js`) collections.

---

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports & Setup (Lines 1-10)**: Resolves React state, Redux selectors, custom API requests client, visual UI icons, and role-based checks (`isOwner`).
2. **Local Component State (Lines 12-18)**: Sets default structures for company or employee metric metrics.
3. **Data Aggregator Functions (Lines 20-67)**: Triggers single analytics queries (for Owners) or runs concurrent history calls with math reductions (for Employees) automatically on render.
4. **Conditional Layouts (Lines 69-76)**: Intercepts renders to display loading circles.
5. **Dashboard Presentation View (Lines 78-245)**: Renders title headers, visual cards representing stats ratios, and overview insights.

- **Lines 1-6 (Imports)**:
  - Imports React hooks (`useState`, `useEffect`).
  - Imports Redux `useSelector` to read auth role fields.
  - Imports the custom axios client wrapper `api`.
  - Imports icons from `lucide-react` (`BarChart3`, `Loader2`, `AlertCircle`, `Calendar`, `Briefcase`, `FileText`, `CheckCircle`, `Clock`, `PieChart`, `Users`).
- **Lines 8-10 (Component Definition & Role Check)**:
  - Defines default function `EmployeeDashboard`.
  - Destructures `role` from global state Redux auth.
  - Computes `isOwner` by matching role strings to 'owner'.
- **Lines 12-18 (State Hooks)**:
  - Initializes `stats` object with default counter values (e.g. `totalEmployees` for owners, or `attendanceCount` for regular employees).
  - Initializes loading spinner flag to `true` and error messages to `null`.
- **Lines 20-63 (`fetchStats` async data aggregator)**:
  - If `isOwner` is true:
    - Queries `/api/dashboard/stats` to grab the single aggregate stats payload.
    - Resolves variables matching `totalEmployees`, `todayAttendance`, `employeesOnLeave`, and `recentPayroll`.
  - If `isOwner` is false:
    - Uses `Promise.all` to concurrently load `/api/attendance/history`, `/api/leaves/history`, and `/api/payroll/history`.
    - Locally reduces attendance array elements to compute cumulative hours worked and divides it by logged shifts count to display average shift hours.
    - Sets local stats values mapping shifts worked, leaves submitted, leaves approved, and count of generated payslips.
- **Lines 65-67 (useEffect Hook)**:
  - Automates invoking `fetchStats()` immediately on mount.
- **Lines 69-76 (Loading Block)**:
  - Returns component loading spinner if `loading` is true.
- **Lines 78-245 (JSX Dashboard Grid Layout)**:
  - Lines 81-92: Banner displaying page titles and description.
  - Lines 94-99: Renders error banner if requests failed.
  - Lines 102-214: Metrics Grid. If `isOwner` is true, displays cards for Total Employees, Active Shifts, Absences, and Last Payroll. If `isOwner` is false, displays cards for Attendance Rate, Average Shift Hours, Leave Approvals, and Payslips Generated.
  - Lines 217-243: Renders sub-insights summaries (Company Overview text, or personal work compliance graphs/details).


