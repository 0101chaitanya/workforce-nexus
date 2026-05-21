# backend/src/routes/userRoutes.js

## 1. Overview
`backend/src/routes/userRoutes.js` registers endpoints for managing profiles and user records.

## 2. Key Responsibilities & Flow
- Protects all routes under this module using the `protect` middleware.
- **`POST /add`**: Secures access to owners (`isAuthorized()`), validates the request body against `ownerSchemas.addUser`, and routes to `addUser`.
- **`GET /all`**: Secures access to owners, validates query parameters against `ownerSchemas.searchUsersQuery`, and routes to `searchUsers`.
- **`PUT /profile`**: Validates the request body against `userSchemas.updateProfile` and routes to `updateProfile`.
- **`PUT /change-password`**: Validates the request body against `userSchemas.changePassword` and routes to `changePassword`.
- **`GET /info/:id`**: Routes directly to `getUserById`.
- **`PUT /admin-update/:id`**: Secures access to owners, validates the request body against `userSchemas.updateUserByAdmin`, and routes to `updateUserByAdmin`.

## 3. Code Patterns & Best Practices
- Enforces strict input validation at the router layer before requests reach the controller handlers.
- Secures administrative actions using the `isAuthorized()` role guard.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Exposes routes consumed by the employee management views ([OwnerEmployees.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/employees/OwnerEmployees.jsx.md)) and profile views ([EmployeeProfile.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/profile/EmployeeProfile.jsx.md)) in the frontend application.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports**: Imports Express, authentication middlewares, validation handlers, schemas, and the user controller.
2. **Router Setup**: Instantiates the Express router and locks all routes behind the authentication check.
3. **Administrative Routes (Owner-Only)**: Exposes endpoints for adding users and listing all users with administrative role enforcement.
4. **Self-Service Routes**: Allows logged-in users to update their own profiles or change their passwords.
5. **Specific User Details & Admin Update Routes**: Exposes endpoints to retrieve user profiles by ID and allow admins to update employee records.
6. **Module Export**: Exports the routes router.

- **Lines 1-6 (Imports)**:
  - **Basic Function**: Import dependencies and modules.
  - **Detailed Explanation**: Imports `express` (Line 1), authorization guards `protect` and `isAuthorized` (Line 2), validation utilities `validate` and `validateQuery` (Line 3), owner schemas (Line 4), user schemas (Line 5), and the `userController` actions (Line 6).
- **Lines 8-10 (Router Setup)**:
  - **Basic Function**: Instantiate router and require authentication.
  - **Detailed Explanation**: Instantiates the router instance `express.Router()` (Line 8). It applies the `protect` middleware globally (Line 10) to require valid tokens for all these endpoints.
- **Lines 13-14 (Administrative Routes - Owner-Only)**:
  - **Basic Function**: Define endpoints to manage and query employees.
  - **Detailed Explanation**:
    - `POST /add` restricts access to owners (`isAuthorized()`), validates request bodies against `ownerSchemas.addUser`, and runs `addUser` (Line 13).
    - `GET /all` restricts access to owners, validates URL queries against `ownerSchemas.searchUsersQuery`, and runs `searchUsers` (Line 14).
- **Lines 17-20 (Self-Service Routes)**:
  - **Basic Function**: Define endpoints for user profile edits and security modifications.
  - **Detailed Explanation**:
    - `PUT /profile` validates request bodies using `userSchemas.updateProfile` before calling `updateProfile` (Line 17).
    - `PUT /change-password` validates request bodies using `userSchemas.changePassword` before calling `changePassword` (Line 20).
- **Lines 23-26 (Specific User Details & Admin Update Routes)**:
  - **Basic Function**: Define endpoints for finding users and administrative employee updates.
  - **Detailed Explanation**:
    - `GET /info/:id` maps directly to `getUserById` (Line 23) which checks user roles inside the controller.
    - `PUT /admin-update/:id` requires owner credentials (`isAuthorized()`), validates request bodies using `userSchemas.updateUserByAdmin`, and maps to `updateUserByAdmin` (Line 26).
- **Line 28 (Module Export)**:
  - **Basic Function**: Export the router.
  - **Detailed Explanation**: Exports `router` (Line 28) using standard CommonJS modules.
