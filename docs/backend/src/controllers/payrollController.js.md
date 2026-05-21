# backend/src/controllers/payrollController.js

## 1. Overview
`backend/src/controllers/payrollController.js` manages salary computations and invoice exports. It dynamically calculates monthly employee pay items based on approved unpaid leaves and handles PDF generation for standard and tenure consolidated statements using the `pdfkit` library.

## 2. Key Responsibilities & Flow
Exposes the following endpoint handlers:
- **`getPayrollHistory`**:
  - Fetches payroll history records. Filters search queries based on the user's role:
    - Owners can retrieve all logs (optionally filtered by a target employee).
    - Employees are restricted to their own logs.
  - Supports query parameter pagination parameters (`page`, `limit`).
- **`downloadPayslip`**:
  - Resolves a payroll item ID.
  - Compiles name, position, branch, paidDate, earnings (basicPay, HRA, conveyance, medical, bonus), and deductions (taxes, unpaid leaves) into a formal PDF layout.
  - Streams the PDF directly to the response client headers.
- **`generateCompanyPayroll`**:
  - Determines the target month sequentially (relative to the company's last processed period).
  - Fetches all active employees under the organization.
  - Queries `Leave` records to identify approved unpaid leaves overlapping the target month bounds.
  - Groups and calculates unpaid leave counts by user to calculate wage deductions.
  - Computes earnings:
    - Basic Pay: 50% of gross salary.
    - HRA (House Rent Allowance): 30% of gross salary.
    - Conveyance: 10% of gross salary.
    - Medical Allowance: 10% of gross salary.
  - Calculates taxes: 10% on taxable income exceeding ₹50,000.
  - Saves the calculated records to the `Payroll` collection.
- **`downloadTenurePayslip`**:
  - Gathers all chronological payroll slips for an employee.
  - Summarizes gross, taxes, deductions, and net amounts into a consolidated ledger.
  - Appends a detailed monthly statement table across multiple pages in PDF format.

## 3. Code Patterns & Best Practices
- **Sequence Verification**: When generating payroll, it sequentially increments the month and prevents owners from generating statements for future months.
- **PDF Streaming**: Generates PDFs dynamically and pipes them directly to the HTTP response stream (`doc.pipe(res)`), reducing disk storage overhead.
- **Double Entry Calculation Logic**: Maintains explicit columns for calculations (basic pay, HRA, medical) instead of storing a single final sum to ensure audit transparency.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- **`getPayrollHistory`**: Feeds payroll records and history tables inside [EmployeePayroll.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/payroll/EmployeePayroll.jsx.md) and [OwnerPayroll.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/payroll/OwnerPayroll.jsx.md).
- **`generateCompanyPayroll`**: Triggered by the "Generate Payroll" action in the owner's dashboard view ([OwnerPayroll.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/payroll/OwnerPayroll.jsx.md)).
- **Payslip Downloads**: Links to action buttons in employee and owner payroll detail panels.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Lines 1-5 (Imports)**: Import models (`Payroll`, `User`, `Leave`), `pdfkit`, and custom `logger`.
2. **Lines 7-70 (getPayrollHistory)**: Retrieve payroll history for employees/owners with optional pagination.
3. **Lines 72-217 (downloadPayslip)**: Retrieve a single payroll item, construct and stream a formatted PDF payslip.
4. **Lines 219-388 (generateCompanyPayroll)**: Calculate and generate payroll records for the next sequential month. Calculates unpaid leave days, applies basic/hra/conveyance/medical split, applies tax deductions, saves to database.
5. **Lines 390-546 (downloadTenurePayslip)**: Compile all payroll records for an employee, aggregate totals, build a tenure summary table, and stream as a PDF.

- **Lines 1-5 (Imports)**:
  - **Basic Function**: Import dependencies.
  - **Detailed Explanation**: Imports models (`Payroll`, `User`, `Leave`) for database queries, `PDFDocument` from `pdfkit` for generating PDFs, and `logger` for logging errors.
- **Lines 7-70 (getPayrollHistory)**:
  - **Basic Function**: Retrieve payroll records.
  - **Detailed Explanation**: Queries payrolls for the current company. Owners can filter by a `targetUserId`, while employees can only retrieve their own logs. If `page` and `limit` parameters are provided, it performs a paginated query with Mongoose `.skip()` and `.limit()`, returning pagination metadata. Otherwise, it returns the complete records sorted by date.
- **Lines 72-217 (downloadPayslip)**:
  - **Basic Function**: Generate and download a PDF payslip for a specific month.
  - **Detailed Explanation**: Finds a single payroll record. Checks permissions to ensure employees can only access their own. Generates an A4 PDF document using `PDFDocument`. Formats the layout with employee details, an Earnings & Deductions table (comprising basic pay, HRA, conveyance, medical, bonus, tax, and unpaid leave deductions), and a Net Payout summary. Streams the document to the HTTP response with headers for PDF file attachment.
- **Lines 219-388 (generateCompanyPayroll)**:
  - **Basic Function**: Generate payroll documents for the next sequential month.
  - **Detailed Explanation**: Computes the next month sequentially relative to the last generated record. Exits with `400 Bad Request` if trying to generate for future months. Fetches all active employees. Queries all approved unpaid leaves overlapping the month. Computes unpaid leave days per employee and deducts this from their gross salary based on the monthly daily wage. Computes basic pay (50%), HRA (30%), conveyance (10%), medical (10%), and taxes (10% on taxable income > 50,000). Saves new `Payroll` documents using `insertMany()`.
- **Lines 390-546 (downloadTenurePayslip)**:
  - **Basic Function**: Generate a consolidated statement of all salary payouts for an employee.
  - **Detailed Explanation**: Resolves the employee's ID. Retrieves all past payroll records sorted chronologically. Sums the total gross earnings, total leave deductions, total taxes, and total net pay. Renders a consolidated tenure PDF detailing the profile, aggregated summary metrics, and a tabular breakdown of all monthly payroll events (with page-overflow logic to split rows onto new pages). Streams the file to the response client.

