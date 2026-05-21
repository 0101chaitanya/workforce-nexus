# backend/src/controllers/authController.js

## 1. Overview
`backend/src/controllers/authController.js` handles security workflows such as user registration, credential validation, OTP transmission/verification, JWT session issuing, token refreshing, and password recovery.

## 2. Key Responsibilities & Flow
Exposes the following endpoint handlers:
- **`sendOtp`**: Initiates registration verification. Creates temporary User (marked as owner) and Company entities, generates a 5-digit OTP, saves it with an expiry time, and emails the code via `nodemailer`.
- **`verifyOtp`**: Validates the OTP. On success, it flags the User and Company models as verified (`isVerified: true`).
- **`register`**: Completes user profile registration (assigns fullName and password) once OTP verification is complete.
- **`login`**: Authenticates users (matching both email and employee ID codes). Compares passwords using the User model's `comparePassword` method. Upon success, generates Access/Refresh tokens and sets the refresh token as an `httpOnly`, Lax, Secure cookie.
- **`regenerateAccessToken`**: Reads the `refreshToken` cookie, verifies it, checks if it matches the stored token in the database, and issues a new short-lived access token.
- **`logout`**: Resets the active refresh token field in the database and clears the refresh token cookie.
- **`forgotPasswordOtp`**: Generates and emails a 15-minute verification code to trigger the password reset flow.
- **`resetPassword`**: Updates the password with a newly validated password if the OTP check matches.

## 3. Code Patterns & Best Practices
- **Sanitized JSON Responses**: Employs `sanitizeUser` and `sanitizeCompany` helpers to strip sensitive elements (passwords, inner tokens) from payloads sent back to the client.
- **Database Model Hook Delegation**: Submits plain text passwords directly during registration and password reset, leaving hashing to the `pre-save` hooks in `User.js`.
- **Dual JWT Token Delivery**: Issues short-lived access tokens via JSON payloads (stored in local memory/localStorage) and refresh tokens via secure, `httpOnly` cookie channels.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- **Endpoints mapping**:
  - `POST /api/auth/send-otp` -> Frontend Register view (`Register.jsx`) sends verification triggers.
  - `POST /api/auth/verify-otp` -> Frontend OTP modal matches input challenges.
  - `POST /api/auth/login` -> Frontend `Login.jsx` checks user credentials.
  - `POST /api/auth/regenerate-access-token` -> Automatically called by frontend Axios interceptors (`axiosInterceptors.js`) upon receiving a `401` status.
  - `POST /api/auth/logout` -> Invoked by headers in `MainLayout.jsx` or state logouts.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Lines 1-8 (Imports)**: Import JWT, mail transporter, models (Company, User), token utility functions, catchAsync middleware, and logger.
2. **Lines 9-24 (Sanitizer Helpers)**: Helper functions `sanitizeUser` and `sanitizeCompany` to return only safe/non-sensitive fields.
3. **Lines 28-158 (sendOtp)**: Route handler to send verification OTP for registration. Finds or creates Company/User, generates a 5-digit OTP, sets an expiry time, saves both models in parallel, and emails the code.
4. **Lines 160-186 (verifyOtp)**: Route handler to verify OTP. Matches OTP, checks expiry, marks user/company as verified, resets OTP fields, and saves.
5. **Lines 188-284 (register)**: Route handler to finalize owner registration. Checks verification status, sets fullName and password, and emails registration success confirmation.
6. **Lines 286-325 (login)**: Route handler to authenticate user. Finds user (matching email/identity), checks password, generates access/refresh tokens, writes refresh token to DB and httpOnly cookie, and returns sanitized profile.
7. **Lines 327-345 (regenerateAccessToken)**: Route handler to refresh tokens. Validates the incoming refresh token cookie, finds the user, and issues a new access token.
8. **Lines 347-360 (logout)**: Route handler to log out. Clears refresh token in DB, clears client cookie, and returns success response.
9. **Lines 362-369 (testGet)**: Route handler to test token validity. Returns user and company.
10. **Lines 371-399 (forgotPasswordOtp)**: Route handler to send password reset OTP. Validates email, generates and saves a 15-minute OTP, and emails it.
11. **Lines 401-423 (resetPassword)**: Route handler to reset password. Matches OTP, updates user password, clears OTP fields, and saves.

