# Authentication & Security Interview Questions & Answers

## 1. How is authentication state stored in the frontend?
### Answer:
`authSlice.js` stores `user`, `token`, `role`, and `loading` in Redux state. It also persists `token` and `user` in `localStorage` so the session survives page refreshes.

## 2. What is the difference between `authApi` and `axiosInterceptors`?
### Answer:
- `authApi` is a plain Axios instance used for public authentication endpoints such as `/auth/login`, `/auth/register`, `/auth/send-otp`, etc. It does not attach an Authorization header.
- `axiosInterceptors` is the authenticated Axios instance used for protected requests. It attaches the `Bearer` token, handles `401` responses, and performs token refresh.

## 3. How does token refresh work?
### Answer:
`axiosInterceptors` includes a response interceptor that detects `401` errors. If an endpoint fails with a 401 and the request has not retried before, it calls `/auth/regenerate-access-token`. If refresh succeeds, it updates localStorage and Redux with the new token, then retries the original request.

## 4. How is route protection implemented?
### Answer:
`ProtectedRoute.jsx` checks Redux auth state. If there is no token, it redirects to `/login`. If the user is authenticated but their role does not match `allowedRoles`, it redirects to `/404`. Otherwise, it renders the child routes.

## 5. Why is `withCredentials: true` used in Axios configs?
### Answer:
`withCredentials: true` ensures cookies are included in cross-site requests. This is used for refresh token endpoints or server sessions where the backend sets secure cookies for token renewal.

## 6. What happens when logout is triggered?
### Answer:
`MainLayout.jsx` sends `POST /auth/logout` via `api`. It then dispatches the `logout()` action, clears localStorage, and navigates to `/login`.

## 7. What are security advantages of storing only the access token in localStorage?
### Answer:
Storing the access token allows the app to persist the session across refreshes. However, it should be paired with a refresh mechanism or short TTL to reduce the impact of token theft. Refresh tokens are often stored as HttpOnly cookies on the backend.

## 8. Why is role-based access control important in this app?
### Answer:
Because owners and employees have different capabilities. Owners can manage employees, approve leaves, and view payroll, while employees can view and update only their own profile, attendance, leave status, and payroll. Role-based routing enforces this separation in the UI.

## 9. How could the authentication flow be improved?
### Answer:
- Use HttpOnly cookies for refresh tokens and only store the short-lived access token in memory.
- Add silent refresh before the token expires rather than waiting for 401.
- Implement refresh token rotation on the server for extra security.
- Add stricter backend authorization checks on every protected endpoint.

## 10. Logical question about error handling:

### Q: If the token refresh request also returns 401, what is the current behavior?
### A:
The response interceptor dispatches `logout()` and redirects the user to `/login`. This clears the stale session and forces re-authentication.

## 11. What is the benefit of centralizing auth errors in a Redux slice?
### Answer:
Centralizing auth state in Redux allows multiple components and routes to react consistently to login/logout events. It also makes it easy to implement UI state like loading spinners and global error handling.

## 12. Example optimization and security question:

### Q: Why does the app use `React.lazy` and `Suspense` instead of loading all routes up front?
### A:
Lazy loading improves performance by downloading only the route code needed for the current page. `Suspense` provides a fallback UI while the component code loads, which improves first-page load speed and reduces bundle size.

## 13. What role does `ProtectedRoute` play when a non-authorized user tries to access `/owner`?
### Answer:
It checks the current user role and if the role does not match `['owner']`, the user is redirected to the catch-all `404` route. This prevents the user from seeing owner-specific contents.

## 14. How is localStorage data validated at startup?
### Answer:
When the slice loads, it parses `localStorage.getItem('user')` and falls back to removing it if JSON parsing fails. This prevents corrupted storage data from crashing the app.

## 15. What would you ask about the logout flow in an interview?
### Answer:
- How are tokens removed from storage?
- Why clear localStorage even after `logout()`?
- Should we also clear any cached feature data on logout?
- What happens if the `/auth/logout` request fails?

## 16. Security improvement challenge:

### Q: Describe one change to make the frontend more secure without changing backend APIs.
### A:
Avoid storing sensitive tokens in localStorage and instead keep them in React state or a secure HttpOnly cookie when possible. Add a `tokenExpiry` check and proactively refresh before the token is rejected.
