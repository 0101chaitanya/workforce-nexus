# backend/src/controllers/attendanceController.js

## 1. Overview
`backend/src/controllers/attendanceController.js` handles attendance logging (clocking in and clocking out) and retrieves daily/historical records for either the logged-in employee or (in the case of the owner) other specific employees.

## 2. Key Responsibilities & Flow
Exposes the following endpoint handlers:
- **`clockIn`**: Fetches the user ID and company ID from `req.user` and `req.company`. Determines if the user has already clocked in for the calendar day by querying for a record with a `date` greater than or equal to midnight today. If a record exists, returns a `400` status; otherwise, initializes a new `Attendance` record with the current timestamp as both `date` and `checkInTime`, sets the status to `"present"`, and saves it.
- **`clockOut`**: Finds the attendance record for the current day. Returns a `404` status if no check-in record exists for today, or a `400` status if the user is already clocked out. Otherwise, sets `checkOutTime` to the current timestamp, calculates the total hours worked (in milliseconds converted to fractional hours formatted to two decimal points), and saves the updated record.
- **`getAttendanceHistory`**: Resolves historical attendance records. If the requester has the `owner` role, they can optionally specify a `targetUserId` in the query to inspect another user's logs; otherwise, the query is restricted to their own user ID. Supports page-based pagination using the `page` and `limit` query parameters, or returns the entire history if pagination parameters are absent. Results are sorted in descending order of date (`date: -1`) and populate user details (`fullName`, `email`, `position`, `identity`).

## 3. Code Patterns & Best Practices
- **Date Matching Filters**: Standardizes today's date boundary by setting the time components to zero (`setHours(0, 0, 0, 0)`) to check for existing records using range operators (`$gte: today`).
- **Precision Floating Point Hour Metrics**: Converts timestamp differences into hours with `.toFixed(2)` and wraps it with `parseFloat()` to store hours as numeric float primitives in MongoDB.
- **Dynamic Populate Pattern**: Employs Mongoose `.populate('user', 'fullName email position identity')` to avoid exposing authentication-related fields (like hashes or OTP values) in the user object.
- **Dynamic Pagination**: Implements custom pagination logic with `countDocuments()`, `skip()`, and `limit()` if query parameters are defined, returning structured cursor fields (`hasNext`, `hasPrev`, `totalPages`, `total`).

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- **Endpoints mapping**:
  - `POST /api/attendance/clock-in` -> Dispatched by the frontend attendance component (`EmployeeAttendance.jsx`) when the user clicks the "Clock In" button.
  - `PUT /api/attendance/clock-out` -> Dispatched by the frontend attendance component (`EmployeeAttendance.jsx`) when the user clicks the "Clock Out" button.
  - `GET /api/attendance/history` -> Queried by both `EmployeeAttendance.jsx` (for standard employees) and `OwnerAttendance.jsx` (for the owner) to show historical logs with optional pagination controls.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Lines 1-3 (Imports)**: Import Mongoose models and logger.
2. **Lines 5-52 (clockIn)**: Route handler to clock-in for the day. Normalizes today's date to midnight, checks if a record already exists, creates and saves a new attendance record with `'present'` status, and handles errors.
3. **Lines 54-106 (clockOut)**: Route handler to clock-out. Normalizes date to midnight, searches for today's clock-in record, checks if already clocked out, calculates worked hours based on time difference, saves record, and handles errors.
4. **Lines 108-171 (getAttendanceHistory)**: Route handler to query attendance logs. Resolves query parameters, restricts queries to user's company context, dynamically filters based on user role (employees restricted to own records, owners can view all or filter by target employee), handles pagination (if page/limit are provided) or returns full array, and populates user info.

- **Lines 1-3 (Imports)**:
  - **Basic Function**: Import dependencies.
  - **Detailed Explanation**: Imports `Attendance` model for db queries, `mongoose` for object IDs, and the Winston `logger` wrapper for logging errors.
  - **Key Function Calls**:
    - `require(path)`: Imports external modules or files (`../models/Attendance`, `mongoose`, `../utils/logger`). Returns the exported module contents.