- **Lines 1-8 (Imports)**:
  - **Basic Function**: Import libraries, helper functions, Mongoose models, and setup configuration.
  - **Detailed Explanation**: Imports `jsonwebtoken` for token operations, `transporter` for emails, Mongoose models (`Company` and `User`), token generator functions, `catchAsync` wrapper, `logger` utility, and loads environment variables.
  - **Key Function Calls**:
    - `require(path)`: Imports external libraries or local file dependencies (`jsonwebtoken`, `../utils/sendEmail.js`, `../models/Company`, `../models/User`, `../utils/generateTokens`, `../middleware/authMiddleware`, `../utils/logger`). Returns the exported modules.
    - `require("dotenv").config()`: Configures dot-env to load `.env` parameters into environment values. Returns an object representing parsed variables.
- **Lines 9-24 (Sanitizer Helpers)**:
  - **Basic Function**: Strip sensitive details from documents before sending to the client.
  - **Detailed Explanation**: Defines `sanitizeUser` and `sanitizeCompany` to extract and return safe profile properties, ensuring security parameters like password hashes or OTPs are not returned.
  - **Key Function Calls**:
    - None (these are arrow functions performing object formatting on user/company input parameters without calling other functions).
- **Lines 28-158 (sendOtp)**:
  - **Basic Function**: Send OTP code to verify client email address for signup.
  - **Detailed Explanation**: Locates or instantiates a new Company and User (with role set to `'owner'`). Generates a 5-digit numeric OTP, sets `otpExpiry` to 5 minutes from now, saves both documents in parallel, and emails the HTML-formatted OTP code to the requested email.
  - **Key Function Calls**:
    - `catchAsync(middleware)`: Wraps asynchronous Express handlers to automatically route runtime errors to error-handling middlewares. Returns an Express handler.
    - `Company.findOne(query)`: Queries for a company record with the target email. Returns a Mongoose Query.
    - `User.findOne(query)`: Queries for a user record matching the target email. Returns a Mongoose Query.
    - `new Company(properties)`: Instantiates a Company document for database record insertion. Returns the Company document instance.
    - `new User(properties)`: Instantiates a User document. Returns the User document instance.
    - `Math.random()`: Generates a random decimal number between 0 and 1. Returns a number.
    - `Math.floor(number)`: Truncates decimals to generate integer OTPs. Returns a number.
    - `Date.now()`: Gets the current epoch time in milliseconds. Returns a number.
    - `Promise.all(iterable)`: Resolves when both user and company save Promises have finished. Returns a Promise.
    - `user.save()`: Persists OTP attributes to the database. Returns a Promise.
    - `company.save()`: Persists company attributes to the database. Returns a Promise.
    - `transporter.sendMail(options)`: Invokes SMTP mail delivery for transmitting the OTP. Returns a Promise resolving to transmission metrics.
    - `res.status(statusCode)`: Sets the HTTP status. Returns the Express response object.
    - `res.json(body)`: Renders JSON details to the request caller. Returns the Express response object.
- **Lines 160-186 (verifyOtp)**:
  - **Basic Function**: Validate the OTP code submitted by the user.
  - **Detailed Explanation**: Performs a case-insensitive user search using email/identity. Checks if the OTP matches and is not expired. If valid, marks the User and Company `isVerified` field to `true`, clears OTP fields, and saves documents.
  - **Key Function Calls**:
    - `catchAsync(middleware)`: Wraps the controller method. Returns an Express handler.
    - `email.toLowerCase()`: Converts email characters to lowercase. Returns a string.
    - `email.toUpperCase()`: Converts employee ID characters to uppercase. Returns a string.
    - `User.findOne(query)`: Searches for a user using either the lowercased email or uppercased employee ID. Returns a Mongoose Query.
    - `res.status(statusCode)`: Sets HTTP status code. Returns the Express response object.
    - `res.json(body)`: Returns JSON payload. Returns the Express response object.
    - `new Date().toISOString()`: Generates a current date ISO 8601 string. Returns a string.
    - `Date.now()`: Evaluates the current timestamp against user.otpExpiry. Returns a number.
    - `Company.findById(id)`: Queries the associated company by ID. Returns a Mongoose Query.
    - `Promise.all(iterable)`: Concurrently runs saves on User and Company documents. Returns a Promise.
    - `user.save()`: Persists verified flags. Returns a Promise.
    - `company.save()`: Persists company verified status. Returns a Promise.
