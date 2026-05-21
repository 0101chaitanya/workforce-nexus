# backend/src/schemas/leaveSchemas.js

## 1. Overview
`backend/src/schemas/leaveSchemas.js` manages request validations for leave-related endpoints, covering leave application submissions, status updates, and history queries.

## 2. Key Responsibilities & Flow
- **`applyLeave`**: Validates data when applying for time-off. Enforces leave categories (`leaveType`), ISO start and end dates (`isoDate`), and details of reason (`mediumText`).
- **`updateLeaveStatus`**: Validates actions taken by owners when approving/rejecting leave requests. Enforces statuses (`approvalStatus`) and accepts optional remarks.
- **`historyQuery`**: Validates request parameters for listing leave history. Validates page offsets, result limits, and optional target user filters.

## 3. Code Patterns & Best Practices
- Employs data type coercion for query parameters (e.g. `page`, `limit`) to ensure they are parsed as integers, even when received as string query parameters from URL queries.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Used by frontend components [EmployeeLeaves.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/leaves/EmployeeLeaves.jsx.md) (complying with `applyLeave`) and [OwnerLeaves.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/leaves/OwnerLeaves.jsx.md) (complying with `updateLeaveStatus`).
- Query validation governs queries sent by the table component [Pagination.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/components/common/Pagination.jsx.md).

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports**: Imports Zod and common validation rule fields.
2. **Leave Schema Configurations**: Houses validation schemas for applying leaves, updating statuses, and querying leave history.
3. **Module Exports**: Exports the schema dictionary.

- **Lines 1-2 (Imports)**:
  - **Basic Function**: Import validation utilities.
  - **Detailed Explanation**: Imports `z` namespace from `zod` (Line 1) and imports standard properties from the local shared schemas helper `common` (Line 2).
  - **Key Function Calls**:
    - `require("zod")`: Loads the Zod validation library module. Called to obtain the `z` schema definition object. Parameters: `"zod"` (the package name). Returns the exported `zod` module namespace.
    - `require("./common")`: Loads the shared common schemas definition module. Called to obtain the shared schema primitives. Parameters: `"./common"` (the relative path to the common schemas module). Returns the exported `common` object dictionary.
- **Lines 4-20 (Leave Schema Configurations)**:
  - **Basic Function**: Structure and define field validation schemas.
  - **Detailed Explanation**: Declares `leaveSchemas` object container (Line 4). It sets `applyLeave` schema validating `type`, `startDate`, `endDate`, and `reason` (Lines 5-10). It defines `updateLeaveStatus` checking for the target `status` and optional `remarks` (Lines 11-14). It specifies `historyQuery` for URL parameter checks, allowing an optional `targetUserId` ObjectId (Line 16), coercing `page` to an integer (Line 17), and coercing `limit` to an integer with a max limit of 1000 (Line 18).
  - **Key Function Calls**:
    - `z.object(shape)`: Creates a Zod object schema validating the shape of an object against specified field schemas. Parameters: `shape` (an object mapping keys to Zod schema types). Returns a `ZodObject` validation schema instance.
    - `common.objectId.optional()`: Marks the shared `objectId` schema as optional. Parameters: None. Returns a `ZodOptional` schema.
    - `z.coerce.number()`: Creates a Zod number schema that casts/coerces input values to numbers. Parameters: None. Returns a `ZodNumber` instance.
    - `int()`: Enforces that the numeric value must be an integer. Parameters: None. Returns the updated `ZodNumber` schema.
    - `positive()`: Enforces that the numeric value must be strictly greater than 0. Parameters: None. Returns the updated `ZodNumber` schema.
    - `max(limit)`: Sets a maximum value check. Parameters: `limit` (number representing maximum value). Returns the updated `ZodNumber` schema.
    - `optional()`: Marks a schema field as optional. Parameters: None. Returns a `ZodOptional` schema.
- **Line 22 (Module Exports)**:
  - **Basic Function**: Export validation schemas.
  - **Detailed Explanation**: Exports the compiled `leaveSchemas` dictionary (Line 22) for use in route validation middleware.
  - **Key Function Calls**: None.
