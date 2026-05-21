# backend/src/routes/attendanceRoutes.js

## 1. Overview
`backend/src/routes/attendanceRoutes.js` registers attendance endpoints under `/api/attendance/` and binds them to authorization middleware, request validation schemas, and controller actions.

## 2. Key Responsibilities & Flow
Maps paths to the following middleware/controller chains:
- **`POST /clock-in`**: Protected endpoint that invokes `clockIn` in `attendanceController.js`.
- **`PUT /clock-out`**: Protected endpoint that invokes `clockOut` in `attendanceController.js`.
- **`GET /history`**: Protected endpoint that validates optional query parameters (such as `targetUserId`, `page`, and `limit`) using the `validateQuery(ownerSchemas.historyQuery)` middleware before triggering `getAttendanceHistory` in `attendanceController.js`.

## 3. Code Patterns & Best Practices
- **Global Router-Level Protection**: Employs `router.use(protect)` to secure all defined endpoints underneath, ensuring that unauthenticated requests are rejected early.
- **Query Validation Middleware**: Uses the decoupled `validateQuery` middleware instead of standard body validation, ensuring that pagination offsets and user filters conform to schema formats prior to database querying.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- **Endpoints mapping**:
  - Exposes the paths consumed by `EmployeeAttendance.jsx` for clocking in/out, and by both `EmployeeAttendance.jsx` and `OwnerAttendance.jsx` to render logs.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports**: Imports Express, authentication middleware, validation middleware, owner schemas, and the attendance controller.
2. **Router Setup**: Configures the Express router and registers the authentication middleware globally for these endpoints.
3. **Route Mappings**: Declares endpoints for clock-in, clock-out, and attendance history with query validation.
4. **Module Export**: Exports the configured router object.

- **Lines 1-5 (Imports)**:
  - **Basic Function**: Import dependencies and modules.
  - **Detailed Explanation**: Imports `express` (Line 1), authorization guard `protect` (Line 2), query validation middleware `validateQuery` (Line 3), schema configurations `ownerSchemas` (Line 4), and `attendanceController` actions (Line 5).
- **Lines 7-9 (Router Setup)**:
  - **Basic Function**: Instantiate router and declare middleware.
  - **Detailed Explanation**: Instantiates the router instance `express.Router()` (Line 7). It applies `protect` as a global middleware (Line 9), ensuring any incoming requests to these endpoints must have a valid JWT.
- **Lines 11-13 (Route Mappings)**:
  - **Basic Function**: Set HTTP routes and validation handlers.
  - **Detailed Explanation**:
    - `POST /clock-in` maps to `clockIn` (Line 11).
    - `PUT /clock-out` maps to `clockOut` (Line 12).
    - `GET /history` validates pagination/user query parameters using `ownerSchemas.historyQuery` and maps to `getAttendanceHistory` (Line 13).
- **Line 15 (Module Export)**:
  - **Basic Function**: Export the router.
  - **Detailed Explanation**: Exports `router` (Line 15) using CommonJS to be loaded in the main Express application.
