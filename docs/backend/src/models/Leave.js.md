# backend/src/models/Leave.js

## 1. Overview
The `Leave` model stores employee time-off requests, documenting leave types, durations, statements of reason, statuses, and owner approvals.

## 2. Key Responsibilities & Flow
- **Fields & Constraints**:
  - `user`: ObjectId referencing the requesting `User` (required).
  - `company`: ObjectId referencing the active `Company` (required).
  - `type`: String type specifying the leave category, restricted to `["sick", "personal", "annual", "unpaid"]` (required).
  - `startDate` & `endDate`: Dates defining the leave window.
  - `reason`: Explanatory details from the employee (required).
  - `status`: Lifecycle indicator of the request, restricted to `["pending", "approved", "rejected"]`. Defaults to `"pending"`.
  - `remarks`: Comments appended by the owner upon approval or rejection.

## 3. Code Patterns & Best Practices
- **Strict Enums**: Prevents invalid leave types or state changes.
- **Relational Ownership**: References both the requesting employee and their target company.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- **Employee Panel**: Employees view and submit requests using [EmployeeLeaves.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/leaves/EmployeeLeaves.jsx.md).
- **Owner Panel**: Owners approve or deny requests using [OwnerLeaves.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/leaves/OwnerLeaves.jsx.md), which appends `remarks` and mutates the status.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports**: Imports Mongoose to structure schemas and compile models.
2. **Leave Schema Declaration**: Defines fields, types, rules, and validators for the Leave document.
3. **Model Compilation & Export**: Generates and exports the Leave database model.

- **Lines 1-2 (Imports)**:
  - **Basic Function**: Import dependency.
  - **Detailed Explanation**: Imports `mongoose` (Line 1) to define schemas and interface with MongoDB database collections.
- **Lines 3-28 (Leave Schema Declaration)**:
  - **Basic Function**: Declare fields and validations for leave requests.
  - **Detailed Explanation**: Declares `leaveSchema` (Line 3). It references the `User` who requested the leave (Lines 4-8), and references the `Company` partition (Lines 9-13). It enforces a leave `type` restricted to sick, personal, annual, or unpaid (Lines 14-18). It requires `startDate` and `endDate` Date inputs (Lines 19-20), as well as a textual `reason` (Line 21). It uses an enum constraint for `status` consisting of pending, approved, and rejected, defaulting to pending (Lines 22-26). It also includes optional supervisor `remarks` (Line 27). The schema is configured with `timestamps: true` (Line 28) to track entry changes automatically.
- **Line 31 (Model Compilation & Export)**:
  - **Basic Function**: Compile and export the database model.
  - **Detailed Explanation**: Compiles and exports the mongoose model named `Leave` (Line 31) for use in application-wide controllers.
