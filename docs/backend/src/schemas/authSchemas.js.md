# backend/src/schemas/authSchemas.js

## 1. Overview
`backend/src/schemas/authSchemas.js` consolidates input validation definitions for the authentication controller routes.

## 2. Key Responsibilities & Flow
- **`sendOtp`**: Validates parameters when sending registration verification codes (`email` and `companyName`).
- **`verifyOtp`**: Validates registration challenges using the user's `emailOrIdentity` and the 5-digit `otp`.
- **`register`**: Validates new user register parameters (`fullName`, `email`, complex `password`).
- **`login`**: Validates credentials (`emailOrIdentity` and raw `password`) during user log-in.
- **`forgotPasswordOtp`**: Checks input when sending reset-password codes (`emailOrIdentity`).
- **`resetPassword`**: Ensures correct parameters when updating passwords (`emailOrIdentity`, `otp`, and the complex `newPassword`).

## 3. Code Patterns & Best Practices
- Imports the centralized rules defined in `common.js` to ensure uniform password and email validations across the login, registration, and recovery endpoints.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Directly validates forms submitted by the frontend components:
  - `Login.jsx` matches the `login` schema.
  - `Register.jsx` matches the `register` schema.
  - Verification codes map to the backend `verifyOtp` schema requirements.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports**: Imports Zod and common validation rules.
2. **Auth Validation Schemas**: Exposes schemas for OTP requests, OTP verifications, registration, login, forgot password OTP requests, and password resets.
3. **Module Exports**: Exports the schema dictionary.

- **Lines 1-2 (Imports)**:
  - **Basic Function**: Import dependencies.
  - **Detailed Explanation**: Imports `z` namespace from `zod` (Line 1) and imports standard properties from the local shared schemas helper `common` (Line 2).
  - **Key Function Calls**:
    - `require("zod")`: Loads the Zod validation library module. Called to obtain the `z` schema definition object. Parameters: `"zod"` (the package name). Returns the exported `zod` module namespace.
    - `require("./common")`: Loads the shared common schemas definition module. Called to obtain the shared schema primitives. Parameters: `"./common"` (the relative path to the common schemas module). Returns the exported `common` object dictionary.
- **Lines 4-35 (Auth Validation Schemas)**:
  - **Basic Function**: Structure field-level validation schemas for all auth routes.
  - **Detailed Explanation**: Declares `authSchemas` container object (Line 4). It configures:
    - `sendOtp` schema requiring email and companyName (Lines 5-8).
    - `verifyOtp` schema validating email/identity code and the numeric OTP (Lines 10-13).
    - `register` schema checking fullName, email, and password complexity (Lines 15-19).
    - `login` schema checking email/identity and password fields (Lines 21-24).
    - `forgotPasswordOtp` schema requiring email or identity string (Lines 26-28).
    - `resetPassword` schema checking email/identity, OTP, and the newPassword complexity (Lines 30-34).
  - **Key Function Calls**:
    - `z.object(shape)`: Creates a Zod object schema validating the shape of an object against specified field schemas. Parameters: `shape` (an object mapping keys to Zod schema types). Returns a `ZodObject` validation schema instance.
- **Line 37 (Module Exports)**:
  - **Basic Function**: Export schemas.
  - **Detailed Explanation**: Exports the compiled `authSchemas` object (Line 37) to validate incoming request bodies.
  - **Key Function Calls**: None.
