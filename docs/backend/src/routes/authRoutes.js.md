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
  - **Key Function Calls**:
    - `require("express")`: Loads the Express module to create routers and manage middlewares. Parameters: `"express"` (string). Returns: The exported Express framework function/object.
    - `require("../middleware/authMiddleware")`: Loads the authentication middleware module. Parameters: `"../middleware/authMiddleware"` (string). Returns: An object containing `protect`.
    - `require("../middleware/validationMiddleware")`: Loads the validation middleware module. Parameters: `"../middleware/validationMiddleware"` (string). Returns: An object containing `validate`.
    - `require("../schemas/authSchemas")`: Loads schemas configured for auth validations. Parameters: `"../schemas/authSchemas"` (string). Returns: The auth validation schemas object.
    - `require("../controllers/authController")`: Loads the auth controller module. Parameters: `"../controllers/authController"` (string). Returns: An object containing individual controller actions (`sendOtp`, `verifyOtp`, etc.).
- **Line 17 (Router Setup)**:
  - **Basic Function**: Initialize router.
  - **Detailed Explanation**: Instantiates the router instance `express.Router()` (Line 17).
  - **Key Function Calls**:
    - `express.Router()`: Creates a new modular router instance. Parameters: None. Returns: A new Express router object.
- **Lines 20-22 (Authentication Routes)**:
  - **Basic Function**: Define endpoints for user access session control.
  - **Detailed Explanation**:
    - `POST /login` runs body validation against `authSchemas.login` before calling `login` (Line 20).
    - `POST /logout` directly runs `logout` to clear cookie sessions (Line 21).
    - `POST /register` runs body validation against `authSchemas.register` before calling `register` (Line 22).
  - **Key Function Calls**:
    - `validate(authSchemas.login)`: Creates a request body validation middleware. Parameters: `authSchemas.login` (validation schema). Returns: A middleware function.
    - `router.post("/login", validate(...), login)`: Registers a POST route handler for the login endpoint. Parameters: `"/login"` (string), validation middleware, `login` (controller action). Returns: The router instance.
    - `router.post("/logout", logout)`: Registers a POST route handler for the logout endpoint. Parameters: `"/logout"` (string), `logout` (controller action). Returns: The router instance.
    - `validate(authSchemas.register)`: Creates a request body validation middleware. Parameters: `authSchemas.register` (validation schema). Returns: A middleware function.
    - `router.post("/register", validate(...), register)`: Registers a POST route handler for user registration. Parameters: `"/register"` (string), validation middleware, `register` (controller action). Returns: The router instance.
- **Lines 25-29 (OTP & Token Management Routes)**:
  - **Basic Function**: Manage onboarding verification challenges and token refresh requests.
  - **Detailed Explanation**:
    - `POST /send-otp` validates email and company parameters before calling `sendOtp` (Line 25).
    - `POST /verify-otp` validates OTP fields before calling `verifyOtp` (Line 26).
    - `POST /regenerate-access-token` calls `regenerateAccessToken` to refresh session tokens using HTTP cookies (Line 29).
  - **Key Function Calls**:
    - `validate(authSchemas.sendOtp)`: Creates a request body validation middleware. Parameters: `authSchemas.sendOtp` (validation schema). Returns: A middleware function.
    - `router.post("/send-otp", validate(...), sendOtp)`: Registers a POST route handler to send an OTP. Parameters: `"/send-otp"` (string), validation middleware, `sendOtp` (controller action). Returns: The router instance.
    - `validate(authSchemas.verifyOtp)`: Creates a request body validation middleware. Parameters: `authSchemas.verifyOtp` (validation schema). Returns: A middleware function.
    - `router.post("/verify-otp", validate(...), verifyOtp)`: Registers a POST route handler to verify an OTP. Parameters: `"/verify-otp"` (string), validation middleware, `verifyOtp` (controller action). Returns: The router instance.
    - `router.post("/regenerate-access-token", regenerateAccessToken)`: Registers a POST route handler to refresh access tokens. Parameters: `"/regenerate-access-token"` (string), `regenerateAccessToken` (controller action). Returns: The router instance.
- **Lines 32-36 (Profile & Password Reset Routes)**:
  - **Basic Function**: Retrieve logged-in user context and handle password recovery.
  - **Detailed Explanation**:
    - `GET /me` requires authentication via the `protect` middleware before calling `testGet` (Line 32).
    - `POST /forgot-password-otp` validates target emails/identities before calling `forgotPasswordOtp` (Line 35).
    - `POST /reset-password` validates the new credentials and OTP challenge before invoking `resetPassword` (Line 36).
  - **Key Function Calls**:
    - `router.get("/me", protect, testGet)`: Registers a GET route handler to fetch profile info. Parameters: `"/me"` (string), `protect` (middleware), `testGet` (controller action). Returns: The router instance.
    - `validate(authSchemas.forgotPasswordOtp)`: Creates a request body validation middleware. Parameters: `authSchemas.forgotPasswordOtp` (validation schema). Returns: A middleware function.
    - `router.post("/forgot-password-otp", validate(...), forgotPasswordOtp)`: Registers a POST route handler for OTP generation during password recovery. Parameters: `"/forgot-password-otp"` (string), validation middleware, `forgotPasswordOtp` (controller action). Returns: The router instance.
    - `validate(authSchemas.resetPassword)`: Creates a request body validation middleware. Parameters: `authSchemas.resetPassword` (validation schema). Returns: A middleware function.
    - `router.post("/reset-password", validate(...), resetPassword)`: Registers a POST route handler to update a user's password. Parameters: `"/reset-password"` (string), validation middleware, `resetPassword` (controller action). Returns: The router instance.
- **Line 38 (Module Export)**:
  - **Basic Function**: Export the router.
  - **Detailed Explanation**: Exports `router` (Line 38) to be bound to standard Express routes.
  - **Key Function Calls**: None.
