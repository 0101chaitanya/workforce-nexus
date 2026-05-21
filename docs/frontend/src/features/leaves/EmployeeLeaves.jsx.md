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
- **Lines 8 (Component Definition)**:
  - **Basic Function**: Define the `EmployeeLeaves` component wrapper.
  - **Detailed Explanation**: Declares the default export function `EmployeeLeaves` which holds local React hooks and page layouts.
- **Lines 9-21 (Basic States & Form Setup)**:
  - **Basic Function**: Cache list records, loader states, notifications, modal switches, and input values.
  - **Detailed Explanation**: `leaves` holds personal leave history records list. `loading` and `submitLoading` manage loading spinners. `error` and `successMessage` cache network notifications. `isApplyModalOpen` toggles modal visibility. `form` is an object with type ('sick' default), startDate, endDate, and reason properties.
- **Lines 23-35 (Pagination & Stats states)**:
  - **Basic Function**: Store pagination variables and leave category counts.
  - **Detailed Explanation**: `page` and `limit` track pagination numbers. `paginationInfo` stores navigation items. `leaveStats` is an object with pending, approved, and rejected numeric counters.
- **Lines 37-72 (fetchLeaves Function)**:
  - **Basic Function**: Load personal leave logs and summary stats from database.
  - **Detailed Explanation**: Sets `loading` true and resets errors. Sends a GET request to `/leaves/history` passing pagination parameters. If successful, maps records list to `leaves` and updates the paginator. If stats are returned by the backend, assigns them to `leaveStats`; otherwise, filters and counts status values locally. Updates loader flag.
- **Lines 74-76 (useEffect Hook)**:
  - **Basic Function**: Sync feed upon pagination changes.
  - **Detailed Explanation**: Triggers a call to `fetchLeaves()` whenever `page` or `limit` is updated.
- **Lines 78-122 (handleSubmit Handler)**:
  - **Basic Function**: Submit a leave application.
  - **Detailed Explanation**: Blocks page reloading using `e.preventDefault()`. Validates that `startDate` is not after `endDate`. Validates that the trimmed reason length is at least 5 characters. Sets `submitLoading` true. Sends a POST request to `/leaves/apply` with the leave type, formatted ISO dates, and trimmed reason. On success, resets form inputs, closes the modal, and resets page pagination back to page 1 to show the new request.
- **Lines 124-374 (JSX Rendering Section)**:
  - **Basic Function**: Outputs the user interface page.
  - **Detailed Explanation**:
    - Lines 128-145: Banner header containing description and the "Apply for Leave" modal open trigger button.
    - Lines 147-159: Error or success inline notification banners.
    - Lines 162-198: Metrics grid cards displaying counts of pending, approved, and rejected leave requests.
    - Lines 201-281: Leaves log table mapping details of requests (leave type, start/end dates, reason, status badge, and admin remarks notes). Hooks up the `Pagination` component in the footer.
    - Lines 284-370: Application Modal dialog overlay. Displays form elements: dropdown picker for leave type, input dates, text area reason input, and Cancel/Submit buttons.
