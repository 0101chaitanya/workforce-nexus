# frontend/src/app/routes/UnauthorizedPage.jsx

## 1. Overview
`frontend/src/app/routes/UnauthorizedPage.jsx` renders a fallback page displaying either a 404 (Not Found) or a 403 (Access Restricted/Unauthorized) error message based on the navigation context.

## 2. Key Responsibilities & Flow
- Extracts routing information using `useLocation()` to detect if the landing context points to a 404 error or a role violation.
- Accesses the active authentication state from Redux (`state.auth`) to determine the user's role.
- If the user is authenticated and has a valid role, displays a primary navigation button linking back to their role's dashboard (`/owner` or `/employee`).
- If the user is unauthenticated, provides a redirect button leading to the `/login` screen.

## 3. Code Patterns & Best Practices
- **Dual-Purpose Error Component**: Consolidates both 404 and 403 error states into a single component, switching icons, headers, and descriptions dynamically based on the router state.
- **Role-Aware Redirection**: Customizes redirect destinations based on the user's role, providing a better user experience for signed-in users.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Acts as a fallback for routes that do not match registered endpoints or when a user tries to access routes their role is restricted from by `ProtectedRoute.jsx`.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Module & Asset Imports**: Imports React, React Router utilities, Redux state selectors, and icons.
2. **Context Resolution**: Retrieves current path information, reads token and role from the Redux store, and determines if this page was triggered by a 404 error or a role authorization violation.
3. **Dynamic UI Rendering**: Mounts the visual shell, displaying a custom header, description, and icon tailored to the error type.
4. **Role-based Redirection Actions**: Renders context-appropriate navigation links, sending authorized users to their respective dashboards and unauthenticated users to the login screen.

- **Lines 1-4 (Module & Asset Imports)**:
  - **Basic Function**: Imports routing, state hooks, and vector icons.
  - **Detailed Explanation**: Imports `Link` and `useLocation` from `react-router-dom` to support internal navigation and read router state. Imports `useSelector` to access Redux variables. Imports `ShieldOff` (for 403 access violations) and `FileQuestion` (for 404 not found states) from `lucide-react`.
  - **Key Function Calls**: None.
- **Lines 6-10 (Context Resolution)**:
  - **Basic Function**: Extracts state and decides which error type to render.
  - **Detailed Explanation**: Hooks into `useLocation()` and queries the Redux store for `token` and `role`. Calculates `is404` by checking if `location.state.is404` is true or if the current pathname does not contain the word `'unauthorized'`.
  - **Key Function Calls**:
    - `useLocation()`: Retrieves the current location object containing information about the active route from React Router. Takes no arguments. Returns the router location object.
    - `useSelector(selector)`: Called with selector function `(state) => state.auth` to select authentication credentials from Redux store. Returns the `{ token, role }` state object.
    - `location.pathname.includes(searchString)`: Invoked to check if the current path includes `'unauthorized'`. Argument is `'unauthorized'`. Returns a boolean indicating whether the substring exists in the pathname.
- **Lines 12-28 (Dynamic UI Rendering)**:
  - **Basic Function**: Renders error messages and icons.
  - **Detailed Explanation**: Creates a flex-centered container. Based on the calculated `is404` boolean:
    - Renders either a slate-colored box containing the `FileQuestion` icon or a rose-colored box with the `ShieldOff` icon.
    - Sets the title to `"404 — Page Not Found"` or `"Access Restricted"`.
    - Sets the description text to indicate a missing page or a permission violation.
  - **Key Function Calls**: None.
- **Lines 30-47 (Role-based Redirection Actions)**:
  - **Basic Function**: Renders redirection links based on authentication status.
  - **Detailed Explanation**: If a valid `token` and a known `role` ('owner' or 'employee') are present, displays a link button routing to `'/owner'` or `'/employee'` (with text "Go to Dashboard"). Otherwise, displays a link button routing to `'/login'` (with text "Go to Login" or "Return to Login").
  - **Key Function Calls**: None.
- **Line 50 (Export)**:
  - **Basic Function**: Exports the component.
  - **Detailed Explanation**: Exports `UnauthorizedPage` as the default export.
  - **Key Function Calls**: None.
