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
- **Lines 5-7 (Router Setup)**:
  - **Basic Function**: Instantiate router and require authentication.
  - **Detailed Explanation**: Instantiates the router instance `express.Router()` (Line 5). It registers `protect` (Line 7) as a global middleware so all incoming requests must have a valid JWT.
- **Line 9 (Route Mapping)**:
  - **Basic Function**: Define secure stats fetch endpoint.
  - **Detailed Explanation**: `GET /stats` validates that the user is specifically an owner using `isAuthorized("owner")` before calling the controller's `getDashboardStats` method (Line 9).
- **Line 11 (Module Export)**:
  - **Basic Function**: Export the router.
  - **Detailed Explanation**: Exports `router` (Line 11) using CommonJS.
