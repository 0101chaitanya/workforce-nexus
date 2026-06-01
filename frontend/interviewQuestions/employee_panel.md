# Employee Panel Interview Questions & Answers

## 1. What are the employee panel routes?
- `/employee` → EmployeeDashboard
- `/employee/profile` → EmployeeProfile
- `/employee/attendance` → EmployeeAttendance
- `/employee/leaves` → EmployeeLeaves
- `/employee/payroll` → EmployeePayroll

### Answer:
Employee routes are nested under `/employee` in `App.jsx` and protected using `ProtectedRoute` with `allowedRoles={['employee']}`. The employee sees only the routes relevant to their role in `MainLayout.jsx`.

## 2. How does employee attendance work?
### Answer:
`EmployeeAttendance.jsx` fetches attendance history from `/attendance/history` with pagination. It also supports clock-in and clock-out actions via `/attendance/clock-in` and `/attendance/clock-out`.

## 3. How is geolocation integrated into attendance?
### Answer:
The employee attendance component uses the browser `navigator.geolocation` API. When available, it retrieves latitude and longitude and posts them to the backend. If the user denies permission or geolocation fails, it still submits the request without coordinates.

## 4. What is the purpose of `todayRecord` in attendance?
### Answer:
`todayRecord` is derived from the first page of attendance history and stored in Redux. It shows whether the employee has clocked in, clocked out, and how many hours are logged for the current day.

## 5. How is the employee dashboard data fetched efficiently?
### Answer:
`EmployeeDashboard.jsx` uses `Promise.all()` to fetch attendance, leave history, and payroll history concurrently. This reduces total wait time instead of fetching each endpoint sequentially.

## 6. How does the employee leave section submit requests?
### Answer:
`EmployeeLeaves.jsx` validates leave application data using `leaveSchemas.applyLeave` and then posts it to `/leaves/apply`. It also loads leave history and displays status indicators for pending, approved, and rejected leave requests.

## 7. What optimization patterns are present in employee pages?
### Answer:
- concurrent `Promise.all()` for dashboard API calls
- pagination and backend page/limit support
- cached Redux parameters to avoid unnecessary refetches
- lazy-loading page components with `React.lazy` and `Suspense`
- local UI state for modals and forms, Redux for shared domain data

## 8. Why is `validateForm` used? Why not trust raw form state?
### Answer:
`validateForm` ensures frontend data meets expected contracts before it is sent to the backend. This prevents invalid payloads and gives the user faster validation feedback.

## 9. What is the difference between owner and employee state handling?
### Answer:
Owners manage team-level data and approvals, so the owner slices include search filters, selected targets, and shared lists. Employees manage personal data, so employee slices focus on their own history, page state, and action states.

## 10. Logical scenario question for employee features:

### Q: How would you handle a clock-in action when the employee has lost network connectivity?
### A:
A resilient approach would queue the clock-in request locally and retry when connectivity returns. The current implementation shows a toast error on failure, but offline support would require a service worker or local storage queue.

## 11. What are the employee payroll section considerations?
### Answer:
`EmployeePayroll.jsx` likely shows salary records, payslip history, and amount details. Employee payroll should avoid exposing other users’ payroll data and rely on backend authorization.

## 12. Why separate `profile` into its own route?
### Answer:
Employee profile is personal and editable data that is distinct from attendance and payroll functions. Putting it under `/employee/profile` improves clarity and keeps the layout consistent with role-based routing.

## 13. Example optimization question:

### Q: How can you reduce CPU work when rendering a large employee leave history table?
### A:
- use virtualization (react-window/react-virtualized)
- fetch smaller pages from the server
- avoid re-rendering unchanged rows with `React.memo`
- keep row rendering simple and avoid expensive calculations inside JSX

## 14. Behavior question:

### Q: Why should the employee panel still check for `token` in Redux before rendering?
### A:
Because an expired or missing token means the employee should not see protected pages. `ProtectedRoute` enforces this and ensures unauthorized access is redirected to `/login`.
