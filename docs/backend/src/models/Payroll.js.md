# backend/src/models/Payroll.js

## 1. Overview
The `Payroll` model represents monthly compensation records for employees. It aggregates base salaries, allowances, deductions (such as unpaid leave deductions), taxes, and net disbursements.

## 2. Key Responsibilities & Flow
- **Fields & Constraints**:
  - `user`: ObjectId referencing the target `User` (required).
  - `company`: ObjectId referencing the active `Company` (required).
  - `month` & `year`: Target period for the payroll.
  - **Earnings Fields**:
    - `basicPay`: Core salary base amount (required).
    - `hra` (House Rent Allowance), `conveyance`, `medical`, `bonus`: Additive fields (defaults to 0).
  - **Deductions & Offsets**:
    - `unpaidLeaveDeductions`: Calculated pay cuts derived from approved unpaid time-off.
    - `taxes`: Tax withholdings.
  - **Net Summary**:
    - `grossPay`: Total pay before deductions (required).
    - `netPay`: Final payout sum (required).
  - `paidDate`: Date of payroll disbursement.
  - `status`: Lifecycle indicator restricted to `["not-generated", "pending", "generated"]`. Defaults to `"not-generated"`.

## 3. Code Patterns & Best Practices
- **Period Constraints**: Restricts the `month` field using numeric constraints (`min: 1`, `max: 12`) to prevent invalid monthly indexing.
- **Granular Ledger Columns**: Maintains detailed columns for earnings and deductions rather than storing just a single final sum, ensuring transparent payroll slips.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- **Employee View**: Employees can inspect payroll summaries and download generated slips using [EmployeePayroll.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/payroll/EmployeePayroll.jsx.md).
- **Owner View**: Owners can calculate, review, generate, and process salary slips for all staff using [OwnerPayroll.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/payroll/OwnerPayroll.jsx.md).

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports**: Imports Mongoose to structure schemas and compile models.
2. **Payroll Schema Definition**: Specifies variables, ranges, default values, and relational references for calculating and recording employee monthly payrolls.
3. **Model Instantiation & Export**: Compiles the Mongoose schema into a Payroll model and exports it.

- **Lines 1-2 (Imports)**:
  - **Basic Function**: Import database wrapper.
  - **Detailed Explanation**: Imports `mongoose` (Line 1) to create the schema structures.
  - **Key Function Calls**:
    - `require("mongoose")`: Loads the Mongoose library to provide schema building and MongoDB interface functions. Returns the Mongoose module object.
- **Lines 3-69 (Payroll Schema Definition)**:
  - **Basic Function**: Structure the database schema for payroll records.
  - **Detailed Explanation**: Declares `payrollSchema` (Line 3). It defines `user` (Lines 4-8) and `company` (Lines 9-13) references. It validates `month` as a required Number between 1 and 12 (Lines 15-20), and `year` as a required Number (Lines 21-24). It sets `basicPay` as a required Number (Lines 25-28). It includes additive earnings: `hra` (Lines 29-32), `conveyance` (Lines 33-36), `medical` (Lines 37-40), and `bonus` (Lines 41-44). Deductions are stored in `unpaidLeaveDeductions` (Lines 45-48) and `taxes` (Lines 49-52). It requires calculated summaries `grossPay` (Lines 53-56) and `netPay` (Lines 57-60). It supports an optional payment date `paidDate` (Lines 61-63), and restricts the lifecycle `status` to not-generated, pending, or generated, defaulting to not-generated (Lines 64-68). Options `timestamps: true` (Line 69) is included to track updates automatically.
  - **Key Function Calls**:
    - `new mongoose.Schema(definition, options)`: Constructor called to define the structure, indices, and validations of a Mongoose Schema. Returns a Schema instance.
- **Lines 71-73 (Model Instantiation & Export)**:
  - **Basic Function**: Instantiate and export the database model.
  - **Detailed Explanation**: Compiles the model named `Payroll` using `payrollSchema` (Line 71) and exports it (Line 73) using CommonJS.
  - **Key Function Calls**:
    - `mongoose.model("Payroll", payrollSchema)`: Compiles the `payrollSchema` into a model named `'Payroll'`, exposing database operation APIs to interact with the payrolls collection in MongoDB.
