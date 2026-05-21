# backend/src/controllers/leaveController.js

## 1. Overview
`backend/src/controllers/leaveController.js` manages time-off operations. It supports leave application submission, retrieval of history (with pagination and filtering options), and owner approval/rejection updates.

## 2. Key Responsibilities & Flow
- **`applyLeave`**:
  1. Validates that the requested `startDate` does not fall after the `endDate`.
  2. Saves a new `Leave` document with a `"pending"` status, referencing the user and company IDs.
- **`getLeaveHistory`**:
  1. Extracts query parameters (`targetUserId`, `page`, `limit`).
  2. Restricts query scopes based on permissions:
     - Owners can view all logs under their company, optionally filtered by `targetUserId`.
     - Employees are strictly restricted to their own entries (`query.user = req.user._id`).
  3. Counts leaves by status (`pending`, `approved`, `rejected`) to generate statistics cards (`stats`).
  4. If pagination keys are supplied, returns sliced pages using `.skip()` and `.limit()` along with metadata. Otherwise, lists the complete set sorted by creation date.
- **`updateLeaveStatus`**:
  1. Intercepts put requests on target leaves (`leaveId`).
  2. Updates `status` and `remarks` fields.
  3. Restricts scopes to the owner's company context.

## 3. Code Patterns & Best Practices
- **Role-Aware Context Resolution**: Filters queries based on the active role (`req.user.role`) within the controller to enforce row-level security.
- **Unified Statistics**: Resolves counts for all states inside history queries to allow dashboards to load stats using a single query.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- **UI Elements**:
  - Submitting requests maps to `EmployeeLeaves.jsx` form inputs.
  - History feeds the paginated tables in `EmployeeLeaves.jsx` and `OwnerLeaves.jsx`.
  - Updating status maps to check/cross click events inside the owner's review lists (`OwnerLeaves.jsx`).

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Lines 1-2 (Imports)**: Import `Leave` model and `logger`.
2. **Lines 4-44 (applyLeave)**: Route handler for submitting a leave request. Validates dates, instantiates a Leave document with `"pending"` status, saves to database, and logs errors.
3. **Lines 46-119 (getLeaveHistory)**: Route handler to fetch leave history. Performs role-based query authorization, counts documents by status to assemble statistics, handles optional page/limit pagination, populates user info, and returns results.
4. **Lines 121-142 (updateLeaveStatus)**: Route handler for owner to approve or reject a leave request. Modifies `status` and `remarks`, updates in database, and returns the modified record.

- **Lines 1-2 (Imports)**:
  - **Basic Function**: Import dependencies.
  - **Detailed Explanation**: Imports the Mongoose `Leave` model for querying and creating leave records, and imports the custom Winston logger utility for error tracking.
  - **Key Function Calls**:
    - `require("../models/Leave")`: Loads the Leave database model. Parameter: `"../models/Leave"`. Returns: the Leave Mongoose model.
    - `require("../utils/logger")`: Loads the Winston logger module. Parameter: `"../utils/logger"`. Returns: the custom logger utility.
- **Lines 4-44 (applyLeave)**:
  - **Basic Function**: Handle leave application creation for employees.
  - **Detailed Explanation**: Extracts `type`, `startDate`, `endDate`, and `reason` from the request body, and retrieves the current user's ID and company ID from the request object. Checks if the `startDate` is after the `endDate`, returning a `400 Bad Request` if true. Creates and saves a new `Leave` document with a `"pending"` status. If successful, returns the created record with a `201 Created` code. Catches and logs errors, returning a `500 Internal Server Error`.
  - **Key Function Calls**:
    - `new Date(startDate)`: Converts a date-related input into a JavaScript Date object. Parameter: `startDate` (string). Returns: a Date instance.
    - `new Date(endDate)`: Converts a date-related input into a JavaScript Date object. Parameter: `endDate` (string). Returns: a Date instance.
    - `res.status(400)`: Sets the HTTP response status code to 400. Parameter: `400`. Returns: the Express Response object.
    - `res.status(code).json(data)`: Sends a JSON response with the given payload. Parameter: a response object. Returns: the Express Response object.
    - `new Date().toISOString()` (multiple instances): Retrieves the current system date and converts it to ISO 8601 string format. Parameters: none. Returns: an ISO date string.
    - `new Leave(...)`: Creates an unsaved instance of the Leave model. Parameter: fields object. Returns: a new Leave document.
    - `leave.save()`: Persists the Leave document in MongoDB. Parameters: none. Returns: a Promise resolving to the saved document.
    - `res.status(201)`: Sets the HTTP response status code to 201. Parameter: `201`. Returns: the Express Response object.
    - `logger.error(...)`: Logs an error message and metadata. Parameters: message string, metadata object. Returns: none.
    - `res.status(500)`: Sets the HTTP response status code to 500. Parameter: `500`. Returns: the Express Response object.