- **Lines 5-52 (clockIn)**:
  - **Basic Function**: Create a clock-in record for the current day.
  - **Detailed Explanation**: Fetches user and company ID. Normalizes `today` to midnight. Checks if an attendance record exists for the user and company dated today or later. If found, returns a `400 Bad Request`. Otherwise, instantiates a new `Attendance` document with the current timestamp as `date` and `checkInTime`, and sets status to `"present"`. Saves to database and returns the record with `201 Created`. Catches errors, logs them, and returns `500 Internal Server Error`.
  - **Key Function Calls**:
    - `new Date()`: Instantiates new Date objects to reference today's date boundary or check-in time. Returns a Date object.
    - `today.setHours(0, 0, 0, 0)`: Normalizes the date's time fields to midnight. Returns the millisecond representation of that midnight timestamp.
    - `Attendance.findOne(query)`: Queries the database for an attendance record that starts on or after today's midnight. Returns a Mongoose Query.
    - `res.status(statusCode)`: Sets the HTTP status code on the response object. Returns the Express response object.
    - `res.json(body)`: Returns a JSON response with the message and metadata. Returns the Express response object.
    - `new Date().toISOString()`: Generates current date timestamp in ISO format. Returns a string.
    - `new Attendance(properties)`: Instantiates a new Mongoose Attendance document. Returns the document instance.
    - `attendance.save()`: Persists the new attendance record to the database. Returns a Promise.
    - `logger.error(message, meta)`: Logs errors during clock-in. Returns undefined.
- **Lines 54-106 (clockOut)**:
  - **Basic Function**: Update a clock-in record with check-out time and calculate duration.
  - **Detailed Explanation**: Retrieves today's midnight timestamp. Queries the database for the active user's attendance record for today. Returns `404 Not Found` if no check-in record is found. Returns `400 Bad Request` if the user is already clocked out. Sets the check-out time to the current date, computes the difference in milliseconds, divides by 3.6 million to calculate total hours worked, formats to two decimal places, saves, and returns the modified attendance document.
  - **Key Function Calls**:
    - `new Date()`: Instantiates new Date objects to reference the check-out or reference times. Returns a Date object.
    - `today.setHours(0, 0, 0, 0)`: Standardizes the date to midnight. Returns a millisecond timestamp.
    - `Attendance.findOne(query)`: Queries the database for the employee's clock-in record for today. Returns a Mongoose Query.
    - `res.status(statusCode)`: Sets the response HTTP status. Returns the Express response object.
    - `res.json(body)`: Returns a JSON response. Returns the Express response object.
    - `new Date().toISOString()`: Generates current date timestamp in ISO format. Returns a string.
    - `number.toFixed(fractionDigits)`: Converts the calculated working hours float to a string with exactly 2 decimal places. Returns a string.
    - `parseFloat(string)`: Parses the decimal hour string to a floating-point number. Returns a number.
    - `attendance.save()`: Updates and saves the attendance record with check-out details. Returns a Promise.
    - `logger.error(message, meta)`: Logs errors during clock-out. Returns undefined.
- **Lines 108-171 (getAttendanceHistory)**:
  - **Basic Function**: Retrieve log history with optional filters and pagination.
  - **Detailed Explanation**: Extracts `targetUserId`, `page`, and `limit` from queries. Restricts queries to the company. If the user is an owner, they can query all logs or filter by `targetUserId`. Employees can only view their own logs. If `page` and `limit` are supplied, performs a Mongoose `.skip()` and `.limit()` query to return a paginated object. Otherwise, returns the complete set of logs. Projections and populated user details are returned.
  - **Key Function Calls**:
    - `parseInt(string)`: Parses the page/limit string query parameters to base-10 integers. Returns an integer or `NaN`.
    - `Attendance.countDocuments(query)`: Returns the total number of attendance records matching query criteria. Returns a Promise resolving to a number.
    - `Attendance.find(query)`: Searches database for attendance logs. Returns a Mongoose Query.
    - `query.populate(path, select)`: Populates referenced user info with specified fields (`fullName`, `email`, `position`, `identity`). Returns a Mongoose Query.
    - `query.sort(sortOption)`: Sorts attendance logs descending by date (`{ date: -1 }`). Returns a Mongoose Query.
    - `query.skip(skip)`: Sets pagination offset. Returns a Mongoose Query.
    - `query.limit(limitNum)`: Restricts pagination limit size. Returns a Mongoose Query.
    - `Math.ceil(number)`: Rounds total page calculation division upward to the nearest integer. Returns a number.
    - `res.status(statusCode)`: Sets response HTTP status. Returns the Express response object.
    - `res.json(body)`: Returns JSON payload. Returns the Express response object.
    - `logger.error(message, meta)`: Logs errors during retrieval. Returns undefined.
    - `new Date().toISOString()`: Generates error timestamp. Returns a string.

