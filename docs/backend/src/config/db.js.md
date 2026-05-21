# backend/src/config/db.js

## 1. Overview
`backend/src/config/db.js` configures the database connection for Mongoose (MongoDB ODM) and handles startup connection exceptions. It also defines a migration helper for legacy users without identity codes.

## 2. Key Responsibilities & Flow
### `connectDB`
- Asynchronous function that initiates a connection with MongoDB using `process.env.MONGODB_URI`.
- Logs successful connection using the Winston utility.
- Captures connection failures, logs the stack trace, and allows the server to keep running or handle the error gracefully without killing the Node process directly (since `process.exit(1)` is commented out).

### `migrateExistingUsers`
- Finds existing `User` documents where the `identity` field is missing or null.
- Triggers a Mongoose save (`user.save()`) on each document, causing the User model's pre-save middleware hooks to run and generate automated identification codes (e.g. employee IDs) for legacy accounts.

## 3. Code Patterns & Best Practices
- **Singleton Connection Management**: Node/Mongoose caching establishes a single cached database connection shared across all models.
- **Pre-save Migration Support**: The save operation inside user migration hooks executes pre-save middleware, avoiding direct bulk writes which would bypass pre-save triggers.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- This is a backend configuration file that does not map directly to the frontend. However, it establishes the database store that saves and retrieves data utilized by all client-facing UI panels.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports & Setup**: Imports database library Mongoose and logger utility.
2. **User Migration Routine**: Runs a background database migration to check for users missing their `identity` field and saves them to generate it automatically.
3. **Database Connection Routine**: Connects to the MongoDB database using mongoose.
4. **Module Export**: Exports the connection function.

- **Lines 1-2 (Imports & Setup)**:
  - **Basic Function**: Import external and internal dependencies.
  - **Detailed Explanation**: Imports `mongoose` (Line 1) for database management and `logger` (Line 2) for custom logging.
  - **Key Function Calls**:
    - `require(module)`: Node.js CommonJS standard function to load modules. Loaded modules: `mongoose` and `../utils/logger`. Returns the imported module exports.
- **Lines 4-24 (User Migration Routine)**:
  - **Basic Function**: Migrate legacy users to generate identity codes.
  - **Detailed Explanation**: Defines `migrateExistingUsers` (Line 4) as an asynchronous function. It requires the `User` model (Line 6), queries for all users where `identity` is missing or null (Lines 7-12), logs if records are found (Line 15), iterates through each user and calls `user.save()` to invoke pre-save hooks (Lines 16-18), and handles errors (Lines 21-23). Note: the migration is defined here but not directly executed inside this file.
  - **Key Function Calls**:
    - `require('../models/User')`: Loads the Mongoose User model, enabling database queries and updates on the users collection. Returns the Mongoose model object.
    - `User.find(filter)`: Queries the MongoDB database for User documents matching the conditions (missing or null `identity` field). Returns a Mongoose Query object that resolves to an array of matching user documents.
    - `logger.info(message)`: Logs informational progress and completion status messages to standard output via Winston. Returns the logger instance.
    - `user.save()`: Persists the User document back to the database. This triggers the pre-save hooks on the User schema, generating the missing identification code automatically. Returns a Promise resolving to the saved User document.
    - `logger.error(message, metadata)`: Logs any caught errors during the migration process along with the stack trace. Returns the logger instance.
- **Lines 26-35 (Database Connection Routine)**:
  - **Basic Function**: Establish connection to the MongoDB instance.
  - **Detailed Explanation**: Defines `connectDB` (Line 26) as an asynchronous function. It calls `mongoose.connect` using `process.env.MONGODB_URI` (Line 28), logs a success message (Line 29), and catches errors to log them (Lines 31-34) with `process.exit(1)` commented out to prevent crashing the server process.
  - **Key Function Calls**:
    - `mongoose.connect(uri)`: Establishes a connection to the MongoDB database using the connection string from environment variables. Returns a Promise resolving to the Mongoose connection instance.
    - `logger.info(message)`: Logs a connection success message to the standard output. Returns the logger instance.
    - `logger.error(message, metadata)`: Logs MongoDB connection failure details, including error message and stack trace. Returns the logger instance.
- **Lines 37-38 (Module Export)**:
  - **Basic Function**: Export the connection function.
  - **Detailed Explanation**: Exports `connectDB` (Line 37) using CommonJS export so it can be called in the server entrypoint file.
  - **Key Function Calls**: None.