- **Lines 46-119 (getLeaveHistory)**:
  - **Basic Function**: Retrieve leave history with statistics and optional pagination.
  - **Detailed Explanation**: Parses `targetUserId`, `page`, and `limit` from the query string. Restricts the query to the user's company. If the user is an owner, they can query all leaves or filter by `targetUserId`. Employees can only view their own leave requests (`query.user = req.user._id`). Counts the number of leaves for `pending`, `approved`, and `rejected` statuses using `Leave.countDocuments()` to compile a `stats` object. If pagination parameters exist, calculates the offset, retrieves a paginated subset sorted descending by creation date, populates user profile details, and returns a paginated response. Otherwise, retrieves and returns all matching leave documents.
  - **Key Function Calls**:
    - `Leave.countDocuments(query)` (multiple instances): Counts the database documents matching the query conditions. Parameter: query filters object. Returns: a Promise resolving to the match count (integer).
    - `parseInt(value)` (multiple instances): Parses a string to extract an integer value. Parameter: input string. Returns: parsed integer or NaN.
    - `Leave.find(query)`: Creates a query to find documents matching the specified filters. Parameter: query filters object. Returns: a Mongoose Query object.
    - `query.populate(path, select)`: Populates referenced sub-documents in the query results with specific fields. Parameters: path string, fields string. Returns: a Mongoose Query object.
    - `query.sort(criteria)`: Configures the sorting order of query results. Parameter: sort criteria object. Returns: a Mongoose Query object.
    - `query.skip(count)`: Configures the number of matched documents to skip. Parameter: skip offset integer. Returns: a Mongoose Query object.
    - `query.limit(count)`: Configures the maximum number of documents to retrieve. Parameter: limit integer. Returns: a Mongoose Query object.
    - `Math.ceil(value)`: Computes the smallest integer greater than or equal to a number. Parameter: numeric expression. Returns: calculated integer.
    - `res.status(200)`: Sets the HTTP response status code to 200. Parameter: `200`. Returns: the Express Response object.
    - `logger.error(...)`: Logs an error message and metadata. Parameters: message string, metadata object. Returns: none.
    - `res.status(500)`: Sets the HTTP response status code to 500. Parameter: `500`. Returns: the Express Response object.
- **Lines 121-142 (updateLeaveStatus)**:
  - **Basic Function**: Update status and remarks on a leave request (Approve/Reject).
  - **Detailed Explanation**: Extracts `leaveId` from URL path parameters, and `status` and `remarks` from the body. Uses Mongoose `findOneAndUpdate()` to locate the leave document (restricted by company ID) and update its `status` and `remarks`. If no matching leave is found, returns a `404 Not Found`. Otherwise, returns a `200 OK` status and the updated leave document populated with user email and name.
  - **Key Function Calls**:
    - `Leave.findOneAndUpdate(filter, update, options)`: Updates a single document that matches filters. Parameters: query filter object, fields update object, options object (`{ new: true }` to return the updated record). Returns: a Mongoose Query object.
    - `query.populate(path, select)`: Populates referenced sub-documents in the updated leave record. Parameters: path string, fields string. Returns: a Promise resolving to the populated document (or null).
    - `res.status(404)`: Sets the HTTP response status code to 404. Parameter: `404`. Returns: the Express Response object.
    - `res.status(200)`: Sets the HTTP response status code to 200. Parameter: `200`. Returns: the Express Response object.
    - `logger.error(...)`: Logs an error message and metadata. Parameters: message string, metadata object. Returns: none.
    - `res.status(500)`: Sets the HTTP response status code to 500. Parameter: `500`. Returns: the Express Response object.

