# backend/scripts/generateDummyData.js

## 1. Overview
The `generateDummyData.js` script is a utility run during initial setup or database reset. It seeds the MongoDB database with a mocked corporate structure for testing and verification of both Owner and Employee features.

## 2. Key Responsibilities & Flow
When executed, the script performs the following tasks:
1. **Configures Environment**: Loads environment variables from the parent `.env` file via `dotenv`.
2. **Connects to MongoDB**: Connects to the database using the standard URI defined in variables.
3. **Wipes Existing Collections**: Truncates all existing records across five key collections: `Company`, `User`, `Attendance`, `Leave`, and `Payroll`.
4. **Seeds Company**: Creates a mock company entity named `Acme Corporation`.
5. **Seeds Owner Account**:
   - Creates a user with role `owner` (`0101chaitanya@gmail.com` / `Password@123`).
   - Links the Company owner field to this user.
6. **Seeds Employee Accounts**:
   - Creates 5 employee users with varying positions (Software Developer, Product Manager, UX Designer, HR Manager, QA Engineer).
   - The primary test employee is `ololchaitanya@outlook.com` (`Password@123`).
7. **Seeds Leave Requests**:
   - Seeds various leave instances (sick, unpaid, annual, personal) in pending, approved, and rejected states.
8. **Seeds Payroll**:
   - Generates payroll records for the past 3 months (Feb, Mar, Apr 2026), calculating basic pay, HRA, conveyance, medical allowances, and deductions (specifically mapping unpaid leave deductions for employees).
9. **Seeds Attendance Records**:
   - Generates attendance records for the last 30 weekdays.
   - Mimics a distribution of present, absent, half-day, and leave statuses (with randomized clock-in/out times).

## 3. Code Patterns & Best Practices
- **Mongoose Document Lifecycle Hook Integration**: Feeds passwords as raw strings (e.g. `Password@123`) when calling `User.create()`, relying on the User model's pre-save middleware to hash the password.
- **Asynchronous Execution Flow**: Employs an `async`/`await` try-catch block for clean database transactions.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Defines the default login credentials used directly in the frontend [Login.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/auth/Login.jsx.md) component.
- The company setup here dictates what is visible in the frontend dashboard and settings.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Lines 1-13 (Imports and Setup)**: Import required libraries (mongoose, dotenv, path) and Mongoose models (Company, User, Attendance, Leave, Payroll) and load environment variables.
2. **Lines 14-347 (generateData Function)**: An asynchronous function that performs database connection, data clearance, and sequential creation of mock entities (Company, Owner, Employees, Leaves, Payroll, and Attendance).
3. **Lines 349 (Function Invocation)**: Immediately invokes `generateData()` to run the script.

- **Lines 1-13 (Imports and Setup)**:
  - **Basic Function**: Import external libraries and models and configure environment variables.
  - **Detailed Explanation**: Imports `mongoose` for DB operations, `dotenv` for env configuration, and `path` for filesystem path resolution. It loads the environment variables from the `.env` file located in the parent directory. It then imports the Mongoose models: `Company`, `User`, `Attendance`, `Leave`, and `Payroll` to perform queries and write dummy documents.
  - **Key Function Calls**:
    - `require('mongoose')`: Loads the Mongoose library. Used to connect to the database and map JavaScript objects to MongoDB documents. Returns the Mongoose module object.
    - `require('dotenv')`: Loads the Dotenv library. Used for loading key-value pairs from a `.env` file into `process.env`. Returns the Dotenv module object.
    - `require('path')`: Loads the Node.js path module. Used for standard path manipulations. Returns the Path module object.
    - `path.join(__dirname, '../.env')`: Combines the current directory name (`__dirname`) and the relative path `../.env` into a single, absolute file path pointing to the backend's environment variables configuration. Returns the absolute path string.
    - `dotenv.config({ path: ... })`: Configures Dotenv to load the environment variables from the specified absolute file path. Returns an object containing either the parsed env variables or an error.
    - `require('../src/models/Company')`: Loads the Mongoose Company model, enabling database queries and creations on the companies collection. Returns the Mongoose model object.
    - `require('../src/models/User')`: Loads the Mongoose User model, enabling database queries and creations on the users collection. Returns the Mongoose model object.
    - `require('../src/models/Attendance')`: Loads the Mongoose Attendance model, enabling database queries and creations on the attendances collection. Returns the Mongoose model object.
    - `require('../src/models/Leave')`: Loads the Mongoose Leave model, enabling database queries and creations on the leaves collection. Returns the Mongoose model object.
    - `require('../src/models/Payroll')`: Loads the Mongoose Payroll model, enabling database queries and creations on the payrolls collection. Returns the Mongoose model object.
