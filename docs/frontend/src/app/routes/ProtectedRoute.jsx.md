# frontend/src/app/routes/ProtectedRoute.jsx

## 1. Overview
`frontend/src/app/routes/ProtectedRoute.jsx` implements client-side route guards, restricting access to views based on authentication status and user roles.

## 2. Key ResponsResponsibilities & Flow
- **Authentication Check**: Reads `token` and `role` from the Redux auth state.
- **Unauthenticated Handling & Stale Session Cleanup**: If no access token is present:
  - If a stale role is still stored in Redux, it schedules a background cleanup (dispatches `logout()` and posts a request to `/auth/logout`).
  - Redirects the user to the `/login` page, replacing the current history entry.
- **Role Verification**: If `allowedRoles` are specified (e.g. `['owner']` or `['employee']`), it checks if the user's active role matches. If there is a mismatch, redirects the user to `/404` to prevent access.
- **Child Rendering**: If all conditions are met, renders the wrapped children (or React Router's nested `<Outlet />` component).

## 3. Code Patterns & Best Practices
- **Stale State Cleanup**: Clears stale client states in a `setTimeout` block during the render loop to prevent React update warnings.
- **Declarative Guards**: Wraps routes in `App.jsx` with this guard component, keeping routing configurations clean.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- **Endpoints mapping**:
  - `POST /api/auth/logout` -> Called automatically if a stale local state is found without a corresponding token.
- Coordinated with backend router middleware (`authMiddleware.js`), which enforces the same role checks on API requests.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Module & Service Imports**: Imports React, Redux hooks, Router navigation targets, logout actions, and the custom Axios wrapper.
2. **Session Guard Logic**: Checks if an authentication token is present, and cleans up stale memory and backend sessions asynchronously if the token is missing.
3. **Role Validation Guard**: Restricts access based on the logged-in user's role parameters.
4. **Rendering Child Routes**: Yields either custom children elements or standard nested router outlets.

- **Lines 1-5 (Module & Service Imports)**:
  - **Basic Function**: Loads React core utilities, React Router components, Redux state handlers, and interceptor clients.
  - **Detailed Explanation**: Imports `useSelector` and `useDispatch` to manage Redux states, `Navigate` and `Outlet` to direct routing flows, `logout` to reset local state, and the customized `api` Axios interceptor client.
- **Lines 7-10 (Component Definition & Hook Hookup)**:
  - **Basic Function**: Declares component arguments and retrieves global authentication values.
  - **Detailed Explanation**: Declares `ProtectedRoute` accepting `children` and `allowedRoles` (defaulting to an empty array). Reads `token` and `role` from `state.auth` using `useSelector`, and initializes `dispatch`.
- **Lines 12-20 (Session Guard Logic)**:
  - **Basic Function**: Handles unauthenticated requests and stale state cleanup.
  - **Detailed Explanation**: Checks if `token` is missing. If a stale `role` remains in memory, it schedules a macro-task callback via `setTimeout` to call the `/auth/logout` API and dispatch `logout()`, avoiding React state updates during the render phase. Returns a `<Navigate to="/login" replace />` redirect element.
- **Lines 23-25 (Role Validation Guard)**:
  - **Basic Function**: Enforces role restrictions.
  - **Detailed Explanation**: If `allowedRoles` contains values and does not include the user's role, the user is redirected to the `/404` route (to prevent standard users from loading owner panels).
- **Lines 27-28 (Rendering Child Routes)**:
  - **Basic Function**: Mounts the nested layouts or children components.
  - **Detailed Explanation**: Renders `children` if passed. If not, renders `<Outlet />` to allow nested React Router children routes to mount.
- **Line 30 (Export)**:
  - **Basic Function**: Exports the component.
  - **Detailed Explanation**: Exports the `ProtectedRoute` component as default.
