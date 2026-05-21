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
  - **Key Function Calls**:
    - `require(path)`: Dynamically imports external packages or local modules (`../models/Payroll`, `../models/User`, `../models/Leave`, `pdfkit`, `../utils/logger`). Returns the exported module contents.
- **Lines 7-70 (getPayrollHistory)**:
  - **Basic Function**: Retrieve payroll records.
  - **Detailed Explanation**: Queries payrolls for the current company. Owners can filter by a `targetUserId`, while employees can only retrieve their own logs. If `page` and `limit` parameters are provided, it performs a paginated query with Mongoose `.skip()` and `.limit()`, returning pagination metadata. Otherwise, it returns the complete records sorted by date.
  - **Key Function Calls**:
    - `parseInt(string)`: Parses string values for page and limit into base-10 integers. Returns an integer or `NaN`.
    - `Payroll.countDocuments(query)`: Counts the total documents matching the query criteria. Returns a Promise resolving to the document count.
    - `Payroll.find(query)`: Performs a database search for payroll documents matching the query. Returns a Mongoose Query.
    - `query.populate(path, select)`: Hydrates user references in payroll records with selected fields (`fullName`, `email`, `position`, `identity`). Returns a Mongoose Query.
    - `query.sort(sortOption)`: Orders records descending by year and month. Returns a Mongoose Query.
    - `query.skip(skip)`: Skips a set number of records for pagination. Returns a Mongoose Query.
    - `query.limit(limitNum)`: Restricts the response array length. Returns a Mongoose Query.
    - `Math.ceil(number)`: Calculates the total pages needed by dividing the count by page size. Returns a number.
    - `res.status(statusCode)`: Sets the HTTP status code on the response object. Returns the Express response object.
    - `res.json(body)`: Sends a JSON response with the payload. Returns the Express response object.
    - `logger.error(message, meta)`: Logs unexpected errors to the system console/file with metadata. Returns undefined.
    - `new Date().toISOString()`: Instantiates and formats the current date to an ISO 8601 string. Returns a string.
- **Lines 72-217 (downloadPayslip)**:
  - **Basic Function**: Generate and download a PDF payslip for a specific month.
  - **Detailed Explanation**: Finds a single payroll record. Checks permissions to ensure employees can only access their own. Generates an A4 PDF document using `PDFDocument`. Formats the layout with employee details, an Earnings & Deductions table (comprising basic pay, HRA, conveyance, medical, bonus, tax, and unpaid leave deductions), and a Net Payout summary. Streams the document to the HTTP response with headers for PDF file attachment.
  - **Key Function Calls**:
    - `Payroll.findOne(query)`: Searches for a single payroll matching the specified ID and company. Returns a Mongoose Query.
    - `query.populate(path, select)`: Populates details of the referenced user document. Returns a Mongoose Query.
    - `res.status(statusCode)`: Sets the response HTTP status. Returns the Express response object.
    - `res.json(body)`: Returns a JSON response. Returns the Express response object.
    - `payroll.user._id.toString()`: Converts the user's ObjectId to its string representation. Returns a string.
    - `req.user._id.toString()`: Converts the requesting user's ObjectId to a string. Returns a string.
    - `new PDFDocument(options)`: Instantiates a new PDFKit document with configuration parameters. Returns the PDFDocument instance.
    - `payroll.user.fullName.replace(regexp, replacement)`: Sanitizes the employee's name by replacing whitespace with underscores. Returns a string.
    - `res.setHeader(name, value)`: Sets response headers (`Content-Type` and `Content-Disposition`) for downloading the PDF. Returns the response object.
    - `doc.pipe(destination)`: Pipes the PDF write stream to the HTTP response stream. Returns the destination stream.
    - `doc.fontSize(size)`: Sets the current font size in points. Returns the PDFDocument instance.
    - `doc.font(name)`: Sets the current font face (e.g., 'Helvetica-Bold'). Returns the PDFDocument instance.
    - `doc.text(text, x, y, options)`: Draws text at coordinates or the current position. Returns the PDFDocument instance.
    - `doc.moveDown(lines)`: Shifts the text cursor vertically downward. Returns the PDFDocument instance.
    - `doc.moveTo(x, y)`: Moves the graphic cursor to start a path. Returns the PDFDocument instance.
    - `doc.lineTo(x, y)`: Draws a line path to the coordinates. Returns the PDFDocument instance.
    - `doc.strokeColor(color)`: Sets the stroke color for drawing operations. Returns the PDFDocument instance.
    - `doc.stroke()`: Outlines the constructed path. Returns the PDFDocument instance.
    - `new Date(date)`: Parses the payroll date to a Date object. Returns a Date object.
    - `date.toLocaleDateString()`: Converts a Date object to a localized date string. Returns a string.
    - `number.toFixed(fractionDigits)`: Formats numbers to a string with exactly 2 decimal places. Returns a string.
    - `doc.fillColor(color)`: Sets the text or shape fill color. Returns the PDFDocument instance.
    - `doc.end()`: Finalizes the PDF document structure and closes the stream. Returns undefined.
    - `logger.error(message, meta)`: Logs errors during generation. Returns undefined.
    - `new Date().toISOString()`: Generates current date timestamp. Returns a string.
