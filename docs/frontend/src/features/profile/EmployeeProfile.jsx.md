# EmployeeProfile.jsx

## 1. Overview
The `EmployeeProfile.jsx` component provides the profile settings interface for authenticated employees or owners. It serves as a dashboard panel allowing users to view corporate profile details (such as identity token, email, corporate position, organization branch, and start date), verify account status, update editable personal details (full name, phone, residential address, bank account, and date of birth), and update their login password credentials.

---

## 2. Key Responsibilities & Flow
- **Initialization & Fetching Profile Info**:
  - The component fetches full profile details from the backend upon mounting via `fetchProfileDetails()` using the current authenticated user's ID (`user._id`) from Redux store.
  - While fetching, a loader animation is rendered. If an error is encountered, a descriptive alert box is displayed.
- **Personal Details Form State & Submission**:
  - A form maintains input states for full name, phone number, address, date of birth, and bank account.
  - On submitting, `handleProfileSubmit(e)` packages the form fields and sends a `PUT` request to `/api/users/profile`.
  - Upon a successful response, the local success message state is set, the Redux auth state is updated via `dispatch(setAuthSuccess(...))` to keep the global user profile info synchronized, and `fetchProfileDetails()` is re-invoked to sync the component's state.
- **Password Form State & Submission**:
  - A change password form maintains fields for `oldPassword`, `newPassword`, and `confirmPassword`.
  - When submitting, client-side validation ensures the new passwords match and meet a minimum length restriction (>= 6 characters).
  - A `PUT` request is dispatched to `/api/users/change-password` containing `oldPassword` and `newPassword`.
  - On success, it clears the password input fields and sets a success message notification.
- **Aesthetics & UI Elements**:
  - Built using standard modern Tailwind CSS flex/grid structures, customized HSL colors, glassmorphism borders (`border-slate-200/80`), shadows (`shadow-xs`), and Lucide React icons.
  - Implements loading indicator spin animation states (`Loader2`) for asynchronous buttons.

---

## 3. Code Patterns & Best Practices
- **Global & Local State Integration**:
  - Uses Redux hooks (`useSelector`, `useDispatch`) to hook into global auth state (`state.auth.user`) and keep it synchronized when updates occur.
  - Uses React `useState` hooks to manage local form elements, loader states (`loading`, `saveLoading`, `passwordLoading`), and response outputs (`error`, `successMessage`).
- **Axios Custom Client**:
  - Executes server calls through the custom wrapper `api` defined in `axiosInterceptors.js`, automatically adding Auth bearer tokens and catching session expiration events.
- **Security & Client-Side Validation**:
  - Validates `newPassword` match and length requirements before firing an API request, reducing network calls.
  - Sensitive details (like passwords) are submitted via secure POST/PUT JSON request payloads.

---

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
This frontend component maps to the following backend elements:
- **Routes / Endpoints consumed**:
  - `GET` `/api/users/info/:id` -> Managed by `userRoutes.js` and `userController.js` (`getUserInfo`).
  - `PUT` `/api/users/profile` -> Managed by `userRoutes.js` and `userController.js` (`updateProfile`). Validated using `userSchemas.updateProfileSchema`.
  - `PUT` `/api/users/change-password` -> Managed by `userRoutes.js` and `userController.js` (`changePassword`). Validated using `userSchemas.changePasswordSchema`.
- **Mongoose Model Reference**:
  - Modifies fields mapped to the `User` model (`User.js` schema properties: `fullName`, `phone`, `address`, `dateOfBirth`, `bankAccount`, `password`).

---

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports & Setup (Lines 1-8)**: Resolves React state/lifecycle utilities, Redux global hooks, customized API client instance, and visual icon symbols.
2. **Local Component State (Lines 14-35)**: Manages layout state behaviors (loading spin, error notification strings) and holds editable form fields.
3. **Data Loading Actions (Lines 38-59)**: Queries the backend database to pull user settings on mount.
4. **Form Submit Controllers (Lines 68-135)**: Coordinates user inputs, checks password matching credentials, sends updates to the database, and updates Redux state.
5. **Conditional Page Layout Renderings (Lines 137-162)**: Displays loaders or alerts based on response outputs.
6. **Main Presentation UI (Lines 166-384)**: Renders the layout grid columns, fields, and action buttons.