- **Lines 188-284 (register)**:
  - **Basic Function**: Finalize organization owner account creation.
  - **Detailed Explanation**: Assures user email is verified and they haven't registered already. Assigns name and password. Links the Company owner field to this user's ID. Saves both documents, sends a registration success confirmation email, and returns a `201 Created` status code.
  - **Key Function Calls**:
    - `catchAsync(middleware)`: Wraps the handler function. Returns an Express handler.
    - `email.toLowerCase()`: Normalizes email to lowercase. Returns a string.
    - `email.toUpperCase()`: Normalizes identity to uppercase. Returns a string.
    - `User.findOne(query)`: Finds the user document. Returns a Mongoose Query.
    - `res.status(statusCode)`: Sets response status. Returns the Express response object.
    - `res.json(body)`: Sends response payload. Returns the Express response object.
    - `new Date().toISOString()`: Generates current date timestamp. Returns a string.
    - `Company.findById(id)`: Queries the company document. Returns a Mongoose Query.
    - `Promise.all(iterable)`: Performs parallel saves on user and company. Returns a Promise.
    - `user.save()`: Persists owner password and profile details (triggers pre-save password-hashing hook). Returns a Promise.
    - `company.save()`: Persists owner ID relation on Company document. Returns a Promise.
    - `transporter.sendMail(options)`: Sends email confirmation of successful registration. Returns a Promise.
- **Lines 286-325 (login)**:
  - **Basic Function**: Authenticate users and establish active sessions.
  - **Detailed Explanation**: Looks up the user using either email or identity (employee ID) and populates company fields. Validates the password using the model's `comparePassword()` method. Generates short-lived access tokens and longer-lived refresh tokens. Writes the refresh token to the database and sets it as an `httpOnly`, Lax, Secure cookie on the response, returning the access token and sanitized user details.
  - **Key Function Calls**:
    - `catchAsync(middleware)`: Wraps the handler function. Returns an Express handler.
    - `email.toLowerCase()`: Normalizes email to lowercase. Returns a string.
    - `email.toUpperCase()`: Normalizes identity to uppercase. Returns a string.
    - `User.findOne(query)`: Finds user matching email/identity filter. Returns a Mongoose Query.
    - `query.populate(options)`: Hydrates company reference and company owner reference fields. Returns a Mongoose Query.
    - `user.comparePassword(password)`: Mongoose User document method evaluating input password against bcrypt hash. Returns a Promise resolving to a boolean.
    - `res.status(statusCode)`: Sets response HTTP status. Returns the Express response object.
    - `res.json(body)`: Returns JSON payload to the caller. Returns the Express response object.
    - `new Date().toISOString()`: Generates current date timestamp. Returns a string.
    - `generateRefreshToken(user, company)`: Signs a new refresh JWT token. Returns a string.
    - `generateAccessToken(user, company)`: Signs a new access JWT token. Returns a string.
    - `user.save()`: Persists the assigned refresh token. Returns a Promise.
    - `res.cookie(name, value, options)`: Sets the HTTP-only cookie header on the HTTP response. Returns the Express response object.
    - `sanitizeUser(user)`: Sanitizes returned user object attributes. Returns a formatted user object.
    - `sanitizeCompany(company)`: Sanitizes returned company object attributes. Returns a formatted company object.
- **Lines 327-345 (regenerateAccessToken)**:
  - **Basic Function**: Issue a new access token using a valid refresh token.
  - **Detailed Explanation**: Verifies the refresh token retrieved from cookies using `jwt.verify()`. Checks if the user exists and the token matches the DB record. Generates and returns a new access token.
  - **Key Function Calls**:
    - `catchAsync(middleware)`: Wraps the handler function. Returns an Express handler.
    - `res.status(statusCode)`: Sets response status. Returns the Express response object.
    - `res.json(body)`: Returns JSON response. Returns the Express response object.
    - `new Date().toISOString()`: Generates current date timestamp. Returns a string.
    - `jwt.verify(token, secret)`: Assesses refresh token signature and expiry. Returns decoded token object payload.
    - `User.findById(id)`: Queries user matching decoded token details. Returns a Mongoose Query.
    - `query.populate(options)`: Populates user company associations. Returns a Mongoose Query.
    - `generateAccessToken(user, company)`: Signs a new access JWT token. Returns a string.
