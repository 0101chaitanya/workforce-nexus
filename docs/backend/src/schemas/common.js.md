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
- **Line 86 (Module Exports)**:
  - **Basic Function**: Export validation rules.
  - **Detailed Explanation**: Exports the `common` validators object (Line 86) to be referenced by other schema configurations.
