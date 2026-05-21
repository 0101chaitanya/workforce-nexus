# backend/src/schemas/userSchemas.js

## 1. Overview
`backend/src/schemas/userSchemas.js` manages request validation for profile updates, owner-driven employee edits, and password change operations.

## 2. Key Responsibilities & Flow
- **`updateProfile`**: Validates fields when an employee updates their own profile details. Keeps fields optional, handles empty string fallbacks, and validates formatted bank account fields.
- **`updateUserByAdmin`**: Validates fields when an owner edits an employee profile. Allows updating the salary field (pre-processed to numeric values), user role, branch, position details, and contact information.
- **`changePassword`**: Checks parameters when changing passwords, validating both the `oldPassword` and the `newPassword`.

## 3. Code Patterns & Best Practices
- **Preprocess Sanitization**: Uses `z.preprocess()` to intercept incoming empty strings, null values, or undefined objects, normalizing them to `undefined` or numbers before validation occurs. This avoids type errors when forms send empty string fields for optional numbers or dates.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Validates profile form data submitted by employees in [EmployeeProfile.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/profile/EmployeeProfile.jsx.md).
- Validates employee edit forms submitted by owners in [OwnerEmployees.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/employees/OwnerEmployees.jsx.md).

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports**: Imports Zod library namespace.
2. **User Validation Schemas**: Exposes schemas for updating user profile, updating user details by admin, and changing password.
3. **Module Exports**: Exports the schema dictionary.

- **Lines 1-2 (Imports)**:
  - **Basic Function**: Import dependency.
  - **Detailed Explanation**: Imports `z` namespace from `zod` (Line 1) to declare type validations and preprocessing hooks.
- **Lines 3-37 (User Validation Schemas)**:
  - **Basic Function**: Define request payload parameters and preprocessing rules for user modifications.
  - **Detailed Explanation**: Declares `userSchemas` container object (Line 3).
    - `updateProfile` (Lines 4-13) validates `fullName` (Line 5), `phone` (Line 6), `address` (Line 7), `dateOfBirth` (using `z.preprocess` to normalize empty strings/nulls to undefined before coercing to a Date on Lines 8-11), and `bankAccount` (Line 12).
    - `updateUserByAdmin` (Lines 15-31) validates admin-specific fields. It preprocesses `salary` values to ensure they are parsed as numbers and are non-negative (Lines 18-21). It allows edits to `fullName`, `role` (restricted to employee or owner enum), `branch`, `position`, `phone`, `address`, preprocessed `dateOfBirth`, and `bankAccount`.
    - `changePassword` (Lines 33-36) requires the presence of `oldPassword` (Line 34) and enforces a minimum length of 6 characters on `newPassword` (Line 35).
- **Line 39 (Module Exports)**:
  - **Basic Function**: Export validation configurations.
  - **Detailed Explanation**: Exports the compiled `userSchemas` object (Line 39) for middleware validation.
