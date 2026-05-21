# frontend/src/features/auth/authSlice.js

## 1. Overview
`frontend/src/features/auth/authSlice.js` manages global authentication states, user profiles, and API access tokens, synchronizing these values with the browser's `localStorage` for persistence.

## 2. Key Responsibilities & Flow
- **Initialization**: Automatically reads cached keys (`token`, `user`) from `localStorage` on page load, parsing JSON user objects to restore sessions across page reloads.
- **Reducers**:
  - `setLoading`: Updates loading spinners/actions.
  - `setAuthSuccess`: Saves the authenticated user profile, access token, and user role in the state, while persisting them to `localStorage` under `user` and `token`.
  - `setAuthFailed`: Captures failure messages from login or registration attempts.
  - `clearError`: Resets the active error message when switching authentication forms.
  - `logout`: Clears authentication state from the Redux store and deletes the cached keys from `localStorage`.

## 3. Code Patterns & Best Practices
- **Resilient Local Cache parsing**: Uses `try/catch` validation blocks when reading and parsing JSON user objects from `localStorage` on initialization, deleting malformed cache keys to prevent runtime errors.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Holds critical session variables used by request interceptors (`axiosInterceptors.js`) and routing guards (`ProtectedRoute.jsx`) to control client-side access.
- Synchronizes with backend controllers (`authController.js`), which issue and validate the JWT tokens stored in this slice.

---

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports & Local Cache Parsing (Lines 1-13)**: Resolves Redux slice builders and parses stored user/token parameters from browser local storage, handling parsing errors safely.
2. **Initial State (Lines 15-21)**: Establishes initial store parameters for authentication attributes like active user, session token, role, and loading/error states.
3. **Slice Reducer Definitions (Lines 23-57)**: Integrates action-handler functions (`setLoading`, `setAuthSuccess`, `setAuthFailed`, `clearError`, `logout`) that modify the state in Redux and keep local storage keys in sync.
4. **Action & Reducer Exports (Lines 59-60)**: Provides action triggers for application components and exports the default reducer for Redux store registration.

- **Lines 1-13 (Imports & Local Storage Check)**:
  - **Basic Function**: Imports Redux Toolkit's slice builder and retrieves cached user session data.
  - **Detailed Explanation**: Imports `createSlice` from `@reduxjs/toolkit`. Inspects `localStorage` for keys `token` and `user`. Wraps the parsing of `savedUser` in a `try-catch` block, removing the invalid key from local storage if a JSON parsing error occurs.
- **Lines 15-21 (initialState Definition)**:
  - **Basic Function**: Sets up default auth state values.
  - **Detailed Explanation**: Defines `initialState` properties: `user` (default `parsedUser`), `token` (default `savedToken` or null), `role` (default `parsedUser?.role` or null), `loading` (default `false`), and `error` (default `null`).
- **Lines 23-57 (authSlice Definition & Reducers)**:
  - **Basic Function**: Defines slice name, initial state, and reducers to handle auth actions.
  - **Detailed Explanation**: Uses `createSlice` with name `auth`. Declares 5 reducer functions:
    - `setLoading` (Lines 27-29): Updates the `loading` flag.
    - `setAuthSuccess` (Lines 30-40): Takes payload containing `user` and `accessToken`, updates state variables `user`, `token`, `role`, resets error, and sets `token` and stringified `user` inside `localStorage`.
    - `setAuthFailed` (Lines 41-44): Sets `loading` to false and updates `error` state.
    - `clearError` (Lines 45-47): Resets the `error` state back to `null`.
    - `logout` (Lines 48-55): Resets state credentials (`user`, `token`, `role`, `error`) and clears authentication keys from `localStorage`.
- **Lines 59-60 (Exports)**:
  - **Basic Function**: Exports action creators and the reducer.
  - **Detailed Explanation**: Destructures and exports action functions `setLoading`, `setAuthSuccess`, `setAuthFailed`, `clearError`, and `logout` from `authSlice.actions`, and exports `authSlice.reducer` as the default export.

