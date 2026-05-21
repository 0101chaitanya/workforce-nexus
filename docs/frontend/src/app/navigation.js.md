# frontend/src/app/navigation.js

## 1. Overview
`frontend/src/app/navigation.js` provides a bridge that enables non-component JS files (such as Axios interceptors) to trigger React Router navigation.

## 2. Key Responsibilities & Flow
- **`setNavigate(fn)`**: Receives the `navigate` hook instance from a mounted React component (called in `App.jsx`) and stores it in a local, mutable variable.
- **`navigate(to, options)`**: Checks if the component navigation hook is set. If present, calls it to perform a smooth single-page transition. If not, falls back to a standard browser-level redirection using `window.location.href`.

## 3. Code Patterns & Best Practices
- **Global Navigation Bridge**: Bypasses the constraint that React Router's hooks (like `useNavigate`) can only be called within the context of React component render cycles, allowing utility files to handle page redirects.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Used by Axios interceptors (`axiosInterceptors.js`) to redirect the user to `/login` when token validation fails (HTTP 401).

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Navigate Storage Variable**: Declares a mutable reference to store React Router's navigation function.
2. **Navigation Setter**: Defines a setter function to bind React Router's navigation hook to the reference variable.
3. **Trigger Navigation Helper**: Exports a wrapper function that uses the saved React Router navigation function if available, or falls back to traditional browser-level redirection.

- **Lines 1-1 (Navigate Storage Variable)**:
  - **Basic Function**: Holds the reference to React Router's navigation function.
  - **Detailed Explanation**: Declares a mutable let-bound variable `navigateFn` and initializes it to `null`.
- **Lines 3-5 (Navigation Setter)**:
  - **Basic Function**: Binds the navigation function from React context to our outer reference.
  - **Detailed Explanation**: Defines and exports `setNavigate` which receives a function `fn` (usually returned by `useNavigate()`) and assigns it to `navigateFn`.
- **Lines 7-13 (Trigger Navigation Helper)**:
  - **Basic Function**: Triggers redirection/navigation to a new route path.
  - **Detailed Explanation**: Defines and exports `navigate` which takes a path `to` and transition `options`. If `navigateFn` is set, it executes it with the parameters. Otherwise, it changes the window's current location directly via `window.location.href = to`.