- **Lines 1-8 (Imports)**:
  - Imports React hooks (`useState`, `useEffect`) for managing local component state and lifecycle side effects.
  - Imports Redux hooks (`useSelector`, `useDispatch`) to hook into global state and dispatch actions.
  - Imports custom axios client `api` for authenticated HTTP requests.
  - Imports Redux action `setAuthSuccess` from `authSlice` to update global authentication state.
  - Imports graphical icon components (`User`, `Mail`, etc.) from the `lucide-react` package.
  - **Key Function Calls**: None.
- **Lines 10-13 (Component Definition & Redux hooks)**:
  - Defines default function `EmployeeProfile`.
  - Instantiates `dispatch` function and destructures the currently logged-in `user` object from Redux `state.auth`.
  - **Key Function Calls**:
    - `useDispatch()`: Fetches the Redux dispatch function from the store.
    - `useSelector((state) => state.auth)`: Accesses the global Redux state to retrieve the `user` object.
- **Lines 15-20 (State Hooks)**:
  - `profile`: Stores the detailed profile object retrieved from the database.
  - `loading`: Tracks loading state during database lookup (default `true`).
  - `saveLoading`: Tracks asynchronous execution status of the profile update request (default `false`).
  - `passwordLoading`: Tracks status of password update requests (default `false`).
  - `error`: Holds error message string to display (default `null`).
  - `successMessage`: Holds success notification message string (default `null`).
  - **Key Function Calls**:
    - `useState(initialValue)`: Used multiple times to define and initialize component-level state variables (`profile`, `loading`, `saveLoading`, `passwordLoading`, `error`, `successMessage`).
- **Lines 23-29 (profileForm State)**:
  - Initializes state for the profile update fields, setting them to empty string values initially.
  - **Key Function Calls**:
    - `useState(initialValue)`: Initializes `profileForm` state with an object containing fields: `fullName`, `phone`, `address`, `dateOfBirth`, and `bankAccount`.
- **Lines 31-35 (passwordForm State)**:
  - Initializes state for password inputs: `oldPassword`, `newPassword`, and `confirmPassword`.
  - **Key Function Calls**:
    - `useState(initialValue)`: Initializes `passwordForm` state with fields: `oldPassword`, `newPassword`, and `confirmPassword`.
- **Lines 38-59 (fetchProfileDetails function)**:
  - An asynchronous function that queries `GET /api/users/info/${user._id}` using the custom interceptors instance.
  - Populates the detailed `profile` record state.
  - Prefills the `profileForm` fields with returned values, using `split('T')[0]` on date elements to transform date strings into the compatible `yyyy-MM-dd` layout for input pickers.
  - Catches failures to log a descriptive message using `setError`.
  - **Key Function Calls**:
    - `setLoading(true / false)`: Controls the spinner visibility state before and after the API call.
    - `setError(message / null)`: Resets the error state at start, or sets it to error messages upon failure.
    - `api.get(url)`: Performs an asynchronous HTTP GET request to retrieve profile details using user's ID.
    - `setProfile(details)`: Stores retrieved profile details in the state.
    - `setProfileForm(details)`: Pre-populates the input form fields with retrieved values.
    - `split('T')`: Truncates ISO date strings at 'T' to retrieve only the date portion (e.g. `YYYY-MM-DD`).
- **Lines 61-65 (useEffect Hook)**:
  - Triggers a call to `fetchProfileDetails()` automatically upon component mount once the user ID becomes available.
  - **Key Function Calls**:
    - `useEffect(callback, dependencies)`: Triggers side-effects when dependencies (`user?._id`) update.
    - `fetchProfileDetails()`: Initiates the fetch process to retrieve user details from the backend.
