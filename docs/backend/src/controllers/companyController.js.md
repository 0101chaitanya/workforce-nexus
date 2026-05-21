# backend/src/controllers/companyController.js

## 1. Overview
`backend/src/controllers/companyController.js` manages company-level configurations, providing public detail fetching (for landing/registration contexts) and protected metadata updates (for organization administration).

## 2. Key Responsibilities & Flow
- **`getPublicCompanyInfo`**:
  - Resolves company details based on the URL parameter ID.
  - Limits returned information to name, logo, address, and owner name.
- **`getProtectedCompanyInfo`**:
  - Resolves company details based on the logged-in owner's company context ID (`req.company._id`).
  - Populates owner user profile fields.
- **`updateCompanyInfo`**:
  - Finds the company by `req.company._id` and saves updated parameters (`companyName`, `address`, `phone`).
  - Returns the updated company document.

## 3. Code Patterns & Best Practices
- **Information Disclosure Prevention**: Restricts public endpoints using Mongoose `.select()` projections to prevent internal details from being exposed to unauthenticated users.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- **`getPublicCompanyInfo`**: Called during registration workflows when an employee registers using an invite link or organization code.
- **`getProtectedCompanyInfo` & `updateCompanyInfo`**: Bound to the organization profile configuration panel in the owner's dashboard view ([OwnerOrganization.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/organization/OwnerOrganization.jsx.md)).

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Lines 1-3 (Imports)**: Import `mongoose`, `Company` model, and `catchAsync` helper.
2. **Lines 5-25 (getPublicCompanyInfo)**: Fetch non-sensitive details of a company (name, logo, address, owner name) for public views.
3. **Lines 27-41 (getProtectedCompanyInfo)**: Fetch full company details populated with owner profile info for authorized sessions.
4. **Lines 43-66 (updateCompanyInfo)**: Update company attributes (name, address, phone) inside a protected session, save to database, and return updated company.

- **Lines 1-3 (Imports)**:
  - **Basic Function**: Import dependencies.
  - **Detailed Explanation**: Imports the `mongoose` module, `Company` model to read/write organization settings, and the `catchAsync` wrapper from auth middleware to automatically catch and forward controller errors to the global Express handler.
- **Lines 5-25 (getPublicCompanyInfo)**:
  - **Basic Function**: Fetch public company details.
  - **Detailed Explanation**: Fetches a company by its URL param `id`. Restricts the projection to non-sensitive fields (`companyName`, `logo`, `address`) and populates the owner's `fullName`. Returns `404 Not Found` if the company does not exist, otherwise returns it in the response payload.
- **Lines 27-41 (getProtectedCompanyInfo)**:
  - **Basic Function**: Fetch detailed company info inside an authenticated session.
  - **Detailed Explanation**: Resolves the company ID from `req.company._id`. Fetches the document and populates the owner details (`fullName`, `email`, `phone`, `role`). Returns the complete object in the payload or a `404 Not Found` if it is missing.
- **Lines 43-66 (updateCompanyInfo)**:
  - **Basic Function**: Edit/update specific fields in the company details.
  - **Detailed Explanation**: Retrieves the company by `req.company._id`. If not found, returns `404 Not Found`. Applies updates from `req.body` to the fields `companyName`, `address`, and `phone` if defined. Calls `.save()` to write the changes to the database. Re-fetches the company with its owner details populated, and returns the updated document.

