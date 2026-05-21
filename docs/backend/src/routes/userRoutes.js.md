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
  - **Key Function Calls**:
    - `require("express")`: Loads the Express module to create routers and manage middlewares. Parameters: `"express"` (string). Returns: The exported Express framework function/object.
    - `require("../middleware/authMiddleware")`: Loads the authentication middleware module. Parameters: `"../middleware/authMiddleware"` (string). Returns: An object containing `protect` and `isAuthorized`.
    - `require("../middleware/validationMiddleware")`: Loads the validation middleware module. Parameters: `"../middleware/validationMiddleware"` (string). Returns: An object containing `validate` and `validateQuery`.
    - `require("../schemas/ownerSchemas")`: Loads schemas configured for owner validations. Parameters: `"../schemas/ownerSchemas"` (string). Returns: The owner validation schemas object.
    - `require("../schemas/userSchemas")`: Loads schemas configured for general user validations. Parameters: `"../schemas/userSchemas"` (string). Returns: The user validation schemas object.
    - `require("../controllers/userController")`: Loads the user controller module. Parameters: `"../controllers/userController"` (string). Returns: The user controller actions object.
- **Lines 8-10 (Router Setup)**:
  - **Basic Function**: Instantiate router and require authentication.
  - **Detailed Explanation**: Instantiates the router instance `express.Router()` (Line 8). It applies the `protect` middleware globally (Line 10) to require valid tokens for all these endpoints.
  - **Key Function Calls**:
    - `express.Router()`: Creates a new modular router instance. Parameters: None. Returns: A new Express router object.
    - `router.use(protect)`: Mounts the `protect` middleware globally on this router instance. Parameters: `protect` (middleware function). Returns: The router instance.
- **Lines 13-14 (Administrative Routes - Owner-Only)**:
  - **Basic Function**: Define endpoints to manage and query employees.
  - **Detailed Explanation**:
    - `POST /add` restricts access to owners (`isAuthorized()`), validates request bodies against `ownerSchemas.addUser`, and runs `addUser` (Line 13).
    - `GET /all` restricts access to owners, validates URL queries against `ownerSchemas.searchUsersQuery`, and runs `searchUsers` (Line 14).
  - **Key Function Calls**:
    - `isAuthorized()`: Generates a role check authorization middleware. Parameters: None. Returns: A middleware function checking user roles.
    - `validate(ownerSchemas.addUser)`: Creates a request body validation middleware. Parameters: `ownerSchemas.addUser` (validation schema). Returns: A middleware function.
    - `router.post("/add", isAuthorized(), validate(...), userController.addUser)`: Registers a POST route handler for adding a user. Parameters: `"/add"` (string), owner authorization middleware, request body validation middleware, `userController.addUser` (controller action). Returns: The router instance.
    - `validateQuery(ownerSchemas.searchUsersQuery)`: Creates a query validation middleware. Parameters: `ownerSchemas.searchUsersQuery` (validation schema). Returns: A middleware function.
    - `router.get("/all", isAuthorized(), validateQuery(...), userController.searchUsers)`: Registers a GET route handler for querying all users. Parameters: `"/all"` (string), owner authorization middleware, query validation middleware, `userController.searchUsers` (controller action). Returns: The router instance.
- **Lines 17-20 (Self-Service Routes)**:
  - **Basic Function**: Define endpoints for user profile edits and security modifications.
  - **Detailed Explanation**:
    - `PUT /profile` validates request bodies using `userSchemas.updateProfile` before calling `updateProfile` (Line 17).
    - `PUT /change-password` validates request bodies using `userSchemas.changePassword` before calling `changePassword` (Line 20).
  - **Key Function Calls**:
    - `validate(userSchemas.updateProfile)`: Creates a request body validation middleware. Parameters: `userSchemas.updateProfile` (validation schema). Returns: A middleware function.
    - `router.put("/profile", validate(...), userController.updateProfile)`: Registers a PUT route handler to update the profile. Parameters: `"/profile"` (string), validation middleware, `userController.updateProfile` (controller action). Returns: The router instance.
    - `validate(userSchemas.changePassword)`: Creates a request body validation middleware. Parameters: `userSchemas.changePassword` (validation schema). Returns: A middleware function.
    - `router.put("/change-password", validate(...), userController.changePassword)`: Registers a PUT route handler to change a user's password. Parameters: `"/change-password"` (string), validation middleware, `userController.changePassword` (controller action). Returns: The router instance.
- **Lines 23-26 (Specific User Details & Admin Update Routes)**:
  - **Basic Function**: Define endpoints for finding users and administrative employee updates.
  - **Detailed Explanation**:
    - `GET /info/:id` maps directly to `getUserById` (Line 23) which checks user roles inside the controller.
    - `PUT /admin-update/:id` requires owner credentials (`isAuthorized()`), validates request bodies using `userSchemas.updateUserByAdmin`, and maps to `updateUserByAdmin` (Line 26).
  - **Key Function Calls**:
    - `router.get("/info/:id", userController.getUserById)`: Registers a GET route handler to fetch user info by ID. Parameters: `"/info/:id"` (string), `userController.getUserById` (controller action). Returns: The router instance.
    - `isAuthorized()`: Generates a role check authorization middleware. Parameters: None. Returns: A middleware function checking user roles.
    - `validate(userSchemas.updateUserByAdmin)`: Creates a request body validation middleware. Parameters: `userSchemas.updateUserByAdmin` (validation schema). Returns: A middleware function.
    - `router.put("/admin-update/:id", isAuthorized(), validate(...), userController.updateUserByAdmin)`: Registers a PUT route handler for administrative updates to user accounts. Parameters: `"/admin-update/:id"` (string), owner authorization middleware, validation middleware, `userController.updateUserByAdmin` (controller action). Returns: The router instance.
- **Line 28 (Module Export)**:
  - **Basic Function**: Export the router.
  - **Detailed Explanation**: Exports `router` (Line 28) using standard CommonJS modules.
  - **Key Function Calls**: None.
