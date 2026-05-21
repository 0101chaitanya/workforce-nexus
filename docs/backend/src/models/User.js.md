# backend/src/models/User.js

## 1. Overview
The `User` model represents all system actors (Employees and Owners). It maintains details regarding profile data, credentials, authentication status, compensation metrics, and relationship hierarchies.

## 2. Key Responsibilities & Flow
- **Fields & Constraints**:
  - `email`: Required, unique, lowercase string (primary login key).
  - `password`: Hashed string representing user login credentials.
  - `role`: Access level indicator restricted to `["employee", "owner"]`. Defaults to `"employee"`.
  - `identity`: Unique employee code (e.g. `EMP-ABC123`) assigned automatically during creation.
  - `company`: ObjectId referencing the `Company` (optional for unverified owners during onboarding, but required for employees).
  - `salary`, `position`, `branch`, `joinDate`: Employee-specific parameters.
  - `bankAccount`, `phone`, `address`, `dateOfBirth`: Personal information.
  - `otp`, `otpExpiry`: Verification challenge codes.
  - `refreshToken`, `accessToken`: Token caches for session verification.
- **Middleware Hooks**:
  - **`pre('save')`**:
    1. Generates a unique 6-character identity code (`EMP-XXXXXX`) using sparse-index validation to guarantee no duplication.
    2. Hashes the password using `bcrypt` (10 rounds of salt generation) if the password field is modified.
- **Instance Methods**:
  - **`comparePassword(candidatePassword)`**: Compares a plain text credential against the stored bcrypt hash and returns a boolean response.

## 3. Code Patterns & Best Practices
- **Pre-Save Interceptor Pattern**: Centralizes password encryption and entity generation inside the database schema layer to prevent security bypasses in controller endpoints.
- **Robust Collison Resolution**: Generates unique alphanumeric identity codes inside a Mongoose `pre-save` loop (supporting up to 100 retry attempts for collision resolution).

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Ingested by the frontend [authSlice.js](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/auth/authSlice.js.md) to store details of the active user.
- Profile info is modified using [EmployeeProfile.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/profile/EmployeeProfile.jsx.md), and onboarding details are compiled by the owner inside [OwnerEmployees.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/employees/OwnerEmployees.jsx.md).

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports**: Imports Mongoose and the Bcrypt cryptography library.
2. **User Schema Definition**: Defines fields for identification, auth tokens, personal data, and business metrics.
3. **Pre-Save Middleware**: Runs before saving a User document. It checks for or generates a unique employee identity, and hashes the password if modified.
4. **Password Comparison Method**: Implements an instance method to check plain-text passwords against the stored hash.
5. **Model Export**: Compiles the User model and exports it.

- **Lines 1-2 (Imports)**:
  - **Basic Function**: Load database and security dependencies.
  - **Detailed Explanation**: Imports `mongoose` (Line 1) for schema management and `bcrypt` (Line 2) for secure password hashing.
- **Lines 4-54 (User Schema Definition)**:
  - **Basic Function**: Define all schema properties, types, and database index options.
  - **Detailed Explanation**: Declares `userSchema` (Line 4). Properties include `accessToken`, `address`, `bankAccount`, `branch`, a reference to `Company` (Lines 13-14), `dateOfBirth`, a unique and lowercase-validated `email` (Line 18), `fullName`, `isVerified`, `joinDate` (defaulting to current date), OTP configurations (Lines 25-29), `password`, `phone`, profile `photo` ObjectId, `position`, `roleDescription`, `refreshToken`, a `role` enum string restricted to "employee" or "owner" (Lines 42-45), salary number, and a unique `identity` sparse-indexed string (Lines 49-53) to prevent collisions.
- **Lines 57-92 (Pre-Save Middleware)**:
  - **Basic Function**: Automatically configure fields and hash passwords prior to database insertions/updates.
  - **Detailed Explanation**: Registers a pre-save hook (Line 57). First, if the user doesn't have an `identity`, it defines a random character-generator (Lines 59-66) and runs a retry loop (Lines 70-78) attempting to generate and find if that code already exists in the database. If it exists, it retries up to 100 times. If it fails to get a unique code, it fails with an error (Line 80). Second, it verifies if the password is modified (Line 84). If so, it generates a salt with 10 rounds (Line 86) and hashes the user's password (Line 87).
- **Lines 95-97 (Password Comparison Method)**:
  - **Basic Function**: Add helper to compare password input.
  - **Detailed Explanation**: Declares an instance method `comparePassword` (Line 95) that calls `bcrypt.compare` asynchronously (Line 96) to match the incoming plain text password against the hashed string.
- **Lines 99-101 (Model Export)**:
  - **Basic Function**: Compile and export the User model.
  - **Detailed Explanation**: Compiles the Mongoose model named `User` (Line 99) and exports it (Line 101).
