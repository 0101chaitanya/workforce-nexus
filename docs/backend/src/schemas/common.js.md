# backend/src/schemas/common.js

## 1. Overview
`backend/src/schemas/common.js` defines shared, reusable schema validation objects leveraging the Zod library. It establishes structural primitives (IDs, names, email, passwords, phone numbers, numeric limits) imported by other schema files to maintain consistent checks.

## 2. Key Responsibilities & Flow
Defines the following schema patterns:
- `objectId`: Verifies standard 24-character hexadecimal MongoDB IDs.
- `email`: Enforces standard email addresses.
- `emailOrIdentity`: Validates that the input is either a valid email format or matches a corporate ID regex (`^EMP-[A-Z0-9]{6}$`). Used for employee login credentials.
- `password`: Enforces a minimum 8-character string for standard login queries.
- `newPassword`: Enforces password complexity rules for registration (minimum 8 characters, lowercase, uppercase, numeric, and special characters).
- `name`: Sets rules for user names (length 6 to 70).
- `otp`: Coerces numeric formats to validate a 5-digit number (10000 - 99999).
- `phone`: Flexibly matches phone numbers or permits empty/undefined values.
- `positiveAmount` & `amount`: Handles financial inputs (non-negative numeric inputs).
- `employeeSalary`: Enforces monthly compensation bounds (15,000 to 80,000).
- `month` & `year`: Validates calendar ranges.
- `shortText`, `tinyText`, `mediumText`, `optionalMediumText`: Size-bounded string definitions.
- `leaveType`, `approvalStatus`, `reviewStatus`: Enum definitions mapping database status limits.

## 3. Code Patterns & Best Practices
- **Zod Primitive Composition**: Reuses base primitives to avoid duplicate schema definitions.
- **Strict Data Coercion**: Uses `z.coerce.number()` to sanitize incoming query strings or form fields before calculations occur.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Directly mirrors frontend validation expectations.
- Constraints such as `employeeSalary` (15,000 to 80,000) match form rules inside components like `OwnerEmployees.jsx` and `OwnerPayroll.jsx`.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports**: Imports Zod library namespace.
2. **Common Schema Dictionary**: Configures reusable Zod type definitions for MongoDB IDs, emails, passwords, names, phone numbers, salary bounds, calendar values, text inputs, and database enums.
3. **Module Exports**: Exports the shared schema dictionary.

- **Lines 1-2 (Imports)**:
  - **Basic Function**: Import dependency.
  - **Detailed Explanation**: Imports `z` namespace from `zod` (Line 1) to declare validation primitives.
  - **Key Function Calls**:
    - `require("zod")`: Loads the Zod validation library module. Called to obtain the `z` schema definition object. Parameters: `"zod"` (the package name). Returns the exported `zod` module namespace.

- **Lines 4-84 (Common Schema Dictionary)**:
  - **Basic Function**: Define specific rules, lengths, patterns, and errors for reusable properties.
  - **Detailed Explanation**: Declares `common` object (Line 4). It includes:
    - `objectId` checking for 24-character hexadecimal regex (Line 6).
    - `email` checking for standard email address string (Line 9).
    - `emailOrIdentity` checking if a string matches either email or corporate ID regex format (Lines 12-16).
    - `password` requiring min length 8 (Line 19).
    - `newPassword` requiring min length 8, max 100, and matching lowercase, uppercase, number, and special character regex patterns (Lines 22-28).
    - `name` requiring length between 6 and 70 (Line 31).
    - `otp` coercing to a 5-digit integer between 10000 and 99999 (Line 34).
    - `phone` using a union to allow optional E.164 formats, empty strings, or undefined values (Lines 37-41).
    - `address` defining optional trim strings with max length 500 (Line 44).
    - `positiveAmount` and `employeeSalary` ensuring positive numeric values and setting employee salary boundaries between ₹15,000 and ₹80,000 (Lines 47-52).
    - `amount` coercing to a non-negative number defaulting to 0 (Line 55).
    - `month` (1 to 12 range) and `year` (2020 to 2100 range) (Lines 58-61).
    - Text size definitions: `shortText` (Line 64), `tinyText` (Line 67), `mediumText` (Line 70), and `optionalMediumText` (Line 73).
    - `isoDate` validating standard ISO date-time strings (Line 76).
    - Enum definitions: `leaveType` (Line 79), `approvalStatus` (Line 82), and `reviewStatus` (Line 83).
  - **Key Function Calls**:
    - `z.string()`: Initiates a Zod validator object for validating string types. Parameters: None. Returns a `ZodString` validation schema instance.
    - `regex(pattern, message)`: Restricts a string validator to match a specific regular expression. Parameters: `pattern` (RegExp pattern) and `message` (custom error string returned when validation fails). Returns the updated `ZodString` schema.
    - `email(message)`: Restricts a string validator to validate standard email formats. Parameters: `message` (custom error string). Returns the updated `ZodString` schema.
    - `trim()`: Applies trimming of leading and trailing whitespace to a string before validation. Parameters: None. Returns the updated `ZodString` schema.
    - `refine(refinementFn, message)`: Registers a custom validation function (refinement) that must return `true` to pass. Parameters: `refinementFn` (a function returning boolean) and `message` (custom error string). Returns a `ZodEffects` schema.
    - `test(val)`: A standard JavaScript RegExp method called on regex objects to test if the string `val` matches the pattern. Parameters: `val` (the input string). Returns `true` if matched, `false` otherwise.
    - `min(limit, message)`: Sets a minimum value or length check. Parameters: `limit` (number representing minimum value or string length) and `message` (custom error string). Returns the updated Zod schema instance.
    - `max(limit, message)`: Sets a maximum value or length check. Parameters: `limit` (number representing maximum value or string length) and `message` (custom error string). Returns the updated Zod schema instance.
    - `z.coerce.number()`: Creates a Zod number schema that attempts to cast/coerce input values to numbers first. Parameters: None. Returns a `ZodNumber` instance.
    - `int()`: Enforces that the numeric value must be an integer. Parameters: None. Returns the updated `ZodNumber` schema.
    - `z.union(schemas)`: Validates that an input matches at least one of the schemas in the array. Parameters: `schemas` (an array of Zod validation schemas). Returns a `ZodUnion` schema.
    - `z.literal(value)`: Restricts a schema to match an exact value. Parameters: `value` (the exact value, e.g., `""` or `undefined`). Returns a `ZodLiteral` schema.
    - `optional()`: Marks a schema field as optional (allowing `undefined` values). Parameters: None. Returns a `ZodOptional` schema.
    - `positive(message)`: Enforces that the numeric value must be strictly greater than 0. Parameters: `message` (custom error string). Returns the updated `ZodNumber` schema.
    - `default(value)`: Sets a default value for the field if it is undefined. Parameters: `value` (the default value, e.g. `0`). Returns a `ZodDefault` schema.
    - `z.enum(values)`: Creates a validation schema matching a list of specific string values. Parameters: `values` (an array of valid string values). Returns a `ZodEnum` schema.
    - `datetime(options)`: Restricts a string schema to follow a valid ISO 8601 date-time format. Parameters: `options` (an object specifying configurations, like `{ message: "Invalid date format" }`). Returns the updated `ZodString` schema.

- **Line 86 (Module Exports)**:
  - **Basic Function**: Export validation rules.
  - **Detailed Explanation**: Exports the `common` validators object (Line 86) to be referenced by other schema configurations.
  - **Key Function Calls**: None.
