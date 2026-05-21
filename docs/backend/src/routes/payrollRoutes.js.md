# backend/src/routes/payrollRoutes.js

## 1. Overview
`backend/src/routes/payrollRoutes.js` registers endpoints for the payroll module.

## 2. Key Responsibilities & Flow
- Protects all routes under this module using the `protect` middleware.
- **`GET /history`**: Validates parameters against `ownerSchemas.historyQuery` and routes to `getPayrollHistory`.
- **`POST /generate`**: Secures access to owners (`isAuthorized()`) and routes to `generateCompanyPayroll`.
- **`GET /tenure/download`**: Routes to `downloadTenurePayslip` (accessible by owners and employees).
- **`GET /:id/download`**: Routes to `downloadPayslip` (accessible by owners and employees, with record ownership validation enforced in the controller).

## 3. Code Patterns & Best Practices
- Implements validation on query parameters for history requests.
- Restricts bulk payroll creation exclusively to owners.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Consumed by [EmployeePayroll.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/payroll/EmployeePayroll.jsx.md) and [OwnerPayroll.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/payroll/OwnerPayroll.jsx.md) components in the client application.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports**: Imports Express, validation and authentication middlewares, owner schemas, and payroll controller methods.
2. **Router Setup**: Instantiates the Express router and sets global request authentication.
3. **Route Mappings**: Sets up endpoints for payroll logs, bulk calculation (owner-only), and PDF downloads.
4. **Module Export**: Exports the payroll routes router.

- **Lines 1-5 (Imports)**:
  - **Basic Function**: Import dependencies and modules.
  - **Detailed Explanation**: Imports `express` (Line 1), authorization guards `protect` and `isAuthorized` (Line 2), validation middleware `validateQuery` (Line 3), schema configurations `ownerSchemas` (Line 4), and `payrollController` actions (Line 5).
- **Lines 7-9 (Router Setup)**:
  - **Basic Function**: Instantiate router and set authentication requirement.
  - **Detailed Explanation**: Instantiates the router instance `express.Router()` (Line 7). It configures the router to run the `protect` middleware on all endpoints (Line 9), validating that the user is logged in.
- **Lines 11-14 (Route Mappings)**:
  - **Basic Function**: Define specific routes, role access, and controllers.
  - **Detailed Explanation**:
    - `GET /history` validates pagination parameters using `ownerSchemas.historyQuery` before calling `getPayrollHistory` (Line 11).
    - `POST /generate` verifies that the logged-in user is an owner using `isAuthorized()` before triggering `generateCompanyPayroll` (Line 12).
    - `GET /tenure/download` routes to `downloadTenurePayslip` to print payslips over a specified timeframe (Line 13).
    - `GET /:id/download` routes to `downloadPayslip` to print a single payslip by ID (Line 14).
- **Line 15 (Module Export)**:
  - **Basic Function**: Export the router.
  - **Detailed Explanation**: Exports `router` (Line 15) using standard CommonJS modules.
