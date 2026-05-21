# backend/src/routes/leaveRoutes.js

## 1. Overview
`backend/src/routes/leaveRoutes.js` registers endpoints for leave requests and binds them to validation schemas and controller handlers.

## 2. Key Responsibilities & Flow
- Applies the `protect` middleware universally to ensure all routes require a valid JWT.
- **`POST /apply`**: Validates parameters against `leaveSchemas.applyLeave` and routes to `applyLeave`.
- **`GET /history`**: Validates query parameters against `leaveSchemas.historyQuery` and routes to `getLeaveHistory`.
- **`PUT /:leaveId/status`**: Restricts access to owners (`isAuthorized()`), validates parameters against `leaveSchemas.updateLeaveStatus`, and routes to `updateLeaveStatus`.

## 3. Code Patterns & Best Practices
- **Route-Level Permission Guards**: Combines JWT checks (`protect`) and role-based access checks (`isAuthorized()`) at the router layer to secure administrative actions.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Exposes routes consumed by the frontend leave feature views: [EmployeeLeaves.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/leaves/EmployeeLeaves.jsx.md) and [OwnerLeaves.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/leaves/OwnerLeaves.jsx.md).

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports**: Imports Express, validation and authorization middlewares, leave schemas, and the leave controller.
2. **Router Setup**: Instantiates the Express router and enforces JWT authentication globally.
3. **Employee & Shared Routes**: Defines endpoints to apply for leaves and view history logs.
4. **Owner-Only Routes**: Defines the endpoint for owners to approve or reject leave requests.
5. **Module Export**: Exports the leave routes router.

- **Lines 1-5 (Imports)**:
  - **Basic Function**: Import dependencies and modules.
  - **Detailed Explanation**: Imports `express` (Line 1), authorization guards `protect` and `isAuthorized` (Line 2), validation middleware helpers (Line 3), schema validators `leaveSchemas` (Line 4), and `leaveController` actions (Line 5).
  - **Key Function Calls**:
    - `require("express")`: Loads the Express module. Used to obtain the Express framework. Parameters: `"express"`. Returns: the Express function/object.
    - `require("../middleware/authMiddleware")`: Loads the authentication and authorization middlewares. Parameters: `"../middleware/authMiddleware"`. Returns: an object containing `protect` and `isAuthorized`.
    - `require("../middleware/validationMiddleware")`: Loads the validation middleware creators. Parameters: `"../middleware/validationMiddleware"`. Returns: an object containing `validate` and `validateQuery`.
    - `require("../schemas/leaveSchemas")`: Loads the schemas for leave requests validation. Parameters: `"../schemas/leaveSchemas"`. Returns: the validation schemas object.
    - `require("../controllers/leaveController")`: Loads the leave controller module. Parameters: `"../controllers/leaveController"`. Returns: an object containing controller route handlers.
- **Lines 7-9 (Router Setup)**:
  - **Basic Function**: Instantiate router and require authentication.
  - **Detailed Explanation**: Instantiates the router instance `express.Router()` (Line 7). It configures the router to run the `protect` middleware on all endpoints (Line 9), requiring valid sessions.
  - **Key Function Calls**:
    - `express.Router()`: Instantiates and returns a new Express router. Parameters: none. Returns: a new Router instance.
    - `router.use(protect)`: Mounts the `protect` middleware on the router. Used to authenticate all incoming requests for any routes registered on this router. Parameters: `protect` (middleware function). Returns: the router instance.
- **Lines 12-13 (Employee & Shared Routes)**:
  - **Basic Function**: Define endpoints to submit and read leave requests.
  - **Detailed Explanation**:
    - `POST /apply` validates request bodies against `leaveSchemas.applyLeave` before calling `applyLeave` (Line 12).
    - `GET /history` validates pagination and target user parameters using `leaveSchemas.historyQuery` before calling `getLeaveHistory` (Line 13).
  - **Key Function Calls**:
    - `validate(leaveSchemas.applyLeave)`: Creates a middleware function to validate request body fields against the `applyLeave` schema. Parameters: `leaveSchemas.applyLeave`. Returns: a validation middleware function.
    - `router.post("/apply", validate(...), leaveController.applyLeave)`: Registers a POST route handler for leave applications. Parameters: `"/apply"`, `validate` middleware, `leaveController.applyLeave` handler. Returns: the router instance.
    - `validateQuery(leaveSchemas.historyQuery)`: Creates a middleware function to validate query parameters against the `historyQuery` schema. Parameters: `leaveSchemas.historyQuery`. Returns: a query validation middleware function.
    - `router.get("/history", validateQuery(...), leaveController.getLeaveHistory)`: Registers a GET route handler to retrieve leave history. Parameters: `"/history"`, `validateQuery` middleware, `leaveController.getLeaveHistory` handler. Returns: the router instance.
- **Line 16 (Owner-Only Routes)**:
  - **Basic Function**: Define endpoint to mutate leave states.
  - **Detailed Explanation**: `PUT /:leaveId/status` restricts access to owners using `isAuthorized()`, validates request bodies using `leaveSchemas.updateLeaveStatus`, and calls `updateLeaveStatus` (Line 16).
  - **Key Function Calls**:
    - `isAuthorized()`: Invokes the authorization middleware factory. Configured with default arguments to restrict access to owners. Parameters: none. Returns: an authorization middleware function.
    - `validate(leaveSchemas.updateLeaveStatus)`: Creates a middleware function to validate update leave status request bodies. Parameters: `leaveSchemas.updateLeaveStatus`. Returns: a validation middleware function.
    - `router.put("/:leaveId/status", isAuthorized(), validate(...), leaveController.updateLeaveStatus)`: Registers a PUT route handler to update the status of a leave. Parameters: `"/:leaveId/status"`, `isAuthorized()` middleware, `validate` middleware, `leaveController.updateLeaveStatus` handler. Returns: the router instance.
- **Line 18 (Module Export)**:
  - **Basic Function**: Export the router.
  - **Detailed Explanation**: Exports `router` (Line 18) using CommonJS.
  - **Key Function Calls**: None.
