# frontend/src/app/axiosInterceptors.js

## 1. Overview
`frontend/src/app/axiosInterceptors.js` creates a configured Axios instance equipped with interceptors to handle authenticated request forwarding, transparent JWT token refresh cycles, and global authentication failure handling.

## 2. Key Responsibilities & Flow
- **Axios Configuration**: Creates an Axios client instance mapping `baseURL` to the environment variable `VITE_BACKEND_URL` and enabling `withCredentials: true` to support cross-origin cookie storage (crucial for receiving HTTP-Only refresh tokens).
- **Request Interceptor**: Intercepts outgoing requests, reads the short-lived JWT access token from `localStorage` under the key `token`, and appends it to the header as `Authorization: Bearer <token>` if present.
- **Response Interceptor & Token Regeneration**:
  - Monitors incoming response payloads. If a response returns an `HTTP 401 Unauthorized` status and the request has not already been retried (`!originalRequest._retry`), it triggers a silent refresh flow:
    1. Sets `_retry = true` to prevent infinite refresh loops.
    2. Sends a POST request to `/api/auth/regenerate-access-token` with credentials.
    3. On success, stores the new access token in `localStorage`, updates the failed request's `Authorization` header, and resubmits the request to the backend.
    4. On refresh failure (e.g. if the refresh token expired or was revoked), dispatches the Redux `logout()` action to clean local memory, clears local storage, and redirects the user to `/login`.

## 3. Code Patterns & Best Practices
- **Interceptors for Clean Code**: Centralizes JWT header injection and refresh logic, removing token management code from individual components.
- **HTTP-Only Cookie Refresh Channel**: Keeps the long-lived refresh token in an HTTP-Only cookie to prevent cross-site scripting (XSS) extraction, while storing the short-lived access token in local memory/localStorage.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- **Endpoints mapping**:
  - `POST /api/auth/regenerate-access-token` -> Invoked automatically by this interceptor on HTTP 401 response statuses to get a fresh access token.
  - `POST /api/auth/logout` -> Interceptors dispatch `logout()` and redirect the user when both the access token and refresh token are invalid.
- Fits as the networking layer for all feature modules (profile, payroll, leaves, dashboard, employees).

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Dependency Imports**: Imports axios, the Redux store, auth logout action, and navigation controls.
2. **Axios Instance Creation**: Instantiates a custom Axios client with base configurations.
3. **Request Interceptor**: Appends the current authorization token from `localStorage` to all outgoing requests.
4. **Response Interceptor & Token Refresh Flow**: Listens for HTTP 401 Unauthorized responses to silently refresh the access token via the backend endpoint, and triggers a logout/redirect if refreshing fails.

- **Lines 1-4 (Dependency Imports)**:
  - **Basic Function**: Imports tools for HTTP requests, state manipulation, and UI routing.
  - **Detailed Explanation**: Imports core `axios` library, the Redux `store` to dispatch actions, `logout` to reset auth state on token expiry, and the `navigate` helper to redirect user to login.
- **Lines 6-9 (Axios Instance Creation)**:
  - **Basic Function**: Configures the base parameters of the custom Axios client.
  - **Detailed Explanation**: Creates `axiosInterceptors` using `axios.create` with `baseURL` set from environment variables and `withCredentials: true` to send cookies (such as HTTP-only refresh tokens) with every request.
- **Lines 11-18 (Request Interceptor)**:
  - **Basic Function**: Modifies outgoing requests to include user authentication headers.
  - **Detailed Explanation**: Registers a request interceptor. It checks if an access token is stored under the `"token"` key in `localStorage`. If found, it adds the `Authorization: Bearer <token>` header to the request configuration. Returns the updated `config`.
- **Lines 20-48 (Response Interceptor & Token Refresh Flow)**:
  - **Basic Function**: Handles responses, monitoring for auth failures and executing token refresh logic.
  - **Detailed Explanation**: Registers a response interceptor.
    - If a response is successful, it returns it directly (`res => res`).
    - If an error occurs, it checks if `response.status` is `401` and the request was not already retried (`!originalRequest._retry`).
    - If so, it flags the request with `_retry = true` to avoid loops, and makes a POST call to `${import.meta.env.VITE_BACKEND_URL}/auth/regenerate-access-token`.
    - If the token refresh succeeds, it updates the access token in `localStorage`, sets the new `Authorization` header, and retries the original request.
    - If the token refresh fails, it catches the error, dispatches `logout()`, routes the user to `/login`, and rejects the promise.
- **Line 50 (Export)**:
  - **Basic Function**: Exports the Axios interceptor instance.
  - **Detailed Explanation**: Exposes the configured `axiosInterceptors` instance as the default export.
