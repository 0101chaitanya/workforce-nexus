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
- **Lines 14-24 (Database Connection)**:
  - **Basic Function**: Retrieve the database connection string and connect to MongoDB.
  - **Detailed Explanation**: Inside the `generateData` async function, it retrieves the `MONGODB_URI` environment variable. If not found, it logs an error and exits the process with code 1. Otherwise, it establishes a Mongoose connection to the MongoDB database and logs a success message.
- **Lines 25-33 (Database Cleanup)**:
  - **Basic Function**: Clear all existing documents in collections to ensure a clean slate.
  - **Detailed Explanation**: Calls `deleteMany({})` sequentially on `Company`, `User`, `Attendance`, `Leave`, and `Payroll` models to wipe existing documents before database seeding.
- **Lines 34-65 (Company and Owner Creation)**:
  - **Basic Function**: Seed the database with a main Company and its owner User, and link them.
  - **Detailed Explanation**: Creates a mock Company entity named 'Acme Corporation' using `Company.create()`. Then, it creates an owner User with the role set to `'owner'` (`0101chaitanya@gmail.com`). Finally, it updates the Company model's `owner` field with this new owner's ID and saves it to link them together.
- **Lines 66-156 (Employee User Seeding)**:
  - **Basic Function**: Create five default employee accounts in the database.
  - **Detailed Explanation**: Defines an array `employeesData` containing detailed records for five employees, including names, emails, roles, positions, salaries, join dates, and bank details. It iterates over this array, calling `User.create(data)` for each employee to hash passwords automatically, and stores the created User documents in the `employees` array.
- **Lines 157-204 (Leave Request Seeding)**:
  - **Basic Function**: Seed various Leave requests in different states.
  - **Detailed Explanation**: Defines a mock array of leave requests for the employees, including sick, unpaid, annual, and personal leaves with start/end dates, reasons, and status values ('approved', 'pending', 'rejected'). It loops over these records and creates them using `Leave.create(data)`.
- **Lines 205-256 (Payroll Seeding)**:
  - **Basic Function**: Seed payroll history for all employees for the past three months.
  - **Detailed Explanation**: Iterates through the months of Feb, Mar, and Apr 2026. For each employee, it calculates the monthly salary based on their annual salary, applies unpaid leave deductions (specifically 4 days for employee John Doe in April), calculates HRA (30%), basic pay (50%), conveyance (10%), medical allowance (10%), gross pay, taxes (10%), and net pay, and calls `Payroll.create()` to store the record.
- **Lines 257-333 (Attendance Seeding)**:
  - **Basic Function**: Seed attendance records for the last 30 weekdays.
  - **Detailed Explanation**: Iterates backward from 35 days to 1 day. If a date is a weekday, it checks if the employee was on approved leave. If on leave, it sets the status to `'leave'`. Otherwise, it uses random probabilities to assign `'present'` (88% chance, random check-in/out times around 9 AM to 5 PM, total hours calculated), `'half-day'` (7% chance, 4 hours), or `'absent'` (5% chance). It then creates the document using `Attendance.create()`.
- **Lines 334-347 (Completion & Error Handling)**:
  - **Basic Function**: Log completion details or handle any script execution errors.
  - **Detailed Explanation**: Logs the final test credentials for the owner and employee accounts and terminates the process with `process.exit(0)`. If any error occurs during database seeding, it catch blocks the exception, logs it, and exits with code 1.
- **Lines 349-350 (Execution)**:
  - **Basic Function**: Invoke the data generation script.
  - **Detailed Explanation**: Calls the `generateData()` function to execute the entire seeding flow.

