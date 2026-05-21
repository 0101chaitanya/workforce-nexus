# backend/src/utils/generateTokens.js

## 1. Overview
`backend/src/utils/generateTokens.js` encapsulates the JWT signature creation logic. It exposes functions to sign access tokens and refresh tokens.

## 2. Key Responsibilities & Flow
- **`generateAccessToken(user, company)`**:
  - Compiles the token payload containing user identity details (`_id`, `email`, `role`, `fullName`) and company context (`_id`, `companyName`).
  - Signs the payload using `process.env.JWT_TOKEN`.
  - Sets token lifetime to `15m` (15 minutes).
- **`generateRefreshToken(user, company)`**:
  - Compiles a minimal token payload (omitting the user's full name to conserve payload size).
  - Signs the payload using `process.env.JWT_REFRESH_TOKEN`.
  - Sets token lifetime to `7d` (7 days).

## 3. Code Patterns & Best Practices
- **Token Differentiation**: Separates access and refresh operations onto separate signature secrets to enforce access delegation security.
- **Short-Lived Access Tokens**: Short token lifetimes (15 minutes) reduce the window of vulnerability if a client access token is compromised.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Signed access tokens are returned in the response payload to the frontend. The frontend saves these in `localStorage` to authorize subsequent actions.
- Signed refresh tokens are set on HTTP-only cookies, which the frontend [axiosInterceptors.js](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/app/axiosInterceptors.js.md) requests automatically upon token expiry.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports**: Imports the jsonwebtoken package.
2. **Access Token Generation (generateAccessToken)**: Creates a signed JSON Web Token containing basic user and company info, set to expire in 15 minutes.
3. **Refresh Token Generation (generateRefreshToken)**: Creates a signed JSON Web Token containing user ID and company details, set to expire in 7 days.
4. **Module Exports**: Exports both token generator functions.

- **Lines 1-2 (Imports)**:
  - **Basic Function**: Import JSON Web Token module.
  - **Detailed Explanation**: Imports `jsonwebtoken` (Line 1) to enable token signing and verification.
  - **Key Function Calls**:
    - `require("jsonwebtoken")`: Loads the `jsonwebtoken` module. It is called to load JWT signature generation tools. It takes the module name string `"jsonwebtoken"` as an argument and returns the `jwt` library object.
- **Lines 3-17 (Access Token Generation - generateAccessToken)**:
  - **Basic Function**: Construct and sign a short-lived access JWT.
  - **Detailed Explanation**: Defines `generateAccessToken` (Line 3). It compiles `payload` (Lines 4-15) containing user ID, email, role, and fullName alongside company ID and name. It signs this payload (Line 16) with the secret `process.env.JWT_TOKEN` and specifies a `15m` expiration lifetime.
  - **Key Function Calls**:
    - `jwt.sign(payload, secretOrPrivateKey, [options, callback])`: Signs a token payload. It is called to generate a cryptographically signed access JSON Web Token. It takes a payload object, a secret key string (`process.env.JWT_TOKEN`), and an options configuration object `{ expiresIn: "15m" }` as arguments, and returns the signed token string.
- **Lines 20-33 (Refresh Token Generation - generateRefreshToken)**:
  - **Basic Function**: Construct and sign a long-lived refresh JWT.
  - **Detailed Explanation**: Defines `generateRefreshToken` (Line 20). It compiles a lighter `payload` (Lines 21-31) containing user ID, email, and role, alongside company ID and name. It signs this payload (Line 32) using the secret `process.env.JWT_REFRESH_TOKEN` and sets an expiration lifetime of `7d`.
  - **Key Function Calls**:
    - `jwt.sign(payload, secretOrPrivateKey, [options, callback])`: Signs a token payload. It is called to generate a cryptographically signed refresh JSON Web Token. It takes a payload object, a secret key string (`process.env.JWT_REFRESH_TOKEN`), and an options configuration object `{ expiresIn: "7d" }` as arguments, and returns the signed token string.
- **Line 35 (Module Exports)**:
  - **Basic Function**: Export token utilities.
  - **Detailed Explanation**: Exports `generateAccessToken` and `generateRefreshToken` (Line 35) as CommonJS modules.
  - **Key Function Calls**: None

