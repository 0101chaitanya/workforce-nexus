# Story: Employee Payroll & Payslip Downloads (`/employee/payroll`)

This document explains the end-to-end flow of the Employee Payroll screen, which allows workers to track their earnings history, inspect leave/tax deductions, and download official PDF statements.

---

## 1. User Story & Narrative

> **As an** Employee,  
> **I want** to track my monthly payouts, view tax and leave deductions, and download PDF payslips or tenure statements,  
> **So that** I can maintain personal financial records and verify that my wages match my worked shifts.

### The Journey:
1. **Accessing Earnings**: The Employee navigates to the **Payroll** tab. The UI retrieves cached items from Redux if available; otherwise, a loading spinner is shown while fetching records from the server.
2. **Reviewing Statements**: The Employee inspects the statement grid:
   - **Pay Period**: Calendar month and year.
   - **Gross Salary**: Combined base pay and allowances (HRA, conveyance, medical).
   - **Leave Deductions**: Deductions resulting from approved unpaid leaves.
   - **Tax Deductions**: Calculated income tax.
   - **Net Payout**: Final salary disbursed.
   - **Status**: Payment status indicator.
3. **Downloading an Individual Payslip PDF**:
   - The Employee clicks **"Download"** on a monthly payroll item.
   - The backend checks that the requesting employee is authorized to access this file (preventing cross-user downloads).
   - The server compiles a PDF statement using `pdfkit`, drawing layout dividers for Earnings (Basic, HRA, Conveyance, Medical, Bonus) and Deductions (Taxes, Unpaid Leaves), and streams the binary to the browser.
4. **Downloading Consolidated Tenure Statement**:
   - The Employee clicks **"Download Consolidated Payslip"**.
   - The backend gathers every payroll document for the employee chronologically, totals the earnings and deductions, and generates a structured consolidated PDF summary showing career earnings metrics and a tabular monthly breakdown.

---

## 2. Frontend Design & State Flow

### View Component:
- **File**: `frontend/src/features/payroll/EmployeePayroll.jsx`

### Redux State Integration:
- **Slice**: `frontend/src/features/payroll/payrollSlice.js` (State Namespace: `state.payroll.employee`)
- **State Properties**:
  - `payrolls`: Array of user-specific payroll records.
  - `loading`: Loader spinner state.
  - `downloadingId`: Tracks the ID of the individual payslip currently downloading to show a loading state on its button.
  - `tenureDownloading`: Tracks the consolidated PDF download state.
  - `page` / `limit` / `paginationInfo`: Standard pagination parameters.

### Cache Verification:
- Inside `fetchPayroll(force)`:
  ```javascript
  if (!force && isCached && cachedParams &&
      cachedParams.page === page &&
      cachedParams.limit === limit) {
    return; // Retrieve from store, bypass API
  }
  ```

---

## 3. Backend Integration & Logic

### Endpoints:
1. `GET /api/payroll/history` (Retrieve employee-specific payroll records)
2. `GET /api/payroll/:id/download` (Download individual payslip PDF)
3. `GET /api/payroll/tenure/download` (Download career tenure overview PDF)

### Controller Details:
- **File**: `backend/src/controllers/payrollController.js`
- **Methods**: `getPayrollHistory`, `downloadPayslip`, `downloadTenurePayslip`

### Key Logical Processes:
- **Access Authorization Safeguard**:
  - In `downloadPayslip`, the backend verifies if `req.user.role !== 'owner'`. If so, it matches the requested payroll's `user` field with the employee's ID: `payroll.user._id.toString() !== req.user._id.toString()`.
  - If they do not match, it blocks access with a `403 Forbidden` response.
- **Dynamic PDF Rendering with pdfkit**:
  - Instantiates `new PDFDocument({ margin: 50, size: "A4" })`.
  - Configures download streaming response headers:
    - `Content-Type: application/pdf`
    - `Content-Disposition: attachment; filename="..."`
  - Pipes the document instance to the HTTP response: `doc.pipe(res)`.
  - Uses `pdfkit` commands to draw coordinates-based lines, titles, columns, tables, and total summary calculations, ending with `doc.end()` to complete the streaming download.

---

## 4. Database Collections Used

- **`Payroll`**: Holds structured financial values (basic, HRA, conveyance, medical, deductions, taxes, net pay, month, year) for the employee.
- **`User`**: Fetches the employee's professional info (position, branch, identity) and name for the PDF headers.
