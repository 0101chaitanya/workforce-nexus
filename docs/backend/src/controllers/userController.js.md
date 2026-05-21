# backend/src/controllers/userController.js

## 1. Overview
`backend/src/controllers/userController.js` manages employee data records. It handles employee onboarding, searching/filtering, self-service profile updates, credential resets, and administrative overrides.

## 2. Key Responsibilities & Flow
Exposes the following endpoint handlers:
- **`addUser`**:
  1. Checks if the candidate email is already registered in the system.
  2. Generates a strong password using `generateSecurePassword` and stores the new user with an `'employee'` role.
  3. Emails the temporary password and login credentials to the user.
  4. Returns the new user record along with the temporary password.
- **`changePassword`**:
  1. Finds the authenticated user.
  2. Compares the old password against the database hash.
  3. Sets the new password (delegated to the pre-save hash hook in `User.js`).
- **`searchUsers`**:
  - Searches users within the active company context.
  - Supports search queries against `fullName`, `email`, and `identity` fields using case-insensitive regex patterns.
  - Supports query parameter pagination.
- **`getAllCompanyUsers`**:
  - Lists all non-owner employees belonging to the company.
- **`updateProfile`**:
  - Allows employees to update their own non-administrative details (`fullName`, `phone`, `address`, `dateOfBirth`, `bankAccount`).
- **`updateUserByAdmin`**:
  - Restricts access to owners.
  - Allows owners to edit all employee properties, including administrative fields (`role`, `salary`, `branch`, `position`).
- **`getUserById`**:
  - Resolves profile details. Restricts access: employees can only fetch their own profile, whereas owners can fetch any profile within their company.

## 3. Code Patterns & Best Practices
- **Information Masking**: Employs Mongoose projections (`.select("-password ...")`) to exclude secure data fields from API responses.
- **Row-Level Security**: Validates requester ownership (`req.user._id.toString() !== id`) inside the controllers to restrict resource access.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- **Onboarding Form**: `addUser` receives data from the employee management panel ([OwnerEmployees.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/employees/OwnerEmployees.jsx.md)).
- **Profile View**: `updateProfile` receives updates from the user profile view ([EmployeeProfile.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/profile/EmployeeProfile.jsx.md)).
- **Search Tables**: `searchUsers` feeds the employee tables in the client dashboard.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Lines 1-5 (Imports)**: Import Mongoose User model, bcrypt, password generator, mail transporter, and custom logger.
2. **Lines 7-78 (addUser)**: Create employee user by admin, generate a secure random password, send welcome email, and return user details.
3. **Lines 80-118 (changePassword)**: Authenticated user password update. Compares old password, writes new password if matched, and saves.
4. **Lines 120-186 (searchUsers)**: Search company employees with optional query matching (name, email, identity) and pagination.
5. **Lines 188-210 (getAllCompanyUsers)**: Retrieve all company users (non-owners) without pagination.
6. **Lines 212-251 (updateProfile)**: Allow self-update of profile details for authenticated user (restricted fields: fullName, phone, address, DOB, bankAccount).
7. **Lines 253-306 (updateUserByAdmin)**: Allow admin/owner to update any employee details including salary, branch, position, role.
8. **Lines 308-347 (getUserById)**: Retrieve profile details for a specific user ID, with access control rules.

- **Lines 1-5 (Imports)**:
  - **Basic Function**: Import dependencies.
  - **Detailed Explanation**: Imports `User` model, `bcrypt` for password comparisons, `generateSecurePassword` helper, the mail transporter module for emails, and the Winston `logger` wrapper.
  - **Key Function Calls**:
    - `require(path)`: Imports external modules and files (`../models/User`, `bcrypt`, `../utils/passwordGenerator`, `../utils/sendEmail`, `../utils/logger`). Returns the exported module contents.
- **Lines 7-78 (addUser)**:
  - **Basic Function**: Handle administrator-driven employee onboarding.
  - **Detailed Explanation**: Extracts registration details, generates a password, and checks if the email is already in use. Instantiates a new User with `'employee'` role and `'isVerified': true`. Saves the user (triggering the password hashing hook), sends a welcome email containing credentials, sets password to `undefined` on the return object, and returns a `210 Created` response with the generated password.
  - **Key Function Calls**:
    - `generateSecurePassword()`: Generates a cryptographically strong, random temporary password. Returns a string.
    - `User.findOne({ email })`: Checks if a user profile matches the candidate email. Returns a Mongoose Query.
    - `res.status(statusCode)`: Sets the HTTP status code. Returns the Express response object.
    - `res.json(body)`: Transmits JSON payloads. Returns the Express response object.
    - `new Date().toISOString()`: Generates an ISO timestamp string. Returns a string.
    - `new User(properties)`: Instantiates a new User model. Returns the document instance.
    - `newUser.save()`: Persists the user schema instance in MongoDB, which triggers pre-save password-hashing middleware. Returns a Promise.
    - `transporter.sendMail(options)`: Sends an email welcome letter with onboarding credentials. Returns a Promise.
    - `logger.error(message, meta)`: Records errors occurring during onboarding. Returns undefined.
- **Lines 80-118 (changePassword)**:
  - **Basic Function**: Allow users to change their own password.
  - **Detailed Explanation**: Reads old and new passwords from the request body. Compares the old password against the hashed password in the DB using `bcrypt.compare()`. If matches, updates user password to the raw new password (Mongoose pre-save hook handles hashing) and calls `.save()`.
  - **Key Function Calls**:
    - `User.findById(userId)`: Resolves the user object by internal document key. Returns a Mongoose Query.
    - `res.status(statusCode)`: Sets the HTTP response status. Returns the Express response object.
    - `res.json(body)`: Transmits a JSON payload. Returns the Express response object.
    - `new Date().toISOString()`: Generates an ISO timestamp string. Returns a string.
    - `bcrypt.compare(data, encrypted)`: Evaluates plaintext password against password hash. Returns a Promise resolving to a boolean.
    - `user.save()`: Saves updated password on the user instance (triggers hashing hooks). Returns a Promise.
    - `logger.error(message, meta)`: Logs exceptions. Returns undefined.
