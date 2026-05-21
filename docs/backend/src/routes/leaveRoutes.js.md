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
- **Lines 7-9 (Router Setup)**:
  - **Basic Function**: Instantiate router and require authentication.
  - **Detailed Explanation**: Instantiates the router instance `express.Router()` (Line 7). It configures the router to run the `protect` middleware on all endpoints (Line 9), requiring valid sessions.
- **Lines 12-13 (Employee & Shared Routes)**:
  - **Basic Function**: Define endpoints to submit and read leave requests.
  - **Detailed Explanation**:
    - `POST /apply` validates request bodies against `leaveSchemas.applyLeave` before calling `applyLeave` (Line 12).
    - `GET /history` validates pagination and target user parameters using `leaveSchemas.historyQuery` before calling `getLeaveHistory` (Line 13).
- **Line 16 (Owner-Only Routes)**:
  - **Basic Function**: Define endpoint to mutate leave states.
  - **Detailed Explanation**: `PUT /:leaveId/status` restricts access to owners using `isAuthorized()`, validates request bodies using `leaveSchemas.updateLeaveStatus`, and calls `updateLeaveStatus` (Line 16).
- **Line 18 (Module Export)**:
  - **Basic Function**: Export the router.
  - **Detailed Explanation**: Exports `router` (Line 18) using CommonJS.
