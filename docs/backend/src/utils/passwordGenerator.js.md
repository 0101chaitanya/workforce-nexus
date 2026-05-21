# backend/src/utils/passwordGenerator.js

## 1. Overview
`backend/src/utils/passwordGenerator.js` is a utility used during employee onboarding. It generates temporary secure passwords and mock bank account numbers.

## 2. Key Responsibilities & Flow
- **`generateSecurePassword()`**:
  - Uses the `generate-password` library to compile a 12-character strong string.
  - Enforces strict inclusions of numbers, uppercase letters, and symbols.
- **`generateBankAccount()`**:
  - Generates a 10-digit numeric string to populate mock payroll direct deposit data.

## 3. Code Patterns & Best Practices
- **Strict Cryptographic Constraints**: Setting `strict: true` prevents generating passwords that lack numbers or special characters.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- When an owner adds an employee using the frontend [OwnerEmployees.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/employees/OwnerEmployees.jsx.md) form, the backend controller calls `generateSecurePassword` and mails it to the user.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports**: Imports the generate-password library.
2. **Secure Password Generator (generateSecurePassword)**: Generates a highly secure random password of length 12 containing numbers, symbols, uppercase and lowercase letters.
3. **Bank Account Number Generator (generateBankAccount)**: Generates a mock 10-digit number.
4. **Module Exports**: Exports the helper functions.

- **Lines 1-2 (Imports)**:
  - **Basic Function**: Import the password library.
  - **Detailed Explanation**: Imports `generate-password` (Line 1) to enable programmatically creating random strings of specified complexity.
- **Lines 3-11 (Secure Password Generator - generateSecurePassword)**:
  - **Basic Function**: Generate a secure 12-character password.
  - **Detailed Explanation**: Defines `generateSecurePassword` (Line 3). It calls `generator.generate` (Line 4), configuring length to `12` (Line 5), enabling numbers (Line 6), symbols (Line 7), and uppercase characters (Line 8), and setting `strict` to true (Line 9) to guarantee that all specified character pools are represented.
- **Lines 13-19 (Bank Account Number Generator - generateBankAccount)**:
  - **Basic Function**: Generate a 10-digit numeric string.
  - **Detailed Explanation**: Defines `generateBankAccount` (Line 13) which generates a string of length `10` containing only numbers, using strict mode to ensure it complies.
- **Lines 21-24 (Module Exports)**:
  - **Basic Function**: Export generators.
  - **Detailed Explanation**: Exports `generateSecurePassword` (Line 22) and `generateBankAccount` (Line 23) so they can be referenced inside the User controller during profile creation.
