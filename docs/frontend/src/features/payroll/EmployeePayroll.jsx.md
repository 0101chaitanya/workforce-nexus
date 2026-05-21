# EmployeePayroll.jsx

## 1. Overview
The `EmployeePayroll.jsx` component renders the client interface for normal employee users to view and download their individual payroll history and statements. It lists all computed payouts (gross salary, leave deductions, taxes, and net pay) by period and enables single-month and consolidated multi-month tenure payslip PDF downloads.

---

## 2. Key Responsibilities & Flow
- **Fetching Personal Payroll History**:
  - Automatically queries the backend at `/api/payroll/history` to load the current employee's payslips.
  - Supports client-side paging utilizing the `Pagination` component.
- **Downloading Personal Payslips**:
  - **Individual PDF**: Executes a request to `/api/payroll/:id/download`. It treats the output as a `blob`, generates a local URL, triggers browser download behavior with a custom filename formatted like `Payslip_[MonthName]_[Year].pdf`, and destroys the temporary URL to avoid memory leakages.
  - **Tenure PDF**: Executes a request to `/api/payroll/tenure/download` to get a consolidated report of all payouts for the current year.

---

## 3. Code Patterns & Best Practices
- **Pagination & Grid Limits**:
  - Syncs page index and item counts using the common `Pagination` layout.
- **Secure File Stream Download**:
  - Uses Axios `responseType: 'blob'` for downloads, which allows downloading raw PDFs behind authenticated JWT routes safely without exposing files in public unauthenticated folders.
- **Formatting Helpers**:
  - Integrates `getMonthName(monthNumber)` utility mapping integer indices (1-12) to descriptive string labels (e.g. "January", "February") dynamically using the browser's `toLocaleString` configuration.

---

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
This frontend component maps to the following backend elements:
- **Routes / Endpoints consumed**:
  - `GET` `/api/payroll/history` -> Handled by `payrollRoutes.js` and `payrollController.js` (`getPayrollHistory`).
  - `GET` `/api/payroll/:id/download` -> Handled by `payrollRoutes.js` and `payrollController.js` (`downloadPayslip`).
  - `GET` `/api/payroll/tenure/download` -> Handled by `payrollRoutes.js` and `payrollController.js` (`downloadTenurePayslip`).
- **Mongoose Model Reference**:
  - Reads data objects structured according to the `Payroll` schema (`Payroll.js`: `month`, `year`, `basicPay`, `hra`, `conveyance`, `medical`, `bonus`, `unpaidLeaveDeductions`, `taxes`, `netPay`, `status`).

---

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports & Setup (Lines 1-6)**: Resolves React state, custom axios API wrapper, Pagination component, and UI icons.
2. **Local Component State (Lines 9-22)**: Tracks payslip records, error logs, and paginator pages.
3. **Data Loading Actions (Lines 24-53)**: Queries personal payslip directories on page navigation.
4. **File Download Controllers (Lines 55-107)**: Handles fetching monthly PDFs and consolidated yearly tenure payslips from backend streams, triggering browser-level files download via virtual link clicks.
5. **Main Presentation UI (Lines 109-238)**: Renders banners, payslips tables, detail rows, download anchors, and page selections.

- **Lines 1-6 (Imports)**:
  - Imports React hooks (`useState`, `useEffect`).
  - Imports the custom axios client wrapper `api`.
  - Imports the common React `Pagination` child component.
  - Imports icons from `lucide-react` (`CreditCard`, `Download`, `Loader2`, `AlertCircle`, `FileText`, `Calendar`, `DollarSign`).
- **Lines 9-13 (State Variables)**:
  - `payrolls`: Stores the arrays of personal payslips returned by the database.
  - `loading`: Tracks directory lookup waiting status.
  - `downloadingId`: Tracks the specific monthly payroll ID that is being downloaded to show its loading spinner.
  - `tenureDownloading`: Tracks consolidated PDF creation request process.
  - `error`: Captures network rejection message text.
- **Lines 15-22 (Pagination Configurations)**:
  - Tracks user selected page limits and maps metadata indicators (total, totalPages, hasNext, hasPrev).
- **Lines 24-49 (`fetchPayroll` asynchronous function)**:
  - Hits `GET /api/payroll/history` sending active page indicators.
  - On success, sets `payrolls` list state and extracts pagination objects.
  - Handles request failure and updates `error` messages.
- **Lines 51-53 (useEffect Hook)**:
  - Subscribes to `page` and `limit` states to execute a re-fetch when page changes occur.
- **Lines 55-77 (`handleDownload` monthly payslips routine)**:
  - Sets `downloadingId` to the current payslip ID.
  - Requests `/api/payroll/:id/download` with `responseType: 'blob'`.
  - Instantiates a local virtual document reference, triggers an immediate download action, removes the link, and clears the memory objects.
- **Lines 79-100 (`handleDownloadTenure` consolidated routine)**:
  - Hits `/api/payroll/tenure/download` with `responseType: 'blob'`.
  - Triggers a similar virtual link element generation to download the consolidated file.
- **Lines 103-107 (`getMonthName` lookup helper)**:
  - Subducts an integer index (1-12) to produce long month names using standard Javascript `toLocaleString` features.
- **Lines 109-238 (JSX Layout Rendering)**:
  - Lines 113-135: Main banner displaying titles and the "Download Tenure Payslip" button.
  - Lines 138-142: Sub-header displaying section icons.
  - Lines 144-155: Renders loading progress indicator or error boxes.
  - Lines 157-217: Grid mapping headers (Pay Period, Gross, Deductions, Taxes, Net, Status, Actions) and rows looping over the employee's payrolls array. Renders single PDF download buttons alongside monthly rows.
  - Lines 220-233: Integrates the `Pagination` component footer.


