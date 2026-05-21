# frontend/src/components/layout/MainLayout.jsx

## 1. Overview
`frontend/src/components/layout/MainLayout.jsx` provides the master layout shell for authenticated users, offering responsive sidebar navigation, workspace branding, and session termination handlers.

## 2. Key Responsibilities & Flow
- **Role-Based Sidebars**: Inspects the user's role from the Redux store:
  - **`owner` Links**: Dashboard (`/owner`), Organization (`/owner/organization`), Employees (`/owner/employees`), Attendance (`/owner/attendance`), Leaves (`/owner/leaves`), Payroll (`/owner/payroll`).
  - **`employee` Links**: Dashboard (`/employee`), Profile (`/employee/profile`), Attendance (`/employee/attendance`), Leaves (`/employee/leaves`), Payroll (`/employee/payroll`).
- **Responsive Drawer and Collapse Engine**:
  - Desktop: Includes a toggle to collapse the navigation sidebar into a compact icon-only column.
  - Mobile/Tablet: Hides the sidebar by default and uses a slide-out navigation drawer with a blur backdrop overlay.
- **Session Termination**: The logout button triggers a sequence:
  - Sends a POST request to `/auth/logout` to clear the HTTP-Only refresh token cookie on the backend.
  - Dispatches the Redux `logout()` action to clear user state.
  - Clears `localStorage` (removing access tokens).
  - Redirects the user to the `/login` route.

## 3. Code Patterns & Best Practices
- **Collapsible Sidebar Layout**: Uses responsive Tailwind utility classes (`w-20` vs `w-64`, `-translate-x-full` vs `translate-x-0`) to toggle layout widths smoothly.
- **Active Navigation Styling**: Employs React Router's `<NavLink>` with inline functions to apply active styling to the currently selected route.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- **Endpoints mapping**:
  - `POST /api/auth/logout` -> Called by `handleLogout` to invalidate the active user session on the backend.
- Displays workspace parameters like the company name (`user.companyName`) stored during user onboarding.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Module & Asset Imports**: Imports React, React Router components, Redux hooks, logout actions, the custom Axios client, and vector icons.
2. **State & Selector Hookups**: Sets sidebar collapsing state, mobile overlay toggle state, and fetches auth data from the Redux store.
3. **Session Logout Handler**: Handles session logout by invoking the backend logout endpoint, cleaning up local storage, clearing Redux memory, and redirecting the browser.
4. **Navigation Options Definition**: Declares role-specific sidebar lists for owners and employees.
5. **Dynamic Styling Modifiers**: Computes CSS styling rules for responsive sidebars and NavLink active/inactive states.
6. **Sidebar Navigation Shell**: Renders the background overlay for mobile screens and the main collapsible/responsive sidebar containing branding and links.
7. **Workspace Core Content Area**: Integrates the top mobile header and the dynamic React Router `<Outlet />` element to mount route pages.

- **Lines 1-9 (Module & Asset Imports)**:
  - **Basic Function**: Imports React, routing controls, state hooks, and sidebar icons.
  - **Detailed Explanation**: Imports `useState` from React, navigation hooks/components (`NavLink`, `useNavigate`, `Outlet`) from React Router, state hooks (`useSelector`, `useDispatch`) from React Redux, the `logout` action, the configured Axios interceptor instance `api`, and icons from `lucide-react`.
- **Lines 11-22 (State & Selector Hookups)**:
  - **Basic Function**: Declares component state variables and user contexts.
  - **Detailed Explanation**: Defines `isCollapsed` state to control laptop sidebar size, and `mobileOpen` to toggle the drawer on mobile viewports. Connects `useNavigate` and `useDispatch`. Selects `user` and `role` from Redux auth state. Normalizes role to `userRole` and sets a fallback `companyName`.
- **Lines 24-33 (Session Logout Handler)**:
  - **Basic Function**: Executes the session termination sequence.
  - **Detailed Explanation**: Defines asynchronous `handleLogout` which issues a POST request to `/auth/logout`. If it fails, logs the error. It then dispatches the `logout()` action, clears local storage items (removing JWT tokens), and navigates the browser to `/login`.
- **Lines 35-54 (Navigation Options Definition)**:
  - **Basic Function**: Lists the link names, paths, and icons representing views available to each role.
  - **Detailed Explanation**: Declares `ownerLinks` with 6 paths mapping owner tools. Declares `employeeLinks` with 5 paths mapping employee tools. Determines the active navigation array `primaryLinks` based on the user's role.
- **Lines 56-61 (Dynamic Styling Modifiers)**:
  - **Basic Function**: Prepares CSS utility styles.
  - **Detailed Explanation**: Calculates `sidebarWidth` (`w-20` if collapsed, `w-64` if not). Computes `mobileTranslate` to slide-in or hide sidebars. Defines styling string variables for active (`linkActive`) and inactive (`linkInactive`) nav links.
- **Lines 63-70 (Mobile Backdrop)**:
  - **Basic Function**: Renders a dismissal overlay for mobile drawers.
  - **Detailed Explanation**: Displays a dark backdrop overlay (`bg-slate-900/40`) with blur filters on mobile screens when `mobileOpen` is active, closing the drawer when clicked.
- **Lines 72-122 (Sidebar Navigation Shell)**:
  - **Basic Function**: Renders the complete, high-contrast sidebar framework.
  - **Detailed Explanation**:
    - Mounts the `<aside>` container, applying calculated widths and translate classes.
    - Displays the company name or first-letter abbreviation depending on the `isCollapsed` toggle.
    - Provides a collapse arrow button for desktop screens to toggle `isCollapsed`.
    - Iterates over `primaryLinks` to render `<NavLink>` items. Customizes classes via a dynamic callback based on the active path state.
    - Renders a logout button at the bottom of the sidebar.
- **Lines 124-148 (Workspace Core Content Area)**:
  - **Basic Function**: Holds the main route contents and mobile headers.
  - **Detailed Explanation**:
    - Wraps the right workspace area with margins adjusting dynamically for the sidebar width.
    - Renders the mobile header (sticky `h-16`) containing a menu icon to toggle `mobileOpen` and the company branding.
    - Sets up the main content container wrapping `<Outlet />` inside `<React.Suspense>` to show a loading spinner while lazy components load.
