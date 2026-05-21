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
  - **Key Function Calls**:
    - `require("zod")`: Loads the Zod validation library module. Called to obtain the `z` schema definition object. Parameters: `"zod"` (the package name). Returns the exported `zod` module namespace.
- **Lines 3-37 (User Validation Schemas)**:
  - **Basic Function**: Define request payload parameters and preprocessing rules for user modifications.
  - **Detailed Explanation**: Declares `userSchemas` container object (Line 3).
    - `updateProfile` (Lines 4-13) validates `fullName` (Line 5), `phone` (Line 6), `address` (Line 7), `dateOfBirth` (using `z.preprocess` to normalize empty strings/nulls to undefined before coercing to a Date on Lines 8-11), and `bankAccount` (Line 12).
    - `updateUserByAdmin` (Lines 15-31) validates admin-specific fields. It preprocesses `salary` values to ensure they are parsed as numbers and are non-negative (Lines 18-21). It allows edits to `fullName`, `role` (restricted to employee or owner enum), `branch`, `position`, `phone`, `address`, preprocessed `dateOfBirth`, and `bankAccount`.
    - `changePassword` (Lines 33-36) requires the presence of `oldPassword` (Line 34) and enforces a minimum length of 6 characters on `newPassword` (Line 35).
  - **Key Function Calls**:
    - `z.object(shape)`: Creates a Zod object schema validating the shape of an object against specified field schemas. Parameters: `shape` (an object mapping keys to Zod schema types). Returns a `ZodObject` validation schema instance.
    - `z.string()`: Initiates a Zod validator object for validating string types. Parameters: None. Returns a `ZodString` validation schema instance.
    - `min(limit, message)`: Sets a minimum value or length check. Parameters: `limit` (number representing minimum value or string length) and optionally `message` (custom error string). Returns the updated Zod schema instance.
    - `max(limit, message)`: Sets a maximum value or length check. Parameters: `limit` (number representing maximum value or string length) and optionally `message` (custom error string). Returns the updated Zod schema instance.
    - `optional()`: Marks a schema field as optional. Parameters: None. Returns a `ZodOptional` schema.
    - `nullable()`: Allows the schema to accept `null` values. Parameters: None. Returns a `ZodNullable` schema.
    - `or(schema)`: Combines the current schema with an alternative validator in a union (logical OR). Parameters: `schema` (a Zod schema object). Returns a `ZodUnion` schema.
    - `z.literal(value)`: Restricts a schema to match an exact value. Parameters: `value` (e.g. `""`). Returns a `ZodLiteral` schema.
    - `z.preprocess(preprocessFn, schema)`: Transforms the input data by calling `preprocessFn` before validation against `schema`. Parameters: `preprocessFn` (a transform function) and `schema` (a Zod schema). Returns a `ZodEffects` schema.
    - `z.coerce.date()`: Creates a Zod date schema that casts/coerces input values to date objects. Parameters: None. Returns a `ZodDate` instance.
    - `Number(val)`: Standard JavaScript function to cast the value `val` to a number. Parameters: `val` (the input value). Returns a number.
    - `z.number()`: Creates a Zod number validation schema. Parameters: None. Returns a `ZodNumber` instance.
    - `nonnegative(message)`: Restricts a ZodNumber validator to validate only numbers greater than or equal to 0. Parameters: `message` (custom error string). Returns the updated `ZodNumber` schema.
    - `z.enum(values)`: Restricts a schema to validate only exact string matches within the provided array. Parameters: `values` (an array of strings). Returns a `ZodEnum` schema.
- **Line 39 (Module Exports)**:
  - **Basic Function**: Export validation configurations.
  - **Detailed Explanation**: Exports the compiled `userSchemas` object (Line 39) for middleware validation.
  - **Key Function Calls**: None.
