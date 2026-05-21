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
  - **Key Function Calls**:
    - `require("express")`: Loads the Express module to create routers and manage middlewares. Parameters: `"express"` (string). Returns: The exported Express framework function/object.
    - `require("../middleware/authMiddleware")`: Loads the authentication middleware module. Parameters: `"../middleware/authMiddleware"` (string). Returns: An object containing `protect`.
    - `require("../middleware/validationMiddleware")`: Loads the validation middleware module. Parameters: `"../middleware/validationMiddleware"` (string). Returns: An object containing `validateQuery`.
    - `require("../schemas/ownerSchemas")`: Loads schemas configured for owner validations. Parameters: `"../schemas/ownerSchemas"` (string). Returns: The owner validation schemas object.
    - `require("../controllers/attendanceController")`: Loads the attendance controller module. Parameters: `"../controllers/attendanceController"` (string). Returns: The attendance controller actions object.
- **Lines 7-9 (Router Setup)**:
  - **Basic Function**: Instantiate router and declare middleware.
  - **Detailed Explanation**: Instantiates the router instance `express.Router()` (Line 7). It applies `protect` as a global middleware (Line 9), ensuring any incoming requests to these endpoints must have a valid JWT.
  - **Key Function Calls**:
    - `express.Router()`: Creates a new modular router instance. Parameters: None. Returns: A new Express router object.
    - `router.use(protect)`: Mounts the `protect` middleware globally on this router instance. Parameters: `protect` (middleware function). Returns: The router instance (for method chaining).
- **Lines 11-13 (Route Mappings)**:
  - **Basic Function**: Set HTTP routes and validation handlers.
  - **Detailed Explanation**:
    - `POST /clock-in` maps to `clockIn` (Line 11).
    - `PUT /clock-out` maps to `clockOut` (Line 12).
    - `GET /history` validates pagination/user query parameters using `ownerSchemas.historyQuery` and maps to `getAttendanceHistory` (Line 13).
  - **Key Function Calls**:
    - `router.post("/clock-in", attendanceController.clockIn)`: Registers a POST route handler for the clock-in endpoint. Parameters: `"/clock-in"` (string), `attendanceController.clockIn` (middleware function). Returns: The router instance.
    - `router.put("/clock-out", attendanceController.clockOut)`: Registers a PUT route handler for the clock-out endpoint. Parameters: `"/clock-out"` (string), `attendanceController.clockOut` (middleware function). Returns: The router instance.
    - `validateQuery(ownerSchemas.historyQuery)`: Creates a query validation middleware. Parameters: `ownerSchemas.historyQuery` (validation schema). Returns: A middleware function.
    - `router.get("/history", validateQuery(...), attendanceController.getAttendanceHistory)`: Registers a GET route handler for attendance history. Parameters: `"/history"` (string), query validation middleware, `attendanceController.getAttendanceHistory` (middleware function). Returns: The router instance.
- **Line 15 (Module Export)**:
  - **Basic Function**: Export the router.
  - **Detailed Explanation**: Exports `router` (Line 15) using CommonJS to be loaded in the main Express application.
  - **Key Function Calls**: None.
