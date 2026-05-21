# frontend/src/features/auth/Register.jsx

## 1. Overview
`frontend/src/features/auth/Register.jsx` provides the workspace registration interface, allowing new owners to verify their emails with an OTP and register their organization.

## 2. Key Responsibilities & Flow
- **OTP Verification Flow**:
  - The user enters a company name, full name, and email address.
  - Clicking "Send OTP" sends a POST request to `/auth/send-otp` to email an OTP.
  - The user enters the OTP code and clicks "Verify", sending a POST request to `/auth/verify-otp`.
  - Once verified, the company and user configuration inputs are locked (`disabled={isEmailVerified}`).
- **Account Creation**:
  - Shows password creation and confirmation fields.
  - Submits registration details by sending a POST request to `/auth/register`.
  - Redirects the user to `/login` upon successful registration.

## 3. Code Patterns & Best Practices
- **Step-locked Fields**: Locks configuration inputs (`disabled={isEmailVerified}`) after verification to ensure registration is completed with the verified email address.
- **Client-side Password Validation**: Checks that the password and password confirmation match before enabling form submission, displaying inline error warnings when they differ.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- **Endpoints mapping**:
  - `POST /api/auth/send-otp` -> Invoked by `handleSendOtp` to request email validation.
  - `POST /api/auth/verify-otp` -> Invoked by `handleVerifyOtp` to confirm the OTP.
  - `POST /api/auth/register` -> Invoked by `handleSubmit` to create the company and owner records.
- **Redux Integration**: Uses `authSlice.js` actions (`setLoading`, `setAuthFailed`, `clearError`) to handle loading states and error messages.
- **Validation**: Corresponds to backend request validation schemas: `authSchemas.sendOtp`, `authSchemas.verifyOtp`, and `authSchemas.register`.

---

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports & Setup (Lines 1-6)**: Imports React and Redux hooks, Router components, custom axios interceptors client, authSlice actions, and Lucide icons.
2. **Component Initialization & State (Lines 8-26)**: Establishes dispatch and navigate hooks, selectors for global slice variables, and local states for form fields, OTP loading, password matching validations, and response success notifications.
3. **Authentication Lifecycle & Input Sync (Lines 28-34)**: Resets error displays on component mounting and manages dynamic inputs in `formData`.
4. **OTP Sending and Verification Controllers (Lines 36-78)**: Implements asynchronous routines requesting OTP codes from the backend and checking their accuracy to set verification flags.
5. **Form Submission & Password Checkers (Lines 80-112)**: Tracks password discrepancies automatically using a `useEffect` hook, validates completeness, and submits verified records to create organization files in the database.
6. **Interface Layouts (Lines 114-263)**: Implements the decorative left branding panel and the organization creation setup forms on the right.

- **Lines 1-6 (Imports)**:
  - **Basic Function**: Imports React and Redux hooks, Router components, axios interceptors client, authSlice actions, and Lucide icons.
  - **Detailed Explanation**: Imports `React`, `useState`, and `useEffect` hooks. Imports Redux hooks `useDispatch` and `useSelector`. Imports `Link` and `useNavigate` for navigation. Imports `axiosInterceptors` for API calls. Imports actions `setLoading`, `setAuthFailed`, and `clearError` from `authSlice`. Imports multiple icons from `lucide-react`.
- **Lines 8-26 (State & Hooks)**:
  - **Basic Function**: Component instantiation and state definitions.
  - **Detailed Explanation**: Instantiates dispatch and navigate hooks. Extracts `loading` and `error` from global Redux state. Sets up local state for `formData` (companyName, fullName, email, otp, password, confirmPassword), `isOtpSent`, `isEmailVerified`, `otpLoading` (for verification request indicators), `passwordError` (for validation alerts), and `successMessage` (for notifications).
- **Lines 28-30 (useEffect)**:
  - **Basic Function**: Clears previous authentication errors.
  - **Detailed Explanation**: Fires `dispatch(clearError())` when the component mounts to reset any errors stored in Redux state.
- **Lines 32-34 (handleChange)**:
  - **Basic Function**: Handles form field updates.
  - **Detailed Explanation**: Updates specific keys in the local `formData` state object based on the input name dynamically.
- **Lines 36-56 (handleSendOtp)**:
  - **Basic Function**: Sends an email verification OTP code request to the server.
  - **Detailed Explanation**: Validates that an email is present. Sets `otpLoading` state, clears errors and success messages. Sends a POST request to `/auth/send-otp` with the email and company name. On success, sets `isOtpSent` to `true` and prints a success notification.
- **Lines 58-78 (handleVerifyOtp)**:
  - **Basic Function**: Verifies the OTP code submitted by the user.
  - **Detailed Explanation**: Checks that the OTP field is populated. Sets `otpLoading` to true, clears errors and success messages. Sends a POST request to `/auth/verify-otp` with the email and the parsed numeric OTP. On success, sets `isEmailVerified` to `true` and updates the success notification.
- **Lines 80-86 (useEffect)**:
  - **Basic Function**: Monitors passwords for mismatches.
  - **Detailed Explanation**: Compares `password` and `confirmPassword` and sets `passwordError` to a mismatch warning if they differ, clearing it when they match.
- **Lines 88-112 (handleSubmit)**:
  - **Basic Function**: Registers the new company and owner user account.
  - **Detailed Explanation**: Prevents standard form reload. Checks email verification status. Dispatches loading state, clears errors and success messages. Sends a POST request to `/auth/register` containing `fullName`, `email`, and `password`. Displays a successful setup message and redirects to `/login` after a 2-second timeout.
- **Lines 114-141 (Left Design Sidebar UI)**:
  - **Basic Function**: Renders decorative sidebar on larger screens.
  - **Detailed Explanation**: Displays branding elements, portal name, tagline, and corporate description inside a styled Tailwind container hidden on smaller screens.
- **Lines 143-259 (Right Interactive Form Area UI)**:
  - **Basic Function**: Renders registration forms and action buttons.
  - **Detailed Explanation**: Houses inputs for Company Name and Owner Full Name (which are disabled once email is verified), the Corporate Email address with a "Send OTP" button, a conditional verification field for OTP if it has been sent, status message blocks, and password/confirm password fields that are interactive only after successful email verification. Includes the submit button and navigation links.

