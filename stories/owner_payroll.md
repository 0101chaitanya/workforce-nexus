# Story: Owner Payroll Management (`/owner/payroll`)

This document explains the end-to-end flow of the Owner Payroll Management screen, which allows business owners to view historical payrolls, sequentially generate monthly salary sheets, and download individual payslips or tenure summaries as PDF files.

---

## 1. User Story & Narrative

> **As an** Organization Owner,  
> **I want** to sequentially generate monthly payrolls for my employees, review basic/allowance details, and download PDF statements,  
> **So that** I can ensure accurate salary disbursements, calculate leave-based wage deductions, and track historical payments.

### The Journey:
1. **Accessing Payroll**: The Owner clicks the **Payroll** tab. The UI retrieves cached records from Redux if parameters align with the previous fetch. If not, the UI shows a loading state and fetches records from the backend database.
2. **Generating Monthly Payroll**:
   - The Owner clicks the **"Generate Payroll"** button.
   - The backend sequentially calculates the target payroll month. If payrolls already exist, it targets the next chronological month (wrapping around from Month 12 to Month 1 of the next year). If no payrolls exist, it targets the previous calendar month.
   - The backend checks if target dates exceed the current calendar month to prevent generating future payrolls.
   - It performs math queries: counting unpaid leaves, determining daily wage rates, splitting the basic salary into standard components, assessing tax brackets, and writing entries to the database.
   - The Owner receives a success toast. The frontend resets to page 1 and pulls fresh records.
3. **Downloading an Individual Payslip**:
   - The Owner clicks **"Download PDF"** next to any payroll entry.
   - The backend retrieves the record, generates an A4 PDF on the fly using `pdfkit` containing details of basic pay, allowances (HRA, conveyance, medical), unpaid leave deductions, taxes, and net pay, and streams it to the browser.
4. **Downloading Employee Tenure Summary**:
   - The Owner looks up a specific employee using the lookup autocomplete filter.
   - Once selected, the **"Download Tenure Payslip"** button is activated.
   - Clicking it requests a consolidated PDF summing up the employee's total gross pay, deductions, taxes, and net payouts across their entire tenure, alongside a structured monthly statement table.

---

## 2. Frontend Design & State Flow

### View Component:
- **File**: `frontend/src/features/payroll/OwnerPayroll.jsx`

### Redux State Integration:
- **Slice**: `frontend/src/features/payroll/payrollSlice.js` (State Namespace: `state.payroll.owner`)
- **State Properties**:
  - `payrolls`: List of payroll records.
  - `targetUserId`: Active filter for employee lookup.
  - `loading`: Main history fetch spinner.
  - `generating`: Spinner indicating payroll calculations are running.
  - `downloadLoading`: Tracks the specific payroll ID currently downloading a PDF.
  - `tenureDownloading`: Indicator for the tenure overview PDF download.
  - `page` / `limit` / `paginationInfo`: Standard pagination variables.
  - `searchQuery` / `searchResults` / `selectedUserObj` / `showDropdown` / `searchLoading`: Autocomplete search controls.
  - `isCached`: Cache indicator.
  - `cachedParams`: Matches the cached parameters: `page`, `limit`, and `targetUserId`.

### Caching Check:
- Inside `fetchPayrolls(force)`:
  ```javascript
  if (!force && isCached && cachedParams &&
      cachedParams.page === page &&
      cachedParams.limit === limit &&
      cachedParams.targetUserId === targetUserId) {
    return; // Retrieve from store, bypass API
  }
  ```

---

## 3. Backend Integration & Logic

### Endpoints:
1. `GET /api/payroll/history` (Retrieve list of payrolls)
2. `POST /api/payroll/generate` (Calculate and generate monthly payroll)
3. `GET /api/payroll/:id/download` (Compile and download individual PDF payslip)
4. `GET /api/payroll/tenure/download` (Compile and download tenure consolidated PDF payslip)

### Controller Details:
- **File**: `backend/src/controllers/payrollController.js`
- **Methods**: `getPayrollHistory`, `generateCompanyPayroll`, `downloadPayslip`, `downloadTenurePayslip`

### Key Logical Calculations:
- **Sequential Date Calculation**:
  - Fetches the single newest payroll record sorted descending: `{ year: -1, month: -1 }`.
  - If a record exists, the target period is: `month = lastPayroll.month + 1`, `year = lastPayroll.year`. If `month > 12`, it wraps: `month = 1`, `year = year + 1`.
  - Compares the target date with the server's local date. If `year > currentYear || (year === currentYear && month > currentMonth)`, generation is blocked.
  - If no payroll records exist, the fallback targets the previous calendar month.
- **Unpaid Leave Deduction Math**:
  - Daily wage rate is computed as: `dailyWage = grossSalary / daysInMonth` (where `daysInMonth` is calculated for that specific year/month, e.g. 28, 30, or 31).
  - Fetches approved leaves matching `{ company: companyId, status: "approved", type: "unpaid" }` that overlap with the target month boundaries.
  - For each overlap:
    - `actualStart = Math.max(leave.startDate, monthStart)`
    - `actualEnd = Math.min(leave.endDate, monthEnd)`
    - Overlapping days: `days = Math.round((actualEnd - actualStart) / (1000 * 60 * 60 * 24)) + 1`
  - Unpaid Leave Deduction: `unpaidLeaveDeductions = Math.round(days * dailyWage)`.
- **Wage Breakdown & Taxes**:
  - Split formula:
    - **Basic Pay**: 50% of monthly gross
    - **House Rent Allowance (HRA)**: 30% of monthly gross
    - **Conveyance Allowance**: 10% of monthly gross
    - **Medical Allowance**: 10% of monthly gross
    - **Bonus**: 0 (default/base)
  - Gross Pay: `grossPay = basicPay + hra + conveyance + medical + bonus`.
  - Taxable Income: `taxableIncome = grossPay - unpaidLeaveDeductions`.
  - Taxes: If `taxableIncome > 50,000`, tax is `Math.round(taxableIncome * 0.1)` (10% tax bracket). Otherwise, tax is `0`.
  - Net Pay: `netPay = taxableIncome - taxes`.

---

## 4. Database Collections Used

- **`Payroll`**: Holds structured financial values for basic pay, allowances (HRA, conveyance, medical), deductions (unpaid leaves), taxes, net pay, status (`"generated"` or `"paid"`), month, year, and associated user/company IDs.
- **`Leave`**: Queried for approved unpaid leaves to calculate penalty deductions.
- **`User`**: Fetches the gross base salary and profile specifications for each employee.
