# backend/src/models/Attendance.js

## 1. Overview
The `Attendance` model defines the database schema for capturing daily check-in and check-out logs, tracking work hours, and recording attendance statuses (such as present, absent, half-day, or on leave) for employees under specific companies.

## 2. Key Responsibilities & Flow
- **Fields & Constraints**:
  - `user`: ObjectId referencing the `User` model (required).
  - `company`: ObjectId referencing the `Company` model (required).
  - `date`: The calendar date of the attendance entry (required).
  - `checkInTime`: Timestamp of the employee check-in (optional).
  - `checkOutTime`: Timestamp of the employee check-out (optional).
  - `status`: String field indicating attendance status, restricted to `['present', 'absent', 'half-day', 'leave']`. Defaults to `'absent'`.
  - `totalHours`: Calculated decimal duration representing total hours logged.
  - `remarks`: Explanatory comments (e.g. "On Approved Leave", "Unexcused Absence").
- **Configuration**:
  - Automatically records creation and update timestamps via `{ timestamps: true }`.

## 3. Code Patterns & Best Practices
- **Relational Integrity**: Enforces strict references to `User` and `Company` to isolate data.
- **Enumerated Statuses**: Restricts input validity through Mongoose enum array validations.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Queried by frontend attendance dashboards ([EmployeeAttendance.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/attendance/EmployeeAttendance.jsx.md) and [OwnerAttendance.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/attendance/OwnerAttendance.jsx.md)).
- Mutated by employee check-in/out button triggers in the UI.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports**: Imports Mongoose to structure schemas and compile models.
2. **Attendance Schema Declaration**: Configures the fields, types, rules, and validators for the Attendance document.
3. **Model Compilation & Export**: Generates the Attendance database collection helper and exports it.

- **Lines 1-2 (Imports)**:
  - **Basic Function**: Import dependencies.
  - **Detailed Explanation**: Imports `mongoose` (Line 1) to define schemas and interface with MongoDB database collections.
  - **Key Function Calls**:
    - `require("mongoose")`: Loads the `mongoose` library to provide MongoDB object modeling and schema definition. Returns the Mongoose module object.
- **Lines 3-24 (Attendance Schema Declaration)**:
  - **Basic Function**: Define attributes and types for attendance data.
  - **Detailed Explanation**: Declares `attendanceSchema` (Line 3). It sets up checkInTime (Lines 4-5) and checkOutTime (Lines 6-7) as Date objects. It specifies `company` (Lines 8-9) as an ObjectId referencing the `Company` collection, which is required. It requires the calendar `date` (Lines 10-11). It logs `remarks` as a String (Lines 12-13) and `status` as a String with an enum constraint of present, absent, half-day, or leave, defaulting to absent (Lines 14-16). It tracks `totalHours` as a Number (Lines 17-18) and maps the `user` reference to the `User` collection (Lines 19-20). The option `timestamps: true` (Line 23) is supplied to track automatic creation and modification dates.
  - **Key Function Calls**:
    - `new mongoose.Schema(definition, options)`: Constructor called to define the database schema fields and configuration constraints (such as `timestamps: true`). Returns a Schema instance.
- **Lines 25-28 (Model Compilation & Export)**:
  - **Basic Function**: Instantiate and export the database model.
  - **Detailed Explanation**: Compiles the mongoose model named `Attendance` using `attendanceSchema` (Line 25), and exports it (Line 27) for use in database queries and controllers.
  - **Key Function Calls**:
    - `mongoose.model("Attendance", attendanceSchema)`: Registers the schema as a collection model named `'Attendance'`. Returns a compilation that can query, insert, or manipulate documents in the `attendances` collection.
