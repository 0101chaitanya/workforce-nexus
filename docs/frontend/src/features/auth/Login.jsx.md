# frontend/src/features/auth/Login.jsx

## 1. Overview
`frontend/src/features/auth/Login.jsx` provides the workspace authentication user interface, enabling users to enter credentials or recover forgotten passwords using email verification.

## 2. Key Responsibilities & Flow
- **Interactive Forms**: Toggles between **Standard Login Mode** and **Account Recovery Mode** (which includes email recovery and OTP reset forms).
- **Authentication Sequence**:
  - Validates form values.
  - Sends a POST request to `/auth/login` containing the `email` (or identifier) and `password`.
  - Dispatches `setAuthSuccess` to store the user details and access token in the Redux store.
  - Inspects the user's role and redirects them to the appropriate dashboard (`/owner` or `/employee`).
- **Account Recovery Flow**:
  - Sends a POST request to `/auth/forgot-password-otp` with the target recovery email to receive an OTP.
  - Once the OTP is received, displays the reset form (OTP and new password fields).
  - Sends a POST request to `/auth/reset-password` containing the email, OTP, and new password.
  - Toggles back to the login view on success.

## 3. Code Patterns & Best Practices
- **Combined Login Identifier**: Supports logging in with either an email address or a unique alphanumeric Employee ID (e.g. `EMP-XXXXXX`).
- **Conditional Sub-form Views**: Manages recovery sub-forms (`isForgotMode`, `isOtpMode`) in local state to provide a smooth, single-page transition between flows.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- **Endpoints mapping**:
  - `POST /api/auth/login` -> Invoked by `handleAuthSubmit` to authorize credentials.
  - `POST /api/auth/forgot-password-otp` -> Invoked by `handleRecoverySubmit` to send an OTP email.
  - `POST /api/auth/reset-password` -> Invoked by `handleResetSubmit` to verify the OTP and set a new password.
- **Redux Integration**: Connects to the Redux `authSlice.js` using actions: `setAuthSuccess`, `setAuthFailed`, and `clearError`.
- **Validation**: Corresponds to backend Zod validation schemas: `authSchemas.login`, `authSchemas.forgotPasswordOtp`, and `authSchemas.resetPassword`.

---

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports & Setup (Lines 1-6)**: Imports React state/lifecycle hooks, Redux hooks, Router navigation utilities, custom axios instance, auth slice actions, and Lucide icons.
2. **Component Initialization and State (Lines 8-22)**: Sets up navigation, dispatch, Redux selector for error, and local state hooks for UI modes (`isForgotMode`, `isOtpMode`, `loading`, `successMessage`) and input data (`loginData`, `recoveryEmail`, `otp`, `newPassword`).
3. **Lifecycle Side Effects (Lines 24-26)**: Clears any previous auth errors whenever the user switches between login and recovery modes.
4. **Input Control & Auth Actions (Lines 28-100)**: Defines input change handler and asynchronous form submission handlers (`handleAuthSubmit` for login, `handleRecoverySubmit` for password recovery request, and `handleResetSubmit` for password reset).
5. **Interactive UI Layout (Lines 102-277)**: Renders the decorative sidebar (on large screens) and the interactive forms area which conditionally renders the Login form, the Forgot Password email form, or the OTP reset form.

- **Lines 1-6 (Imports)**:
  - **Basic Function**: Imports React hooks, Redux utilities, routing helpers, API client, and icons.
  - **Detailed Explanation**: Imports `useState` and `useEffect` for managing component state and lifecycle. Imports Redux hooks `useDispatch` and `useSelector` to dispatch actions and select state. Imports `Link` and `useNavigate` for routing. Imports `axiosInterceptors` for server communications. Imports `setAuthSuccess`, `setAuthFailed`, and `clearError` to update authentication slice state. Imports `Mail`, `Lock`, and `Briefcase` from `lucide-react` for form icons.
- **Lines 8-22 (State & Hooks)**:
  - **Basic Function**: Component instantiation and state definitions.
  - **Detailed Explanation**: Instantiates `useNavigate` and `useDispatch`. Selects global `error` state from Redux. Defines local state variables: `isForgotMode` (to switch to recovery view), `isOtpMode` (to show OTP input), `loading` (for submit buttons spinner status), and `successMessage` (for notifications). Defines state for `loginData` object (identifier and password), `recoveryEmail`, `otp`, and `newPassword`.
- **Lines 24-26 (useEffect Hook)**:
  - **Basic Function**: Clears errors on mode toggling.
  - **Detailed Explanation**: Runs `dispatch(clearError())` on mount and whenever `isForgotMode` changes, clearing previous authentication errors.
- **Lines 28-30 (handleInputChange)**:
  - **Basic Function**: Updates state for login inputs.
  - **Detailed Explanation**: Listens to input change events and updates `loginData` state dynamically by keying on `e.target.name`.
- **Lines 33-57 (handleAuthSubmit)**:
  - **Basic Function**: Submits login credentials to the backend.
  - **Detailed Explanation**: Prevents default browser reload. Sets loading state, clears errors. Posts `email` (lowercased/trimmed identifier) and `password` to `/auth/login`. On success, dispatches `setAuthSuccess(response.data)` and navigates the user to `/owner` or `/employee` depending on their role. On error, dispatches `setAuthFailed` with the server error message.
- **Lines 60-76 (handleRecoverySubmit)**:
  - **Basic Function**: Submits recovery email to request an OTP.
  - **Detailed Explanation**: Checks for `recoveryEmail` presence. Submits a POST request to `/auth/forgot-password-otp` with the email. On success, displays a success message, sets `isOtpMode` to `true`, and resets loading state.
- **Lines 78-100 (handleResetSubmit)**:
  - **Basic Function**: Resets the user's password using the received OTP.
  - **Detailed Explanation**: Validates OTP and new password presence. Submits a POST request to `/auth/reset-password` containing `recoveryEmail`, `otp`, and `newPassword`. On success, displays a success notification and resets recovery states after a 2-second timeout.
- **Lines 103-129 (Left Design Sidebar UI)**:
  - **Basic Function**: Renders the decorative sidebar on larger screens.
  - **Detailed Explanation**: Uses Tailwind styles (`hidden lg:flex`) to display a visual container featuring a linear gradient, blur circles, and branding elements including the `Briefcase` icon and text.
- **Lines 131-271 (Right Interactive Core Area UI)**:
  - **Basic Function**: Renders the forms for authorization, password recovery, and OTP submission.
  - **Detailed Explanation**: Implements conditional layouts:
    - If `!isForgotMode` (Lines 135-195), renders the workspace login form, including inputs for Corporate Email or ID (`Mail` icon) and Security Password (`Lock` icon), along with the submit button and a link to register a new firm.
    - If `isForgotMode` is active (Lines 197-268), renders the Account Recovery form:
      - If `!isOtpMode` (Lines 216-236), renders the email restoration form to request an OTP.
      - If `isOtpMode` is active (Lines 237-266), renders the reset form with fields for OTP and the new password.

