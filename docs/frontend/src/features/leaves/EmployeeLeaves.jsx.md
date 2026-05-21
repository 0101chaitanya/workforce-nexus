# frontend/src/features/leaves/EmployeeLeaves.jsx

## 1. Overview
`frontend/src/features/leaves/EmployeeLeaves.jsx` implements the personal leave management interface for employees, allowing them to submit new leave requests, monitor pending approvals, and view historical submissions.

## 2. Key Responsibilities & Flow
- **Leave Metrics Summary**: Displays summary cards on page load (showing total pending, approved, and rejected request counts) fetched from the `/leaves/history` API.
- **Application Submission Dialog**:
  - Displays a modal form to collect leave parameters (leave type: `sick`, `personal`, `annual`, `unpaid`; start/end dates; and a description of the request).
  - Validates inputs before submission.
  - Sends a POST request to `/leaves/apply` with the form details, then refreshes the feed and metrics summary.
- **Personal History Log**: Lists the user's personal leave requests in a paginated table showing dates, request reasons, status badges, and admin remarks.

## 3. Code Patterns & Best Practices
- **Date Check Guards**: Validates that the start date is before the end date prior to submission to prevent API failures.
- **Minimum Character Limits**: Enforces a minimum description length (at least 5 characters) to ensure the request has sufficient context before sending.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- **Endpoints mapping**:
  - `GET /api/leaves/history` -> Called by `fetchLeaves` to load the employee's personal leave requests and summary statistics.
  - `POST /api/leaves/apply` -> Called by `handleSubmit` to create a new leave request.
- **Validation**: Submissions are validated against the backend Zod validation schema: `leaveSchemas.apply`.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports & Setup (Lines 1-6)**: Resolves React state/lifecycle components, custom API client wrapper, Pagination component, and UI icons from `lucide-react`.
2. **State Declaration (Lines 9-35)**: Configures states for leaves records list, loading indicators, error/success notifications, apply modal visibility, form values (type, dates, reason), pagination metrics, and leaveStats (pending, approved, rejected counts).
3. **fetchLeaves Function (Lines 37-72)**: Queries `/leaves/history` to load the current employee's leaves history, sets local pagination states, and reduces or sets the `leaveStats` counts.
4. **Initial Mount useEffect Hook (Lines 74-76)**: Automatically re-queries the API on mount or when pagination pages/limits are updated.
5. **handleSubmit Handler (Lines 78-122)**: Validates start/end date logic and minimum character constraints for reasons, then dispatches POST application payloads to `/leaves/apply` before resetting forms and refreshing grids.
6. **Main Presentation UI (Lines 124-374)**: Renders headers, "Apply for Leave" triggers, success/error banners, leave stats count cards, leaves history tables, pagination panels, and modal application forms.

- **Lines 1-6 (Imports)**:
  - **Basic Function**: Pull libraries and graphic icons.
  - **Detailed Explanation**: Imports React, `useState`, and `useEffect`. Also imports the authenticated interceptors Axios wrapper `api`, the `Pagination` layout, and several layout icons from `lucide-react`.
  - **Key Function Calls**: None.
- **Lines 8 (Component Definition)**:
  - **Basic Function**: Define the `EmployeeLeaves` component wrapper.
  - **Detailed Explanation**: Declares the default export function `EmployeeLeaves` which holds local React hooks and page layouts.
  - **Key Function Calls**: None.
- **Lines 9-21 (Basic States & Form Setup)**:
  - **Basic Function**: Cache list records, loader states, notifications, modal switches, and input values.
  - **Detailed Explanation**: `leaves` holds personal leave history records list. `loading` and `submitLoading` manage loading spinners. `error` and `successMessage` cache network notifications. `isApplyModalOpen` toggles modal visibility. `form` is an object with type ('sick' default), startDate, endDate, and reason properties.
  - **Key Function Calls**:
    - `useState(initialState)`: Registers new state variables in the React component lifecycle:
      - `useState([])` for tracking the employee's personal leave requests list (`leaves`).
      - `useState(true)` for the history table `loading` status indicator.
      - `useState(false)` for tracking active leave requests submission state (`submitLoading`).
      - `useState(null)` for mapping query validation or request errors (`error`).
      - `useState(null)` for the `successMessage` notification alert text.
      - `useState(false)` for tracking the apply leave modal visibility flag (`isApplyModalOpen`).
      - `useState({ type: 'sick', startDate: '', endDate: '', reason: '' })` for tracking inputs in the apply `form` object.
- **Lines 23-35 (Pagination & Stats states)**:
  - **Basic Function**: Store pagination variables and leave category counts.
  - **Detailed Explanation**: `page` and `limit` track pagination numbers. `paginationInfo` stores navigation items. `leaveStats` is an object with pending, approved, and rejected numeric counters.
  - **Key Function Calls**:
    - `useState(initialState)`: Registers new state variables in the React component lifecycle:
      - `useState(1)` for tracking the active page index (`page`).
      - `useState(10)` for tracking the max results count per page (`limit`).
      - `useState({ total: 0, totalPages: 1, hasNext: false, hasPrev: false })` for tracking pagination metadata (`paginationInfo`).
      - `useState({ pending: 0, approved: 0, rejected: 0 })` for leave category status counts (`leaveStats`).
