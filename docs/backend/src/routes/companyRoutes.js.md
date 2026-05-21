# backend/src/routes/companyRoutes.js

## 1. Overview
`backend/src/routes/companyRoutes.js` registers endpoints for company/organization settings.

## 2. Key Responsibilities & Flow
- **`GET /public/:id`**: Open endpoint routing to `getPublicCompanyInfo`.
- **`GET /protected`**: Secured route requiring validation (`protect`) and owner authorization (`isAuthorized()`) before routing to `getProtectedCompanyInfo`.
- **`PUT /update`**: Secured route requiring validation (`protect`), owner authorization (`isAuthorized()`), and request body schema verification against `ownerSchemas.updateCompany` before routing to `updateCompanyInfo`.

## 3. Code Patterns & Best Practices
- Implements route-level role authorization (`isAuthorized()`) to ensure employee users cannot query protected company settings.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Consumed by organization management views in the frontend client: [OwnerOrganization.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/organization/OwnerOrganization.jsx.md).

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports**: Imports Express, validation and authorization middlewares, owner schemas, and company controllers.
2. **Router Setup**: Instantiates the Express router.
3. **Route Mappings**: Sets up public details fetches, authenticated detail fetches, and company metadata update routes.
4. **Module Export**: Exports the company routes router.

- **Lines 1-6 (Imports)**:
  - **Basic Function**: Import dependencies and modules.
  - **Detailed Explanation**: Imports `express` (Line 1), instantiates the router (Line 2), imports controller actions `getPublicCompanyInfo`, `getProtectedCompanyInfo`, and `updateCompanyInfo` (Line 3), imports auth guards `protect` and `isAuthorized` (Line 4), imports validation middleware `validate` (Line 5), and imports schema configurations `ownerSchemas` (Line 6).
  - **Key Function Calls**:
    - `require('express')`: Loads the Express module to create routers and manage middlewares. Parameters: `'express'` (string). Returns: The exported Express framework function/object.
    - `express.Router()`: Creates a new modular router instance. Parameters: None. Returns: A new Express router object.
    - `require('../controllers/companyController')`: Loads the company controller module. Parameters: `'../controllers/companyController'` (string). Returns: An object containing individual company controller actions.
    - `require('../middleware/authMiddleware')`: Loads the authentication middleware module. Parameters: `'../middleware/authMiddleware'` (string). Returns: An object containing `protect` and `isAuthorized`.
    - `require('../middleware/validationMiddleware')`: Loads the validation middleware module. Parameters: `'../middleware/validationMiddleware'` (string). Returns: An object containing `validate`.
    - `require('../schemas/ownerSchemas')`: Loads schemas configured for owner validations. Parameters: `'../schemas/ownerSchemas'` (string). Returns: The owner validation schemas object.
- **Line 9 (Route Mappings - Public Fetch)**:
  - **Basic Function**: Define public endpoint to access unclassified company data.
  - **Detailed Explanation**: `GET /public/:id` routes directly to `getPublicCompanyInfo` (Line 9), allowing anonymous requests to view public company attributes like verification status or basic branding.
  - **Key Function Calls**:
    - `router.get('/public/:id', getPublicCompanyInfo)`: Registers a GET route handler for public company info. Parameters: `'/public/:id'` (string), `getPublicCompanyInfo` (controller action). Returns: The router instance.
- **Line 12 (Route Mappings - Protected Fetch)**:
  - **Basic Function**: Define secure endpoint to query complete organizational details.
  - **Detailed Explanation**: `GET /protected` applies the authentication wrapper `protect` and authorization guard `isAuthorized()`, routing to `getProtectedCompanyInfo` (Line 12) if the caller is an owner.
  - **Key Function Calls**:
    - `isAuthorized()`: Generates a role check authorization middleware. Parameters: None. Returns: A middleware function checking user roles.
    - `router.get('/protected', protect, isAuthorized(), getProtectedCompanyInfo)`: Registers a GET route handler for protected company info. Parameters: `'/protected'` (string), `protect` (middleware), owner authorization middleware, `getProtectedCompanyInfo` (controller action). Returns: The router instance.
- **Line 15 (Route Mappings - Company Update)**:
  - **Basic Function**: Define secure endpoint to update organizational settings.
  - **Detailed Explanation**: `PUT /update` applies authentication `protect` and owner authorization `isAuthorized()`, validates request bodies against `ownerSchemas.updateCompany`, and calls `updateCompanyInfo` (Line 15).
  - **Key Function Calls**:
    - `isAuthorized()`: Generates a role check authorization middleware. Parameters: None. Returns: A middleware function checking user roles.
    - `validate(ownerSchemas.updateCompany)`: Creates a request body validation middleware. Parameters: `ownerSchemas.updateCompany` (validation schema). Returns: A middleware function.
    - `router.put('/update', protect, isAuthorized(), validate(...), updateCompanyInfo)`: Registers a PUT route handler to update company settings. Parameters: `'/update'` (string), `protect` (middleware), owner authorization middleware, validation middleware, `updateCompanyInfo` (controller action). Returns: The router instance.
- **Line 17 (Module Export)**:
  - **Basic Function**: Export the router.
  - **Detailed Explanation**: Exports `router` (Line 17) using CommonJS exports.
  - **Key Function Calls**: None.