- **Lines 347-360 (logout)**:
  - **Basic Function**: Terminate user session.
  - **Detailed Explanation**: Reads the refresh token cookie. If valid, updates the user document in the database, setting `refreshToken` to `null`. Clears the client cookie and sends a `200 OK` code.
  - **Key Function Calls**:
    - `catchAsync(middleware)`: Wraps the handler function. Returns an Express handler.
    - `jwt.verify(token, secret)`: Validates the refresh token to extract the user ID. Returns the decoded token payload.
    - `User.findByIdAndUpdate(id, update)`: Clears the user's refresh token inside MongoDB. Returns a Mongoose Query.
    - `logger.warn(message)`: Logs token warnings if token validation fails. Returns undefined.
    - `res.clearCookie(name)`: Wipes the HTTP refresh token cookie from the client. Returns the Express response object.
    - `res.status(statusCode)`: Sets response status. Returns the Express response object.
    - `res.json(body)`: Sends response payload. Returns the Express response object.
- **Lines 362-369 (testGet)**:
  - **Basic Function**: Test authentication middleware.
  - **Detailed Explanation**: Utility route that returns req.user and req.company details parsed by the auth middleware to verify authorization is working.
  - **Key Function Calls**:
    - `catchAsync(middleware)`: Wraps the handler function. Returns an Express handler.
    - `res.status(statusCode)`: Sets response status. Returns the Express response object.
    - `res.json(body)`: Sends JSON response. Returns the Express response object.
- **Lines 371-399 (forgotPasswordOtp)**:
  - **Basic Function**: Send password reset OTP.
  - **Detailed Explanation**: Searches for user by email/identity. If user exists, generates a 5-digit OTP with a 15-minute expiry, saves it to the user document, and emails the code to them.
  - **Key Function Calls**:
    - `catchAsync(middleware)`: Wraps the handler function. Returns an Express handler.
    - `email.toLowerCase()`: Normalizes email to lowercase. Returns a string.
    - `email.toUpperCase()`: Normalizes identity to uppercase. Returns a string.
    - `User.findOne(query)`: Queries for the user document. Returns a Mongoose Query.
    - `res.status(statusCode)`: Sets response status. Returns the Express response object.
    - `res.json(body)`: Sends JSON response. Returns the Express response object.
    - `new Date().toISOString()`: Generates current date timestamp. Returns a string.
    - `Math.random()`: Generates random decimal number. Returns a number.
    - `Math.floor(number)`: Rounds decimal values downward to build 5-digit OTP. Returns a number.
    - `Date.now()`: Obtains epoch timestamp. Returns a number.
    - `user.save()`: Persists the reset OTP values. Returns a Promise.
    - `transporter.sendMail(options)`: Sends email containing password-reset OTP. Returns a Promise.
- **Lines 401-423 (resetPassword)**:
  - **Basic Function**: Reset user password.
  - **Detailed Explanation**: Searches for user by email/identity. Validates the reset OTP and its expiry. Updates the password with the new value (pre-save hook hashes it), clears the OTP fields, saves, and returns success.
  - **Key Function Calls**:
    - `catchAsync(middleware)`: Wraps the handler function. Returns an Express handler.
    - `email.toLowerCase()`: Normalizes email to lowercase. Returns a string.
    - `email.toUpperCase()`: Normalizes identity to uppercase. Returns a string.
    - `User.findOne(query)`: Queries database for matching user. Returns a Mongoose Query.
    - `res.status(statusCode)`: Sets response status. Returns the Express response object.
    - `res.json(body)`: Sends JSON response. Returns the Express response object.
    - `new Date().toISOString()`: Generates current date timestamp. Returns a string.
    - `Date.now()`: Evaluates the current timestamp. Returns a number.
    - `user.save()`: Saves updated user password (hashes password in pre-save hook) and clears OTP fields. Returns a Promise.