- **Lines 14-24 (Database Connection)**:
  - **Basic Function**: Retrieve the database connection string and connect to MongoDB.
  - **Detailed Explanation**: Inside the `generateData` async function, it retrieves the `MONGODB_URI` environment variable. If not found, it logs an error and exits the process with code 1. Otherwise, it establishes a Mongoose connection to the MongoDB database and logs a success message.
  - **Key Function Calls**:
    - `console.error(message)`: Logs error details to the standard error stream. Returns `undefined`.
    - `process.exit(1)`: Exits the current Node.js process immediately with code `1`, indicating an abnormal termination due to missing environment variables.
    - `mongoose.connect(MONGODB_URI)`: Establishes a connection to the MongoDB database using the connection string. Returns a Promise that resolves to the Mongoose connection object.
    - `console.log(message)`: Logs success and progress logs to the standard output. Returns `undefined`.
- **Lines 25-33 (Database Cleanup)**:
  - **Basic Function**: Clear all existing documents in collections to ensure a clean slate.
  - **Detailed Explanation**: Calls `deleteMany({})` sequentially on `Company`, `User`, `Attendance`, `Leave`, and `Payroll` models to wipe existing documents before database seeding.
  - **Key Function Calls**:
    - `console.log(message)`: Logs database cleaning information to the standard output. Returns `undefined`.
    - `Company.deleteMany({})`: Clears all documents in the `Company` collection. Returns a Promise resolving to an object containing operation status (e.g., `deletedCount`).
    - `User.deleteMany({})`: Clears all documents in the `User` collection. Returns a Promise resolving to an object containing operation status.
    - `Attendance.deleteMany({})`: Clears all documents in the `Attendance` collection. Returns a Promise resolving to an object containing operation status.
    - `Leave.deleteMany({})`: Clears all documents in the `Leave` collection. Returns a Promise resolving to an object containing operation status.
    - `Payroll.deleteMany({})`: Clears all documents in the `Payroll` collection. Returns a Promise resolving to an object containing operation status.
