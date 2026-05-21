# backend/src/schemas/ownerSchemas.js

## 1. Overview
`backend/src/schemas/ownerSchemas.js` manages request validations for owner-only actions, including adding employees, updating company metadata, searching users, and reviewing history queries.

## 2. Key Responsibilities & Flow
- **`addUser`**: Validates fields when onboarding a new employee. Enforces full name, email format, and checks optional parameters (salary, branch, position).
- **`searchUsersQuery`**: Validates user search queries. Accepts search strings and handles pagination parameters (page offset, limits).
- **`updateCompany`**: Validates company metadata updates. Accepts optional settings (company name, address, phone).
- **`historyQuery`**: Validates parameters when retrieving leave or payroll history.

## 3. Code Patterns & Best Practices
- Integrates pagination rules and handles optional text inputs using `.or(z.literal(""))` to process empty HTML form inputs gracefully.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Validates requests submitted by owners in the following views:
  - Adding a new employee ([OwnerEmployees.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/employees/OwnerEmployees.jsx.md)).
  - Searching/paging employee logs ([Pagination.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/components/common/Pagination.jsx.md)).
  - Updating corporate profiles ([OwnerOrganization.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/organization/OwnerOrganization.jsx.md)).

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports**: Imports Zod library namespace and common shared validations.
2. **Owner Validation Schemas**: Exposes schemas for onboarding users, searching users, updating company details, and querying history.
3. **Module Exports**: Exports the schema object.

- **Lines 1-2 (Imports)**:
  - **Basic Function**: Import dependencies.
  - **Detailed Explanation**: Imports `z` namespace from `zod` (Line 1) and imports standard properties from the local shared schemas helper `common` (Line 2).
  - **Key Function Calls**:
    - `require("zod")`: Loads the Zod validation library module. Called to obtain the `z` schema definition object. Parameters: `"zod"` (the package name). Returns the exported `zod` module namespace.
    - `require("./common")`: Loads the shared common schemas definition module. Called to obtain the shared schema primitives. Parameters: `"./common"` (the relative path to the common schemas module). Returns the exported `common` object dictionary.
- **Lines 4-30 (Owner Validation Schemas)**:
  - **Basic Function**: Structure field-level validations for administrative tasks.
  - **Detailed Explanation**: Declares `ownerSchemas` container object (Line 4).
    - `addUser` (Lines 5-11) checks `fullName` (Line 6) and `email` (Line 7), and validates optional fields `salary` (Line 8), `branch` (Line 9), and `position` (Line 10).
    - `searchUsersQuery` (Lines 13-17) processes text searches with minimum length 2 and maximum length 100, alongside coerced pagination integers (`page`, `limit`).
    - `updateCompany` (Lines 19-23) allows modifying `companyName` (Line 20), `address` (max length 500) (Line 21), and `phone` (Line 22).
    - `historyQuery` (Lines 25-29) checks for an optional target user ObjectId (Line 26) and handles coerced pagination integers (Lines 27-28).
  - **Key Function Calls**:
    - `z.object(shape)`: Creates a Zod object schema validating the shape of an object against specified field schemas. Parameters: `shape` (an object mapping keys to Zod schema types). Returns a `ZodObject` validation schema instance.
    - `optional()`: Marks a schema field as optional. Parameters: None. Returns a `ZodOptional` schema.
    - `z.string()`: Initiates a Zod validator object for validating string types. Parameters: None. Returns a `ZodString` validation schema instance.
    - `trim()`: Applies trimming of leading and trailing whitespace to a string before validation. Parameters: None. Returns the updated `ZodString` schema.
    - `min(limit)`: Sets a minimum value or length check. Parameters: `limit` (number representing minimum length). Returns the updated Zod schema instance.
    - `max(limit)`: Sets a maximum value or length check. Parameters: `limit` (number representing maximum length). Returns the updated Zod schema instance.
    - `or(schema)`: Combines the current schema with an alternative validator in a union (logical OR). Parameters: `schema` (a Zod schema object). Returns a `ZodUnion` schema.
    - `z.literal(value)`: Restricts a schema to match an exact value. Parameters: `value` (e.g. `""`). Returns a `ZodLiteral` schema.
    - `z.coerce.number()`: Creates a Zod number schema that casts/coerces input values to numbers. Parameters: None. Returns a `ZodNumber` instance.
    - `int()`: Enforces that the numeric value must be an integer. Parameters: None. Returns the updated `ZodNumber` schema.
    - `positive()`: Enforces that the numeric value must be strictly greater than 0. Parameters: None. Returns the updated `ZodNumber` schema.
- **Line 32 (Module Exports)**:
  - **Basic Function**: Export validation configurations.
  - **Detailed Explanation**: Exports the compiled `ownerSchemas` dictionary (Line 32) for route validation middleware.
  - **Key Function Calls**: None.
