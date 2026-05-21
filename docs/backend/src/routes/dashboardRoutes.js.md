# backend/src/routes/dashboardRoutes.js

## 1. Overview
`backend/src/routes/dashboardRoutes.js` registers endpoints for fetching dashboard metrics.

## 2. Key Responsibilities & Flow
- Implements the `protect` middleware to require valid user sessions.
- **`GET /stats`**: Secures access exclusively to owners (`isAuthorized("owner")`) and routes requests to the `getDashboardStats` controller handler.

## 3. Code Patterns & Best Practices
- Implements role protection directly at the routing level to restrict dashboard data queries to owners.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Queried by the stats widgets in [EmployeeDashboard.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/reports/EmployeeDashboard.jsx.md).

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports**: Imports Express, authentication middlewares, and the dashboard controller.
2. **Router Setup**: Instantiates the router and forces request authentication globally.
3. **Route Mapping**: Declares the stats lookup endpoint for dashboard widgets.
4. **Module Export**: Exports the dashboard router.

- **Lines 1-3 (Imports)**:
  - **Basic Function**: Import dependencies and modules.
  - **Detailed Explanation**: Imports `express` (Line 1), authentication/authorization hooks `protect` and `isAuthorized` (Line 2), and `dashboardController` (Line 3).
  - **Key Function Calls**:
    - `require("express")`: Loads the Express module. Used to obtain the Express framework. Parameters: `"express"`. Returns: the Express function/object.
    - `require("../middleware/authMiddleware")`: Loads the authentication/authorization middleware module. Used to import the authentication protection and authorization verification functions. Parameters: `"../middleware/authMiddleware"`. Returns: an object containing middleware functions (`protect`, `isAuthorized`).
    - `require("../controllers/dashboardController")`: Loads the dashboard controller module. Used to import the controller logic for dashboard stats. Parameters: `"../controllers/dashboardController"`. Returns: an object containing the dashboard controller route handler functions.
- **Lines 5-7 (Router Setup)**:
  - **Basic Function**: Instantiate router and require authentication.
  - **Detailed Explanation**: Instantiates the router instance `express.Router()` (Line 5). It registers `protect` (Line 7) as a global middleware so all incoming requests must have a valid JWT.
  - **Key Function Calls**:
    - `express.Router()`: Instantiates and returns a new Express router object. Used to define isolated paths and middleware. Parameters: none. Returns: a new Router instance.
    - `router.use(protect)`: Mounts the `protect` middleware on the router. Used to authenticate all incoming requests for any routes registered on this router. Parameters: `protect` (middleware function). Returns: the router instance.
- **Line 9 (Route Mapping)**:
  - **Basic Function**: Define secure stats fetch endpoint.
  - **Detailed Explanation**: `GET /stats` validates that the user is specifically an owner using `isAuthorized("owner")` before calling the controller's `getDashboardStats` method (Line 9).
  - **Key Function Calls**:
    - `isAuthorized("owner")`: Invokes the authorization middleware factory with the role `"owner"`. Used to check if the authenticated user's role is `"owner"`. Parameters: `"owner"`. Returns: a middleware function.
    - `router.get("/stats", isAuthorized("owner"), dashboardController.getDashboardStats)`: Registers a route handler for HTTP GET requests at `"/stats"`. Used to map the path to the controller while running authorization middleware first. Parameters: `"/stats"` (the route path), `isAuthorized("owner")` (middleware function), `dashboardController.getDashboardStats` (controller handler function). Returns: the router instance.
- **Line 11 (Module Export)**:
  - **Basic Function**: Export the router.
  - **Detailed Explanation**: Exports `router` (Line 11) using CommonJS.
  - **Key Function Calls**: None.