- **Lines 120-186 (searchUsers)**:
  - **Basic Function**: Search company employees with optional regex queries and pagination.
  - **Detailed Explanation**: Gathers query, page, and limit parameters. Configures `searchQuery` to filter by company and target regexes on `fullName`, `email`, and `identity`. Excludes owners from results. If paginated, calculates offset and returns a paginated subset. Otherwise, retrieves all matching records. Projections are set to exclude security-sensitive keys.
  - **Key Function Calls**:
    - `query.trim()`: Strips leading/trailing spaces from query inputs. Returns a string.
    - `parseInt(string)`: Casts page/limit parameters to integers. Returns an integer or `NaN`.
    - `User.countDocuments(searchQuery)`: Counts matching search results. Returns a Promise resolving to a number.
    - `User.find(searchQuery)`: Finds users meeting filter criteria. Returns a Mongoose Query.
    - `query.select(fields)`: Excludes credentials/tokens from database selection. Returns a Mongoose Query.
    - `query.sort(sortOption)`: Sorts user list alphabetically by name. Returns a Mongoose Query.
    - `query.skip(skip)`: Sets pagination offset. Returns a Mongoose Query.
    - `query.limit(limitNum)`: Restricts pagination page size. Returns a Mongoose Query.
    - `Math.ceil(number)`: Calculates the total pagination pages. Returns a number.
    - `res.status(statusCode)`: Sets the response HTTP status. Returns the Express response object.
    - `res.json(body)`: Transmits a JSON payload. Returns the Express response object.
    - `logger.error(message, meta)`: Logs search execution failures. Returns undefined.
    - `new Date().toISOString()`: Generates error timestamp. Returns a string.
- **Lines 188-210 (getAllCompanyUsers)**:
  - **Basic Function**: Retrieve all employees in the owner's company.
  - **Detailed Explanation**: Queries the User model for all users matching `companyId` where the role is not `'owner'`, sorted alphabetically, excluding sensitive fields.
  - **Key Function Calls**:
    - `User.find(query)`: Queries users matching companyId who are not owners. Returns a Mongoose Query.
    - `query.select(fields)`: Excludes sensitive password and session attributes. Returns a Mongoose Query.
    - `query.sort(sortOption)`: Sorts alphabetically by name. Returns a Mongoose Query.
    - `res.status(statusCode)`: Sets the response HTTP status. Returns the Express response object.
    - `res.json(body)`: Sends the JSON payload. Returns the Express response object.
    - `logger.error(message, meta)`: Logs database retrieval errors. Returns undefined.
    - `new Date().toISOString()`: Generates timestamp. Returns a string.
- **Lines 212-251 (updateProfile)**:
  - **Basic Function**: Self-service profile updates for users.
  - **Detailed Explanation**: Restricts updates to safe, non-admin fields (name, phone, address, DOB, bank account). Finds user by authenticated ID, updates fields, saves, and returns the updated user profile.
  - **Key Function Calls**:
    - `User.findById(userId)`: Resolves the authenticated user. Returns a Mongoose Query.
    - `res.status(statusCode)`: Sets response status. Returns the Express response object.
    - `res.json(body)`: Sends the JSON response. Returns the Express response object.
    - `new Date().toISOString()`: Generates timestamp. Returns a string.
    - `user.save()`: Persists the self-edited user modifications. Returns a Promise.
    - `User.findById(userId).select(fields)`: Re-fetches the user without password data to return to the client. Returns a Mongoose Query.
    - `logger.error(message, meta)`: Logs update errors. Returns undefined.
- **Lines 253-306 (updateUserByAdmin)**:
  - **Basic Function**: Owner/Admin profile modifications.
  - **Detailed Explanation**: Asserts the user is an `'owner'`. Finds target employee by ID and company ID. Applies all updates, including administrative fields (salary, branch, position, role). Saves changes and returns updated user details.
  - **Key Function Calls**:
    - `res.status(statusCode)`: Sets response status. Returns the Express response object.
    - `res.json(body)`: Sends the JSON response. Returns the Express response object.
    - `new Date().toISOString()`: Generates timestamp. Returns a string.
    - `User.findOne(query)`: Finds the specific company employee record. Returns a Mongoose Query.
    - `user.save()`: Persists administrator alterations. Returns a Promise.
    - `User.findOne(query).select(fields)`: Re-fetches the updated record minus credentials. Returns a Mongoose Query.
    - `logger.error(message, meta)`: Logs administrator profile-modification faults. Returns undefined.
- **Lines 308-347 (getUserById)**:
  - **Basic Function**: Get details of a user by ID.
  - **Detailed Explanation**: Finds user by ID and company. Authorizes access: only the owner or the user themselves can view the profile. Returns user details without password/OTP columns.
  - **Key Function Calls**:
    - `req.user._id.toString()`: Converts the current caller's ObjectId to a string. Returns a string.
    - `res.status(statusCode)`: Sets response status. Returns the Express response object.
    - `res.json(body)`: Sends JSON response. Returns the Express response object.
    - `new Date().toISOString()`: Generates timestamp. Returns a string.
    - `User.findOne(query)`: Finds user inside the company directory. Returns a Mongoose Query.
    - `query.select(fields)`: Removes credentials/tokens from projection. Returns a Mongoose Query.
    - `logger.error(message, meta)`: Logs retrieval error details. Returns undefined.

