# frontend/src/features/attendance/EmployeeAttendance.jsx

## 1. Overview
`frontend/src/features/attendance/EmployeeAttendance.jsx` implements the interface for normal employees to clock-in/out and monitor their personal shift logs.

## 2. Key Responsibilities & Flow
- **Shift Logging Controls**:
  - Displays the current day's shift status (e.g. Not Clocked In, Active Shift, or Shift Completed).
  - Triggers a POST request to `/attendance/clock-in` when the user clicks "Clock In".
  - Triggers a PUT request to `/attendance/clock-out` when the user clicks "Clock Out".
- **History View**: Loads the employee's personal history log from `/attendance/history`, showing check-in/out times, calculated working hours, and daily compliance status (e.g. `present`, `half-day`, `leave`, `absent`).
- **State Synchronization**: Automatically checks for today's logs inside the history list on initial load to restore the clocking button states.

## 3. Code Patterns & Best Practices
- **Date Matching Verification**: Uses `.toDateString()` inside `fetchAttendance` to extract and match today's date, updating the clock button states without needing separate status endpoints.
- **Button Feedback Guard**: Disables buttons (`disabled={actionLoading}`) and displays loading spinners while API requests are pending to prevent duplicate submissions.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- **Endpoints mapping**:
  - `POST /api/attendance/clock-in` -> Called by `handleClockIn` to initialize the daily attendance document.
  - `PUT /api/attendance/clock-out` -> Called by `handleClockOut` to close the daily shift and compute hours worked.
  - `GET /api/attendance/history` -> Called by `fetchAttendance` to load and display historical logs.
- Matches with the backend `Attendance` model schema and the `attendanceController.js` controller.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports & Setup (Lines 1-8)**: Resolves React state, Redux hooks, the API interceptors utility, Pagination component, and icons from `lucide-react`.
2. **State Declaration (Lines 11-26)**: Defines variables for user profile, history log, loading states, success/error notifications, today's attendance record, and pagination page/limit states.
3. **fetchAttendance Function (Lines 28-62)**: Queries the backend API `/attendance/history` to load the current user's history and updates states. Restores today's status on the first page load.
4. **useEffect Hook (Lines 64-66)**: Triggers the attendance history fetching routine automatically whenever `page` or `limit` is updated.
5. **handleClockIn Function (Lines 68-87)**: Calls the POST endpoint `/attendance/clock-in` to start a work shift. Refreshes the display upon completion.
6. **handleClockOut Function (Lines 89-108)**: Calls the PUT endpoint `/attendance/clock-out` to finalize a work shift. Refreshes the display upon completion.
7. **JSX Presentation Rendering (Lines 110-324)**: Renders the layout, showing the daily shift status, clock buttons, details list, warning alerts, history tables, and paginator settings.

- **Lines 1-8 (Imports)**:
  - **Basic Function**: Import external React features, store dependencies, custom API client, and icons.
  - **Detailed Explanation**: Imports `useState` and `useEffect` for handling local react hook logic, `useSelector` to query Redux slices, `api` client for Axios interceptor setups, `Pagination` for page navigation blocks, and several icons from `lucide-react` for graphics.
  - **Key Function Calls**: None.
- **Lines 10 (Component Declaration)**:
  - **Basic Function**: Define the `EmployeeAttendance` page component function.
  - **Detailed Explanation**: Export a default function `EmployeeAttendance` to contain internal component hook functions and render structures.
  - **Key Function Calls**: None.
- **Lines 11-26 (Hook setups)**:
  - **Basic Function**: Initialize hook properties, state buffers, and paginators.
  - **Detailed Explanation**: Uses `useSelector` to query the authenticated `user` payload from Redux. Uses `useState` hooks to manage `history` records, `loading` indicator state, `actionLoading` button protection state, `error` messaging, `successMessage` alerts, and `todayRecord` to cache today's shift log object. `page` and `limit` manage pagination counters.
  - **Key Function Calls**:
    - `useSelector((state) => state.auth)`: Accesses the Redux store's state to retrieve the currently authenticated `user` object from the `auth` slice.
    - `useState(initialState)`: Registers new state variables in the React component lifecycle:
      - `useState([])` for the `history` log array.
      - `useState(true)` for the initial component `loading` status.
      - `useState(false)` for the `actionLoading` flag during API mutations.
      - `useState(null)` for the `error` state.
      - `useState(null)` for the `successMessage` state.
      - `useState(null)` for the current day's logged shift (`todayRecord`).
      - `useState(1)` for the active page tracker (`page`).
      - `useState(10)` for the max results count per page (`limit`).
      - `useState({ total: 0, totalPages: 1, hasNext: false, hasPrev: false })` for tracking the server-provided pagination details.
