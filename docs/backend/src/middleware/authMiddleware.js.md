# backend/src/middleware/authMiddleware.js

## 1. Overview
`backend/src/middleware/authMiddleware.js` provides request-level access control. It handles asynchronous error capturing, verifies JSON Web Tokens (JWT) for protected routes, and checks user role permissions.

## 2. Key Responsibilities & Flow
- **`catchAsync(fn)`**: Higher-order wrapper function that catches rejected promises in Express middleware or handlers, piping them directly to standard error logs and returning formatted error responses (e.g. `401 Unauthorized` for expired/invalid tokens, or `500 Internal Server Error`).
- **`protect`**: Intercepts inbound calls to secure endpoints:
  1. Extracts the Bearer token from the `Authorization` header (`req.headers.authorization`).
  2. Verifies the token using `process.env.JWT_TOKEN`.
  3. Attaches decoded `user` and `company` payload contexts to the Express request object (`req.user` and `req.company`).
  4. Calls `next()` if valid, or blocks with `401 Unauthorized` if invalid or missing.
- **`isAuthorized(...roles)`**: Restricts controller execution based on user role authorization:
  1. Validates that the active role stored in `req.user.role` matches the route's specified role access permissions.
  2. If no target roles are passed, it defaults access strictly to `owner`.
  3. If allowed, calls `next()`; otherwise blocks with a `403 Forbidden` response.

## 3. Code Patterns & Best Practices
- **Higher-Order Functions**: Leverages a currying pattern (`catchAsync` and `isAuthorized`) to keep controller implementations clean from repetitive try-catch blocks and role-checking conditions.
- **JWT Context Injection**: Attaches decoded payloads (`user`, `company`) to `req` to enable downstream controllers to locate database records within the owner's company context automatically.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Ingests headers injected by the frontend's [axiosInterceptors.js](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/app/axiosInterceptors.js.md) request interceptor.
- If this middleware rejects a request with a `401` status, the frontend [axiosInterceptors.js](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/app/axiosInterceptors.js.md) captures it and attempts to call `/api/auth/regenerate-access-token`.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports**: Imports the standard token verification package (jsonwebtoken) and the internal logger.
2. **Async Error Handler (catchAsync)**: Catches rejected promises in middleware and route handlers to avoid unhandled rejections and send clean JSON error responses.
3. **Authentication Guard (protect)**: Extracts and validates the JWT token from the authorization headers and injects user and company information into the request context.
4. **Authorization Guard (isAuthorized)**: Restricts access to routes depending on user roles (like owner, manager, employee).

- **Lines 1-2 (Imports)**:
  - **Basic Function**: Import dependencies.
  - **Detailed Explanation**: Imports `jsonwebtoken` (Line 1) for parsing and validating JSON Web Tokens, and the custom logger utility (Line 2).
  - **Key Function Calls**:
    - `require(module)`: Node.js CommonJS standard function to load modules. Loaded modules: `jsonwebtoken` and `../utils/logger`. Returns the imported module exports.
- **Lines 4-16 (Async Error Handler - catchAsync)**:
  - **Basic Function**: Wrap route handler functions in a try-catch construct.
  - **Detailed Explanation**: Defines `catchAsync` (Line 4) which takes a function `fn` and returns an Express middleware wrapper. If an error is caught during the execution of `fn`, it logs the error (Line 8), checks if it is a JWT library error to respond with 401 (Lines 10-12), and defaults to sending a 500 status (Line 14).
  - **Key Function Calls**:
    - `fn(req, res, next)`: Dynamically executes the asynchronous handler or controller function passed into `catchAsync`. Returns a Promise.
    - `logger.error(message, metadata)`: Logs error details and stack trace to standard error/files. Returns the logger instance.
    - `res.status(code)`: Sets the HTTP response status code to 401 or 500. Returns the Express response object for method chaining.
    - `res.json(body)`: Sends the final JSON response payload to the client. Returns the Express response object.
    - `new Date()`: Instantiates a new Date object representing the current system date and time. Returns the Date object.
    - `date.toISOString()`: Formats the Date object into an ISO-8601 string representation. Returns the string.
- **Lines 18-29 (Authentication Guard - protect)**:
  - **Basic Function**: Protect routes by requiring a valid JWT access token.
  - **Detailed Explanation**: Declares `protect` using `catchAsync` (Line 18). It retrieves the authorization token by splitting the Bearer header (Line 19). If there is no token, it returns 401 (Line 21-23). It verifies the token using the secret JWT_TOKEN (Line 25), assigns the decoded user and company payloads to `req.user` and `req.company` (Lines 26-27), and calls `next()` to proceed (Line 28).
  - **Key Function Calls**:
    - `catchAsync(middleware)`: Higher-order helper invocation to wrap the asynchronous authentication middleware for safety. Returns the wrapped middleware function.
    - `authorizationHeader.split(' ')`: Splits the Authorization header string at the space delimiter to separate the "Bearer" scheme from the token. Returns an array of split strings.
    - `res.status(code)`: Sets the HTTP response status code to 401. Returns the Express response object.
    - `res.json(body)`: Sends a JSON response explaining that no token was provided. Returns the Express response object.
    - `new Date()`: Instantiates a new Date object. Returns the Date object.
    - `date.toISOString()`: Formats the Date object as an ISO string. Returns the string.
    - `jwt.verify(token, secret)`: Validates the signature and expiration of the JWT token using the secret. Throws an error if validation fails. Returns the decoded token payload object.
    - `next()`: Calls the next middleware or handler in the Express router chain. Returns `undefined`.
- **Lines 31-43 (Authorization Guard - isAuthorized)**:
  - **Basic Function**: Check if the authenticated user has one of the allowed roles.
  - **Detailed Explanation**: Declares a curried function `isAuthorized` (Line 31) that takes allowed roles. It defaults to `['owner']` if no roles are supplied (Line 32). It checks if `req.user.role` is included in the allowed roles (Line 34). If so, it calls `next()` (Line 35), otherwise it returns a 403 response stating insufficient permissions (Lines 37-41).
  - **Key Function Calls**:
    - `allowedRoles.includes(role)`: Checks if the user's role is present in the allowed roles array. Returns a boolean.
    - `next()`: Calls the next middleware or controller function. Returns `undefined`.
    - `res.status(code)`: Sets the HTTP response status code to 403. Returns the Express response object.
    - `res.json(body)`: Sends a JSON response with details of the permission violation. Returns the Express response object.
    - `new Date()`: Instantiates a new Date object. Returns the Date object.
    - `date.toISOString()`: Formats the Date object as an ISO string. Returns the string.
- **Line 45 (Module Export)**:
  - **Basic Function**: Export functions.
  - **Detailed Explanation**: Exports `catchAsync`, `protect`, and `isAuthorized` (Line 45) for use in application routes.
  - **Key Function Calls**: None.
