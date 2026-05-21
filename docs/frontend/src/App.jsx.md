# frontend/src/App.jsx

## 1. Overview
`frontend/src/App.jsx` defines the routing tree, mounts the main application layout, establishes role-based navigation guards, and integrates React Router Dom with Redux-driven navigation hooks.

## 2. Key Responsibilities & Flow
- **Routing Engine**: Sets up `<BrowserRouter>` to direct paths:
  - `/` -> Automatically redirects to `/login`.
  - `/login` -> Renders standard credential entry form (`Login.jsx`).
  - `/register` -> Renders organizational owner onboarding form (`Register.jsx`).
  - `*` -> Standard fallback displaying `UnauthorizedPage.jsx`.
- **Navigation Injections**: Renders `<NavigationSetter />` to invoke `useNavigate` and pass the router object to `setNavigate()` in `src/app/navigation.js`. This allows non-component files (like Axios interceptors) to trigger page transitions.
- **Route Authorization Shields**: Wraps dashboard views with `<ProtectedRoute>`:
  - Outer Level: Enforces authentication layout shell (`MainLayout.jsx`) using `ProtectedRoute` without specific parameters.
  - Inner Level (`/owner/*`): Restricts children to users matching the `owner` role.
  - Inner Level (`/employee/*`): Restricts children to users matching the `employee` role.
- **Performance Optimizations (Lazy Loading)**: Statically loads login/register forms for instant rendering, while lazy loading dashboard sub-views (using React `lazy` and `<Suspense>` with a spinner fallback) to reduce initial bundle sizes.

## 3. Code Patterns & Best Practices
- **Role Guard Layout Composition**: Uses nested Route structures to apply layout wrappers (`MainLayout.jsx`) and role assertions (`allowedRoles`) in a clean, declarative tree.
- **Service-Level Router Integration**: Solves the limitation of using React Router hooks in non-component files by passing the `navigate` instance to a mutable reference object in `navigation.js`.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- **Route and Controller mappings**:
  - `/owner` routes map to backend endpoints matching `owner` checks (such as `companyController.js` and `dashboardController.js` stats).
  - `/employee` routes map to backend routes matching profile, payroll, attendance, and leave management requests.
  - Interceptors (`axiosInterceptors.js`) leverage the navigation reference created here to route the user back to `/login` when token validation fails (HTTP 401).

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Core Imports**: Imports React core hooks, React Router elements, global navigation utility helpers, and statically loaded components.
2. **Lazy-Loaded Route Components**: Utilizes React `lazy` to dynamically load dashboard, profile, leaves, attendance, payroll, and organization views on-demand to improve startup bundle sizes.
3. **Loading Spinner Utility**: Defines a simple spinner UI fallback to display while lazy elements are being fetched.
4. **Navigation Setter Component**: Binds React Router's `useNavigate` hook to our custom non-React utility helper `setNavigate` so routing can be triggered from Axios interceptors.
5. **Main App Routing Configuration**: Coordinates the application routing tree, nesting authenticated routes under role checks and `MainLayout`.

- **Lines 1-10 (Core Imports)**:
  - **Basic Function**: Imports foundational React features, Router utilities, navigation helpers, and immediate components.
  - **Detailed Explanation**: Statically imports `lazy`, `Suspense`, `useEffect` from `react`; router components from `react-router-dom`; and auth views (`Login`, `Register`), layout (`MainLayout`), and guards (`ProtectedRoute`).
  - **Key Function Calls**: None.
- **Lines 12-23 (Lazy-Loaded Route Components)**:
  - **Basic Function**: Lazy loads non-critical, authenticated-only modules.
  - **Detailed Explanation**: Employs `lazy()` and dynamic `import()` to defer loading employee/owner attendance, leaves, payroll, dashboard, profile, and organization files, along with the `UnauthorizedPage`.
  - **Key Function Calls**:
    - `lazy(factory)`: A React function that allows you to render a dynamic import as a regular component. It takes a factory function as an argument and returns a React component.
    - `import(path)`: Dynamic ES module import that requests the specified JavaScript/JSX file asynchronously. It takes the file path string as an argument and returns a Promise that resolves to the module.
- **Lines 25-29 (Loading Spinner Utility)**:
  - **Basic Function**: Declares a spinning circular loading spinner.
  - **Detailed Explanation**: Creates `LoadingSpinner`, returning a full-screen flex container containing an spinning Indigo border circle.
  - **Key Function Calls**: None.
- **Lines 31-37 (Navigation Setter Component)**:
  - **Basic Function**: Extracts the router's navigate handle and saves it globally.
  - **Detailed Explanation**: Declares `NavigationSetter` which hooks into `useNavigate()` and invokes `setNavigate(navigate)` inside a `useEffect` loop. Returns `null` as it yields no markup.
  - **Key Function Calls**:
    - `useNavigate()`: A React Router hook that returns the `navigate` function to programmatically control navigation. It accepts no parameters.
    - `useEffect(effect, dependencies)`: A React hook to execute side effects. It accepts a callback function and a dependency array (`[navigate]`).
    - `setNavigate(navigate)`: A custom utility function from `./app/navigation.js` that registers the `navigate` function globally, enabling navigation from non-component modules (such as Axios interceptors). It accepts the `navigate` function as an argument and has the side effect of saving it in a mutable module-level variable.
- **Lines 39-167 (Main App Routing Configuration)**:
  - **Basic Function**: Renders the application routes, protecting sub-paths using role parameters.
  - **Detailed Explanation**:
    - Wraps the entire layout in `<BrowserRouter>` and `<NavigationSetter>`.
    - Routes `/` to redirect to `/login`. Renders `/login` and `/register` directly.
    - Wraps authenticated layout paths inside a nested route element containing `<ProtectedRoute><MainLayout /></ProtectedRoute>`.
    - Nest-routes `/owner` paths inside a `<ProtectedRoute allowedRoles={['owner']}>` guard, mounting components wrapped in `<Suspense fallback={<LoadingSpinner />}>`.
    - Nest-routes `/employee` paths inside a `<ProtectedRoute allowedRoles={['employee']}>` guard.
    - Captures any unmapped paths using `path="*"` to render `UnauthorizedPage`.
  - **Key Function Calls**: None (returns a declarative JSX configuration tree for React Router and contains no direct hook calls or helper function invocations within its body).