- **Lines 28-62 (fetchAttendance definition)**:
  - **Basic Function**: Fetch personal attendance logs from the server.
  - **Detailed Explanation**: Sets `loading` true and resets errors. Sends a `GET` request to `/attendance/history` with `page` and `limit` query parameters. If successful, maps data list to `history` and updates `paginationInfo`. On page 1, searches `data` for any entry matching today's calendar date (`toDateString()`), assigning it to `todayRecord` to restore active clock button layouts. Sets `loading` false.
  - **Key Function Calls**:
    - `setLoading(true)`: Sets the `loading` state to `true` to prompt the loading screen.
    - `setError(null)`: Clears any pre-existing error messages before executing the call.
    - `api.get(url, config)`: Triggers an asynchronous GET request to the `/attendance/history` endpoint with the `page` and `limit` values wrapped in params. Returns a Promise resolving to the axios response object.
    - `setHistory(data)`: Updates the `history` array state with the retrieved history items list.
    - `setPaginationInfo(pagination)`: Updates the component pagination state with structural information metadata returned by the endpoint.
    - `new Date()`: Instantiates a new Date object representing the current date and time.
    - `toDateString()`: Extracts the simple date component (e.g. "Thu May 21 2026") from a Date instance, ignoring timestamps, to facilitate date equality check.
    - `data.find(callback)`: Executes a search on the retrieved list of history items to locate a record matching today's date.
    - `new Date(rec.date)`: Deserializes the record's date string into a standard Date object.
    - `setTodayRecord(todayRec)`: Caches today's matching attendance record in state.
    - `setError(message)`: Catches errors and updates the `error` state with the failure response message or a fallback string.
    - `setLoading(false)`: Disables the loading overlay once the asynchronous operations conclude.
- **Lines 64-66 (useEffect Hook)**:
  - **Basic Function**: Reload history on paginator update.
  - **Detailed Explanation**: Monitors changes in `page` or `limit` states and triggers `fetchAttendance()` to synchronize the view.
  - **Key Function Calls**:
    - `useEffect(callback, dependencies)`: Schedules the asynchronous fetching routine `fetchAttendance` to run whenever the component mounts or the pagination properties `page` or `limit` change.
    - `fetchAttendance()`: Initiates the backend sync method for the attendance log array.
- **Lines 68-87 (handleClockIn Handler)**:
  - **Basic Function**: Begin daily work shift.
  - **Detailed Explanation**: Sets `actionLoading` true and resets messages. Executes a `POST` request to `/attendance/clock-in` endpoint. On success, prints a success alert and either refreshes the history list if on page 1, or redirects the user to page 1 to see the new record.
  - **Key Function Calls**:
    - `setActionLoading(true)`: Restricts interactive elements and shows spinner feedback.
    - `setError(null)`: Clears previous validation or query errors.
    - `setSuccessMessage(null)`: Clears previous success feedback notifications.
    - `api.post(url)`: Submits a POST request to `/attendance/clock-in` to insert a new shift entry. Returns a Promise resolving to the API response.
    - `setSuccessMessage(message)`: Sets state to display the successful clock-in alert.
    - `fetchAttendance()`: Invokes the history retrieval function if already on page 1.
    - `setPage(1)`: Resets page number to 1 to force a list refresh and display the new record at the top.
    - `setError(message)`: Caches API rejection message for user display.
    - `setActionLoading(false)`: Releases input lock and hides button loaders.
- **Lines 89-108 (handleClockOut Handler)**:
  - **Basic Function**: Complete daily work shift.
  - **Detailed Explanation**: Sets `actionLoading` and resets notifications. Calls the `PUT` endpoint `/attendance/clock-out`. On success, updates messages and refreshes history page data.
  - **Key Function Calls**:
    - `setActionLoading(true)`: Restricts interactive controls and triggers button loading feedback.
    - `setError(null)`: Resets error flags.
    - `setSuccessMessage(null)`: Clears current success banner text.
    - `api.put(url)`: Dispatches a PUT request to `/attendance/clock-out` to update checkout times and calculate shift lengths. Returns a Promise resolving to the API response.
    - `setSuccessMessage(message)`: Sets the state to display the successful clock-out alert.
    - `fetchAttendance()`: Triggers log refresh if page is 1.
    - `setPage(1)`: Resets page index to 1.
    - `setError(message)`: Caches errors for visual alert output.
    - `setActionLoading(false)`: Resolves action loading state.
- **Lines 110-324 (JSX Render Section)**:
  - **Basic Function**: Renders the complete HTML template page structure.
  - **Detailed Explanation**:
    - Lines 111-123: Page banner header.
    - Lines 126-196: Daily shift status panel. Computes today's attendance state: shows checkmark if `checkOutTime` is logged, shows pulse indicator if `checkInTime` is logged without checkout, or shows inactive clock if not logged. Displays buttons dynamically ("Clock In", "Clock Out", or "Logged").
    - Lines 198-225: Today's details grid (date, status, clock-in, and clock-out timestamps) and warning guidelines.
    - Lines 228-240: Error or success feedback banners.
    - Lines 242-321: Attendance history log table (date, check-in, check-out, working hours, and status badge with custom color themes). Hooks up the `Pagination` component in the footer.
  - **Key Function Calls**:
    - `new Date(todayRecord.checkInTime).toLocaleTimeString(locales, options)`: Formats the active clock-in time to localized time string (hour/minute).
    - `new Date().toLocaleDateString(locales, options)`: Generates a human-friendly format of today's date for display.
    - `new Date(todayRecord.checkInTime).toLocaleTimeString()`: Formats today's clock-in time into local presentation.
    - `new Date(todayRecord.checkOutTime).toLocaleTimeString()`: Formats today's clock-out time into local presentation.
    - `history.map(callback)`: Iterates over history list to render rows in the log table.
    - `new Date(record.date).toLocaleDateString(locales, options)`: Converts each record's date string to user locale date layout.
    - `new Date(record.checkInTime).toLocaleTimeString(locales, options)`: Converts record check-in timestamp to local representation.
    - `new Date(record.checkOutTime).toLocaleTimeString(locales, options)`: Converts record check-out timestamp to local representation.
    - `setPage(newPage)`: Updates `page` state inside `onPageChange` pagination callback.
    - `setLimit(newLimit)`: Updates `limit` state inside `onLimitChange` pagination callback.
