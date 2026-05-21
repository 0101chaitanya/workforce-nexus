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
  - **Key Function Calls**:
    - `require("../models/User")`: Loads the User model. Parameter: `"../models/User"`. Returns: the User Mongoose model.
    - `require("../models/Payroll")`: Loads the Payroll model. Parameter: `"../models/Payroll"`. Returns: the Payroll Mongoose model.
    - `require("../models/Leave")`: Loads the Leave model. Parameter: `"../models/Leave"`. Returns: the Leave Mongoose model.
    - `require("../models/Attendance")`: Loads the Attendance model. Parameter: `"../models/Attendance"`. Returns: the Attendance Mongoose model.
    - `require("../utils/logger")`: Loads the Winston logging module. Parameter: `"../utils/logger"`. Returns: the custom logger utility.
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
  - **Key Function Calls**:
    - `User.countDocuments(query)`: Counts total employee documents under the current company. Parameter: query filters object. Returns: a Promise resolving to count (integer).
    - `new Date()` (multiple instances): Instantiates a new Date object representing the current system time. Parameters: none. Returns: a Date instance.
    - `today.setHours(hours, min, sec, ms)`: Sets today's date object to the start of the day (midnight). Parameters: `0, 0, 0, 0`. Returns: timestamp integer.
    - `endOfToday.setHours(hours, min, sec, ms)`: Sets endOfToday's date object to the last millisecond of today. Parameters: `23, 59, 59, 999`. Returns: timestamp integer.
    - `Leave.countDocuments(query)`: Counts the active, approved leaves that overlap with today. Parameter: query filters object. Returns: a Promise resolving to count (integer).
    - `Attendance.countDocuments(query)`: Counts the attendance logs filed within today's date bounds. Parameter: query filters object. Returns: a Promise resolving to count (integer).
    - `Payroll.findOne(query)`: Fetches a single payroll document matching the company. Parameter: query filters object. Returns: a Mongoose Query object.
    - `query.sort(criteria)`: Sorts the payroll query results in descending order of year and month to find the latest period. Parameter: sort criteria object. Returns: a Promise resolving to the latest payroll document or null.
    - `Payroll.find(query)`: Finds all payroll documents matching the company and the latest period's month and year. Parameter: query filters object. Returns: a Promise resolving to an array of payroll documents.
    - `recentPayrolls.reduce(callback, initialValue)`: Computes the sum of all netPay fields in the fetched payroll array. Parameters: reducer function, initial value (`0`). Returns: cumulative total net pay (number).
    - `res.status(200)`: Sets the HTTP status code of the response to 200. Parameter: `200`. Returns: the Express Response object.
    - `res.status(code).json(data)` (multiple instances): Sends a JSON response with the given status code and data. Parameter: response payload object. Returns: the Express Response object.
    - `logger.error(...)`: Logs any execution errors with stack traces. Parameters: message string, metadata object. Returns: none.
    - `res.status(500)`: Sets the HTTP status code of the response to 500. Parameter: `500`. Returns: the Express Response object.

