# frontend/src/app/store.js

## 1. Overview
`frontend/src/app/store.js` initializes the Redux Store using Redux Toolkit to act as the single source of truth for global frontend state.

## 2. Key Responsibilities & Flow
- Configures the Redux store by combining reducers.
- Exposes the configured store as default to be mounted by Provider in `main.jsx`.
- Registers the `auth` state slice (`authSlice.js`), enabling global access to variables like `user`, `role`, `token`, and OTP metadata.

## 3. Code Patterns & Best Practices
- **Redux Toolkit standard configuration**: Employs `configureStore` which automatically registers standard middlewares (such as redux-thunk for async operations and check-for-mutability helpers in development).

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- **State and Endpoint mapping**:
  - Store variables are updated in response to API payloads received from endpoints like `/api/auth/login`, `/api/auth/verify-otp`, and `/api/auth/regenerate-access-token`.
  - Dispatches actions (like `logout()`) which coordinate state resets with session deletion routes (`/api/auth/logout`) on the backend.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Redux Imports**: Imports Redux store creation function and authentication reducer.
2. **Store Configuration & Export**: Configures the state store with the list of slices and exports it.

- **Lines 1-2 (Redux Imports)**:
  - **Basic Function**: Imports store configuration and state slice reducers.
  - **Detailed Explanation**: Imports `configureStore` from `@reduxjs/toolkit` and imports `authReducer` from `../features/auth/authSlice.js`.
- **Lines 4-10 (Store Configuration & Export)**:
  - **Basic Function**: Initializes and registers the global Redux store object.
  - **Detailed Explanation**: Creates `store` using `configureStore` by declaring the `auth` property using the `authReducer` to manage authentication state. Finally, exports `store` as default.