- **Lines 34-65 (Company and Owner Creation)**:
  - **Basic Function**: Seed the database with a main Company and its owner User, and link them.
  - **Detailed Explanation**: Creates a mock Company entity named 'Acme Corporation' using `Company.create()`. Then, it creates an owner User with the role set to `'owner'` (`0101chaitanya@gmail.com`). Finally, it updates the Company model's `owner` field with this new owner's ID and saves it to link them together.
  - **Key Function Calls**:
    - `Company.create(data)`: Creates and persists a new Company document in the database. Returns a Promise resolving to the created document.
    - `console.log(message, ...args)`: Logs the company name to standard output. Returns `undefined`.
    - `User.create(data)`: Creates and persists a new User document representing the owner. Invokes pre-save hooks on the User model to hash the raw password. Returns a Promise resolving to the created User document.
    - `new Date(dateString)`: Instantiates a new JavaScript Date object representing the owner's date of birth. Returns the new Date object.
    - `company.save()`: Persists the updated Company document (now containing the owner's `_id`) to the database. Returns a Promise resolving to the saved Company document.
- **Lines 66-156 (Employee User Seeding)**:
  - **Basic Function**: Create five default employee accounts in the database.
  - **Detailed Explanation**: Defines an array `employeesData` containing detailed records for five employees, including names, emails, roles, positions, salaries, join dates, and bank details. It iterates over this array, calling `User.create(data)` for each employee to hash passwords automatically, and stores the created User documents in the `employees` array.
  - **Key Function Calls**:
    - `new Date(dateString)`: Instantiates a new Date object representing the employee's date of birth or join date. Returns the new Date object.
    - `User.create(data)`: Creates and persists a new employee User document. Invokes pre-save hooks on the User model to hash the password. Returns a Promise resolving to the created employee User document.
    - `employees.push(employee)`: Appends the newly created employee document to the `employees` array. Returns the new length of the array.
    - `console.log(message)`: Logs the name and email of the created employee to the standard output. Returns `undefined`.
- **Lines 157-204 (Leave Request Seeding)**:
  - **Basic Function**: Seed various Leave requests in different states.
  - **Detailed Explanation**: Defines a mock array of leave requests for the employees, including sick, unpaid, annual, and personal leaves with start/end dates, reasons, and status values ('approved', 'pending', 'rejected'). It loops over these records and creates them using `Leave.create(data)`.
  - **Key Function Calls**:
    - `new Date(dateString)`: Instantiates a new Date object for start or end dates of a leave request. Returns the new Date object.
    - `Leave.create(data)`: Creates and persists a new Leave document in the database. Returns a Promise resolving to the created Leave document.
    - `console.log(message)`: Logs the quantity of created leave records to the standard output. Returns `undefined`.
- **Lines 205-256 (Payroll Seeding)**:
  - **Basic Function**: Seed payroll history for all employees for the past three months.
  - **Detailed Explanation**: Iterates through the months of Feb, Mar, and Apr 2026. For each employee, it calculates the monthly salary based on their annual salary, applies unpaid leave deductions (specifically 4 days for employee John Doe in April), calculates HRA (30%), basic pay (50%), conveyance (10%), medical allowance (10%), gross pay, taxes (10%), and net pay, and calls `Payroll.create()` to store the record.
  - **Key Function Calls**:
    - `new Date(year, month, day)`: Instantiates Date objects. Setting the day to `0` returns the last day of the previous month (used to count the days in that month). Setting it to `28` returns the payroll payment date. Returns the new Date object.
    - `date.getDate()`: Returns the day of the month (1-31) of the constructed Date object.
    - `Math.round(value)`: Rounds the calculated currency amounts (salaries, deductions, taxes) to the nearest integer. Returns the rounded integer.
    - `Payroll.create(data)`: Creates and persists a new Payroll document in the database. Returns a Promise resolving to the created Payroll document.
    - `console.log(message)`: Logs the count of created Payroll records to the standard output. Returns `undefined`.
- **Lines 257-333 (Attendance Seeding)**:
  - **Basic Function**: Seed attendance records for the last 30 weekdays.
  - **Detailed Explanation**: Iterates backward from 35 days to 1 day. If a date is a weekday, it checks if the employee was on approved leave. If on leave, it sets the status to `'leave'`. Otherwise, it uses random probabilities to assign `'present'` (88% chance, random check-in/out times around 9 AM to 5 PM, total hours calculated), `'half-day'` (7% chance, 4 hours), or `'absent'` (5% chance). It then creates the document using `Attendance.create()`.
  - **Key Function Calls**:
    - `new Date(date)`: Clones or creates a new Date object representing the attendance day. Returns the new Date object.
    - `today.getDate()`: Gets the current day of the month. Returns a number (1-31).
    - `date.setDate(value)`: Sets the day of the month to a calculated value to shift the date backward. Returns the epoch time of the updated Date object.
    - `date.getDay()`: Gets the day of the week (0 for Sunday, 6 for Saturday). Returns a number (0-6).
    - `date.setHours(hours, minutes, seconds, ms)`: Sets the hours, minutes, seconds, and milliseconds for the Date object. Returns the epoch time of the updated Date object.
    - `leavesData.some(callback)`: Iterates over leavesData to check if the employee was on approved leave on the specific date. Returns `true` if at least one leave request matches the criteria, otherwise `false`.
    - `l.user.toString()`: Converts the leave's user ObjectId to a string for comparison. Returns the string ID.
    - `emp._id.toString()`: Converts the employee's Mongoose ObjectId to a string. Returns the string ID.
    - `Math.random()`: Generates a pseudo-random decimal number between 0 (inclusive) and 1 (exclusive). Returns the generated number.
    - `Math.floor(value)`: Computes the largest integer less than or equal to the random minutes. Returns the integer.
    - `parseFloat(value)`: Parses the formatted string representation of total hours back into a float. Returns the floating-point number.
    - `number.toFixed(2)`: Formats the calculated total hours to two decimal places. Returns a string.
    - `Attendance.create(data)`: Creates and persists a new Attendance document in the database. Returns a Promise resolving to the created Attendance document.
    - `console.log(message)`: Logs the count of created Attendance records to the standard output. Returns `undefined`.
- **Lines 334-347 (Completion & Error Handling)**:
  - **Basic Function**: Log completion details or handle any script execution errors.
  - **Detailed Explanation**: Logs the final test credentials for the owner and employee accounts and terminates the process with `process.exit(0)`. If any error occurs during database seeding, it catch blocks the exception, logs it, and exits with code 1.
  - **Key Function Calls**:
    - `console.log(message)`: Logs the final success messages and login credentials to standard output. Returns `undefined`.
    - `process.exit(code)`: Exits the Node.js runtime environment immediately. Takes `0` for successful termination, or `1` for failed termination.
    - `console.error(message, error)`: Logs the execution errors to the standard error stream. Returns `undefined`.
- **Lines 349-350 (Execution)**:
  - **Basic Function**: Invoke the data generation script.
  - **Detailed Explanation**: Calls the `generateData()` function to execute the entire seeding flow.
  - **Key Function Calls**:
    - `generateData()`: Starts the asynchronous data seeding execution. Returns a Promise.

