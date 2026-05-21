# backend/src/routes/authRoutes.js

## 1. Overview
`backend/src/routes/authRoutes.js` registers authentication endpoints under `/api/auth/` and binds them to request validation schemas and controller actions.

## 2. Key Responsibilities & Flow
Maps paths to the following middleware/controller chains:
- **`POST /login`**: Validates request body against `authSchemas.login`, then triggers `login` in `authController.js`.
- **`POST /logout`**: Directly triggers `logout`.
- **`POST /register`**: Validates request body against `authSchemas.register`, then triggers `register`.
- **`POST /send-otp`**: Validates request body against `authSchemas.sendOtp`, then triggers `sendOtp`.
- **`POST /verify-otp`**: Validates request body against `authSchemas.verifyOtp`, then triggers `verifyOtp`.
- **`POST /regenerate-access-token`**: Triggers `regenerateAccessToken`.
- **`GET /me`**: Enforces authorization verification via `protect` middleware, then logs/returns verified user payload contexts.
- **`POST /forgot-password-otp`**: Validates request body against `authSchemas.forgotPasswordOtp`, then triggers `forgotPasswordOtp`.
- **`POST /reset-password`**: Validates request body against `authSchemas.resetPassword`, then triggers `resetPassword`.

## 3. Code Patterns & Best Practices
- **Route-Level Declarative Validation**: Intercepts request flows at the router declaration level using the `validate(schema)` middleware. This ensures controllers only process validated payloads.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Exposes all entry points required by frontend authentication components, including the state slices (`authSlice.js`), login screens (`Login.jsx`), registration screens (`Register.jsx`), and request headers in `axiosInterceptors.js`.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports**: Imports Express, validation and authentication middlewares, validation schemas, and auth controller methods.
2. **Router Setup**: Instantiates the Express router.
3. **Authentication Routes**: Registers endpoints for logging in, logging out, and registering new users.
4. **OTP & Token Management Routes**: Handles OTP creation, OTP verification, and access token regeneration.
5. **Profile & Password Reset Routes**: Secure profile fetching and forgot/reset password operations.
6. **Module Export**: Exports the authentication router.

- **Lines 1-15 (Imports)**:
  - **Basic Function**: Load required libraries and controllers.
  - **Detailed Explanation**: Imports `express` (Line 1), authentication middleware `protect` (Line 2), validation middleware `validate` (Line 3), auth schema validators `authSchemas` (Line 4), and extracts individual controller functions from `authController.js` (Lines 5-15).
- **Line 17 (Router Setup)**:
  - **Basic Function**: Initialize router.
  - **Detailed Explanation**: Instantiates the router instance `express.Router()` (Line 17).
- **Lines 20-22 (Authentication Routes)**:
  - **Basic Function**: Define endpoints for user access session control.
  - **Detailed Explanation**:
    - `POST /login` runs body validation against `authSchemas.login` before calling `login` (Line 20).
    - `POST /logout` directly runs `logout` to clear cookie sessions (Line 21).
    - `POST /register` runs body validation against `authSchemas.register` before calling `register` (Line 22).
- **Lines 25-29 (OTP & Token Management Routes)**:
  - **Basic Function**: Manage onboarding verification challenges and token refresh requests.
  - **Detailed Explanation**:
    - `POST /send-otp` validates email and company parameters before calling `sendOtp` (Line 25).
    - `POST /verify-otp` validates OTP fields before calling `verifyOtp` (Line 26).
    - `POST /regenerate-access-token` calls `regenerateAccessToken` to refresh session tokens using HTTP cookies (Line 29).
- **Lines 32-36 (Profile & Password Reset Routes)**:
  - **Basic Function**: Retrieve logged-in user context and handle password recovery.
  - **Detailed Explanation**:
    - `GET /me` requires authentication via the `protect` middleware before calling `testGet` (Line 32).
    - `POST /forgot-password-otp` validates target emails/identities before calling `forgotPasswordOtp` (Line 35).
    - `POST /reset-password` validates the new credentials and OTP challenge before invoking `resetPassword` (Line 36).
- **Line 38 (Module Export)**:
  - **Basic Function**: Export the router.
  - **Detailed Explanation**: Exports `router` (Line 38) to be bound to standard Express routes.