- **Lines 219-388 (generateCompanyPayroll)**:
  - **Basic Function**: Generate payroll documents for the next sequential month.
  - **Detailed Explanation**: Computes the next month sequentially relative to the last generated record. Exits with `400 Bad Request` if trying to generate for future months. Fetches all active employees. Queries all approved unpaid leaves overlapping the month. Computes unpaid leave days per employee and deducts this from their gross salary based on the monthly daily wage. Computes basic pay (50%), HRA (30%), conveyance (10%), medical (10%), and taxes (10% on taxable income > 50,000). Saves new `Payroll` documents using `insertMany()`.
  - **Key Function Calls**:
    - `Payroll.findOne(query)`: Queries the latest generated payroll. Returns a Mongoose Query.
    - `query.sort(sortOption)`: Sorts records descending by year/month. Returns a Mongoose Query.
    - `new Date()`: Instantiates current date or target month boundary dates. Returns a Date object.
    - `date.getMonth()`: Retrieves the 0-indexed month of a Date. Returns a number.
    - `date.getFullYear()`: Retrieves the 4-digit year of a Date. Returns a number.
    - `date.getDate()`: Retrieves the day of the month. Returns a number.
    - `date.getTime()`: Gets Unix millisecond representation. Returns a number.
    - `date.toISOString()`: Formats current date into an ISO string. Returns a string.
    - `res.status(statusCode)`: Sets the response HTTP status. Returns the Express response object.
    - `res.json(body)`: Returns a JSON response. Returns the Express response object.
    - `User.find(query)`: Fetches all active company employees. Returns a Mongoose Query.
    - `Leave.find(query)`: Finds approved unpaid leaves overlapping the target month bounds. Returns a Mongoose Query.
    - `leave.user.toString()`: Converts the leave's user ObjectId to string. Returns a string.
    - `Math.max(val1, val2)`: Compares timestamps to find the later date. Returns a number.
    - `Math.min(val1, val2)`: Compares timestamps to find the earlier date. Returns a number.
    - `Math.round(value)`: Rounds decimal payroll/leave calculations to the nearest integer. Returns a number.
    - `Payroll.findOne(query)`: Checks if a payroll already exists for the specific user/month/year. Returns a Mongoose Query.
    - `user._id.toString()`: Converts user ObjectId to string. Returns a string.
    - `payrolls.push(item)`: Adds a new payroll object to the array. Returns the new array length.
    - `Payroll.insertMany(payrolls)`: Performs a bulk insert of new payroll documents. Returns a Promise.
    - `logger.error(message, meta)`: Logs processing errors. Returns undefined.
- **Lines 390-546 (downloadTenurePayslip)**:
  - **Basic Function**: Generate a consolidated statement of all salary payouts for an employee.
  - **Detailed Explanation**: Resolves the employee's ID. Retrieves all past payroll records sorted chronologically. Sums the total gross earnings, total leave deductions, total taxes, and total net pay. Renders a consolidated tenure PDF detailing the profile, aggregated summary metrics, and a tabular breakdown of all monthly payroll events (with page-overflow logic to split rows onto new pages). Streams the file to the response client.
  - **Key Function Calls**:
    - `User.findOne(query)`: Finds the target employee by ID and company ID. Returns a Mongoose Query.
    - `res.status(statusCode)`: Sets the response HTTP status. Returns the Express response object.
    - `res.json(body)`: Sends a JSON response. Returns the Express response object.
    - `Payroll.find(query)`: Fetches all payrolls for the employee. Returns a Mongoose Query.
    - `query.sort(sortOption)`: Sorts payroll records chronologically (ascending). Returns a Mongoose Query.
    - `payrollHistory.forEach(callback)`: Iterates over past payroll records to sum tenure statistics. Returns undefined.
    - `new PDFDocument(options)`: Creates a new PDFKit document instance. Returns the PDFDocument instance.
    - `employee.fullName.replace(regexp, replacement)`: Sanitizes the user's name for filenames. Returns a string.
    - `res.setHeader(name, value)`: Configures the attachment filename and content headers. Returns the response object.
    - `doc.pipe(destination)`: Pipes the PDF stream to the client response. Returns the destination stream.
    - `doc.fontSize(size)` / `doc.font(name)` / `doc.fillColor(color)` / `doc.text(text, x, y, options)` / `doc.moveDown(lines)` / `doc.moveTo(x, y)` / `doc.lineTo(x, y)` / `doc.stroke()` / `doc.strokeColor(color)`: Methods on the PDFDocument instance for text formatting and page markup. Returns the PDFDocument instance.
    - `new Date().toLocaleDateString()`: Formats current date locally. Returns a string.
    - `number.toFixed(fractionDigits)`: Converts numbers to formatted 2-decimal-place strings. Returns a string.
    - `doc.addPage()`: Inserts a new page in the PDF document when a page overflow occurs. Returns the PDFDocument instance.
    - `doc.end()`: Finalizes the PDF write stream. Returns undefined.
    - `logger.error(message, meta)`: Logs tenure PDF generation errors. Returns undefined.
    - `new Date().toISOString()`: Generates current date timestamp. Returns a string.