- **Lines 68-97 (handleProfileSubmit handler)**:
  - Event handler for the profile changes form.
  - Prevents standard page reloading via `e.preventDefault()`.
  - Builds payload object, mapping inputs to `undefined` if empty to omit empty strings from updating.
  - Puts updates to `/api/users/profile`.
  - On successful response, merges existing Redux user values with updated payload properties and dispatches `setAuthSuccess` to sync global state.
  - Re-triggers details retrieval to refresh the UI text.
  - **Key Function Calls**:
    - `e.preventDefault()`: Prevents standard form submission and page reloading.
    - `setSaveLoading(true / false)`: Controls visual loading spinner on the submit button.
    - `setError(message / null)`: Resets error state or sets the error feedback when updates fail.
    - `setSuccessMessage(message / null)`: Manages success feedback banners.
    - `new Date(dateString)`: Instantiates a Date object representing selected birthdate.
    - `toISOString()`: Converts date object to ISO format for Mongoose schema compatibility.
    - `api.put(url, payload)`: Executes HTTP PUT request to update profile details.
    - `localStorage.getItem('token')`: Retrieves JWT token from client storage to pass into dispatch.
    - `setAuthSuccess(payload)`: Action creator to prepare the state sync action.
    - `dispatch(action)`: Dispatches `setAuthSuccess` to synchronize user auth slice in the Redux store.
    - `fetchProfileDetails()`: Refresh local component state with newly updated values.
- **Lines 100-135 (handlePasswordSubmit handler)**:
  - Event handler for changing the login password.
  - Validates that new passwords match and are at least 6 characters.
  - Dispatches `PUT /api/users/change-password` containing old password and new password parameters.
  - Clears password forms and prints success messages on success.
  - **Key Function Calls**:
    - `e.preventDefault()`: Prevents default browser form submissions.
    - `setError(message / null)`: Manages error state validations (matching check, length limit, API errors).
    - `setSuccessMessage(message / null)`: Clears and displays password success notifications.
    - `setPasswordLoading(true / false)`: Updates loader states for button submissions.
    - `api.put(url, payload)`: Issues HTTP PUT request to modify passwords.
    - `setPasswordForm(fields)`: Clears input values within state variables upon success.
- **Lines 137-162 (Conditional State UI Returns)**:
  - Lines 137-144: Returns full page loading spinner UI when state is loading.
  - Lines 146-153: Returns error alert callout box if an error state is active.
  - Lines 155-162: Returns success alert callout box if a success message exists.
  - **Key Function Calls**: None.
- **Line 164 (initials calculation)**:
  - Takes the full name, splits it by space, takes the first letters of first and last names, converts them to uppercase, and grabs up to 2 letters for the user's avatar initial badge.
  - **Key Function Calls**:
    - `split(' ')`: Breaks up full name into components by space characters.
    - `map(callback)`: Pulls out the first character of each word component.
    - `join('')`: Compiles array characters back to a single initials string.
    - `toUpperCase()`: Converts characters to capital letters.
    - `substring(0, 2)`: Grabs first 2 characters from result.
- **Lines 166-384 (Main Component Layout Render)**:
  - Lines 170-180: Outer banner displaying page titles.
  - Lines 186-205: Profile Card (displays calculated avatar initials, full name, position, and account verification status badge).
  - Lines 207-235: Corporate info panel showing employee identification token, email address, job role, branch assignment, and company joining date.
  - Lines 241-317: Edit Personal Details form container rendering text inputs mapped to `profileForm` variables (Full Name, Contact, DOB, Bank account, Address text-area) and the submit button.
  - Lines 320-376: Security Credentials form container rendering password inputs mapped to `passwordForm` variables (Current Password, New Password, Confirm Password) and the submit button.
  - **Key Function Calls**:
    - `new Date(dateString)`: Instantiates a Date object representing user joining date.
    - `toLocaleDateString()`: Converts joining date object to localized date format string.
    - `setProfileForm(value)`: Triggers updates to profile form fields when values change.
    - `setPasswordForm(value)`: Triggers updates to password form fields when values change.


