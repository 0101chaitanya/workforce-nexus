# backend/src/controllers/dashboardController.js

## 1. Overview
`backend/src/controllers/dashboardController.js` compiles real-time administrative metrics. It queries multiple database collections (Users, Leaves, Attendance, and Payroll) to construct a summary of organization metrics.

## 2. Key Responsibilities & Flow
- **`getDashboardStats`**:
  1. **Total Employees**: Counts all active documents in the `User` collection with the role `'employee'` matching the owner's company (`company: companyId`).
  2. **Leaves Metrics**: Checks the `Leave` collection for approved records overlapping the current day.
  3. **Attendance Metrics**: Counts the number of employee check-in logs submitted for the current calendar date.
  4. **Payroll Spend**:
     - Finds the most recent period records in the `Payroll` collection.
     - Sums the net disbursements for all employees to calculate the total monthly organizational spend.
  5. Returns a structured JSON summary payload.

## 3. Code Patterns & Best Practices
- **Date Boundary Normalization**: Cleanses local server times to daily bounds (`00:00:00.000` to `23:59:59.999`) to prevent timezone query slips when filtering logs.
- **Dynamic Ledger Matching**: Queries payroll items dynamically instead of maintaining hardcoded caches.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Consumed by the statistics widgets in the frontend owner dashboard page ([EmployeeDashboard.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/reports/EmployeeDashboard.jsx.md)).
- Provides counts for the summary cards displayed in the UI.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Lines 1-5 (Imports)**: Import models (User, Payroll, Leave, Attendance) and logger.
2. **Lines 7-77 (getDashboardStats)**: Route handler that gathers metrics. Queries employee count, leaves overlapping today, attendance records today, retrieves the latest payroll period, aggregates net pay, and handles errors.

- **Lines 1-5 (Imports)**:
  - **Basic Function**: Import dependencies.
  - **Detailed Explanation**: Imports `User`, `Payroll`, `Leave`, and `Attendance` models to run counts and aggregate summaries, and `logger` for error diagnostics.
- **Lines 7-77 (getDashboardStats)**:
  - **Basic Function**: Fetch and calculate high-level dashboard metrics for a company.
  - **Detailed Explanation**:
    - Resolves company ID from the request.
    - Counts the documents in `User` matching the company ID with the role of `'employee'` (Lines 11-12).
    - Computes today's date boundaries from midnight to 23:59:59.999 (Lines 14-18).
    - Counts active leave requests that are approved and where today falls between their start and end dates (Lines 20-26).
    - Counts attendance logs dated today (Lines 28-32).
    - Finds the latest payroll record using `Payroll.findOne()` sorted descending by year and month. If found, finds all payroll records for that month/year, and uses `.reduce()` to aggregate `netPay` (Lines 34-53).
    - Returns the aggregated stats inside a `200 OK` JSON response. Catches errors, logs them, and responds with `500 Internal Server Error`.