- **Lines 37-72 (fetchLeaves Function)**:
  - **Basic Function**: Load personal leave logs and summary stats from database.
  - **Detailed Explanation**: Sets `loading` true and resets errors. Sends a GET request to `/leaves/history` passing pagination parameters. If successful, maps records list to `leaves` and updates the paginator. If stats are returned by the backend, assigns them to `leaveStats`; otherwise, filters and counts status values locally. Updates loader flag.
  - **Key Function Calls**:
    - `setLoading(true)`: Sets the `loading` state to `true` to display the loading screen.
    - `setError(null)`: Resets previous query error states.
    - `api.get(url, config)`: Dispatches GET request to `/leaves/history` with page and limit options. Returns a Promise.
    - `setLeaves(data)`: Caches the retrieved leave requests list.
    - `setPaginationInfo(pagination)`: Configures the pagination status metadata.
    - `setLeaveStats(stats)`: Caches category counts.
    - `data.filter(callback)`: Standard array method invoked to count leaves by status locally in case backend statistics are omitted:
      - `data.filter(l => l.status === 'pending')` filters pending status requests.
      - `data.filter(l => l.status === 'approved')` filters approved status requests.
      - `data.filter(l => l.status === 'rejected')` filters rejected status requests.
    - `setError(message)`: Caches the request failures in `error` state.
    - `setLoading(false)`: Disables the history log loading overlay.
- **Lines 74-76 (useEffect Hook)**:
  - **Basic Function**: Sync feed upon pagination changes.
  - **Detailed Explanation**: Triggers a call to `fetchLeaves()` whenever `page` or `limit` is updated.
  - **Key Function Calls**:
    - `useEffect(callback, dependencies)`: Schedules the data loading sequence to run when page or limit indices change.
    - `fetchLeaves()`: Invokes backend synchronization.
- **Lines 78-122 (handleSubmit Handler)**:
  - **Basic Function**: Submit a leave application.
  - **Detailed Explanation**: Blocks page reloading using `e.preventDefault()`. Validates that `startDate` is not after `endDate`. Validates that the trimmed reason length is at least 5 characters. Sets `submitLoading` true. Sends a POST request to `/leaves/apply` with the leave type, formatted ISO dates, and trimmed reason. On success, resets form inputs, closes the modal, and resets page pagination back to page 1 to show the new request.
  - **Key Function Calls**:
    - `e.preventDefault()`: Prevents standard form submission page refresh.
    - `setError(null)`: Clears existing error states.
    - `setSuccessMessage(null)`: Resets existing success text.
    - `new Date(value)`: Instantiates a Date object to compare the start date and the end date values or convert inputs to Date instances:
      - `new Date(form.startDate)` converts start date text.
      - `new Date(form.endDate)` converts end date text.
    - `form.reason.trim()`: Trims white spaces from user description.
    - `setSubmitLoading(true)`: Displays loading indicator and blocks repeat clicks.
    - `api.post(url, data)`: Sends a POST request to `/leaves/apply` with application parameters. Returns a Promise.
    - `new Date(form.startDate).toISOString()`: Converts start date to standard ISO 8601 string.
    - `new Date(form.endDate).toISOString()`: Converts end date to standard ISO 8601 string.
    - `setSuccessMessage(message)`: Outputs success banner information.
    - `setForm(initialFields)`: Restores form state fields to default blank settings.
    - `setIsApplyModalOpen(false)`: Closes the active form modal.
    - `fetchLeaves()`: Triggers details sync request.
    - `setPage(1)`: Overwrites page index to reload new record in the top slot of first page.
    - `setError(message)`: Caches application rejection messages.
    - `setSubmitLoading(false)`: Releases the loading lock state.
- **Lines 124-374 (JSX Rendering Section)**:
  - **Basic Function**: Outputs the user interface page.
  - **Detailed Explanation**:
    - Lines 128-145: Banner header containing description and the "Apply for Leave" modal open trigger button.
    - Lines 147-159: Error or success inline notification banners.
    - Lines 162-198: Metrics grid cards displaying counts of pending, approved, and rejected leave requests.
    - Lines 201-281: Leaves log table mapping details of requests (leave type, start/end dates, reason, status badge, and admin remarks notes). Hooks up the `Pagination` component in the footer.
    - Lines 284-370: Application Modal dialog overlay. Displays form elements: dropdown picker for leave type, input dates, text area reason input, and Cancel/Submit buttons.
  - **Key Function Calls**:
    - `setIsApplyModalOpen(true)`: Triggers modal overlay container display.
    - `leaves.map(callback)`: Renders leave rows in the table.
    - `new Date(leave.startDate).toLocaleDateString()`: Converts startDate string to local representation.
    - `new Date(leave.endDate).toLocaleDateString()`: Converts endDate string to local representation.
    - `setPage(newPage)`: Updates current page inside pagination `onPageChange` callback.
    - `setLimit(newLimit)`: Updates current limit inside pagination `onLimitChange` callback.
    - `setIsApplyModalOpen(false)`: Closes form modal.
    - `setForm(newData)`: Inline updater inside form `onChange` and `onSubmit` fields:
      - `setForm({ ...form, type: e.target.value })` updates the leave type.
      - `setForm({ ...form, startDate: e.target.value })` updates the start date.
      - `setForm({ ...form, endDate: e.target.value })` updates the end date.
      - `setForm({ ...form, reason: e.target.value })` updates the reason text field.
