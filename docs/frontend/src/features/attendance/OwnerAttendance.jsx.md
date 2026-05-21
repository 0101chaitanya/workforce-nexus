# frontend/src/features/attendance/OwnerAttendance.jsx

## 1. Overview
`frontend/src/features/attendance/OwnerAttendance.jsx` provides the administrative interface for workspace owners to view company-wide attendance records, filter entries by individual employees, and browse history.

## 2. Key Responsibilities & Flow
- **Data Retrieval**: On component load, requests paginated attendance logs from the backend via the `/attendance/history` route.
- **Dynamic Employee Filter (Autocomplete)**:
  - Users can search for employees by typing their name, email, or employee ID.
  - A debounced (300ms) effect queries the backend `/users/all` endpoint.
  - Selecting an employee filters the logs by their user ID (`targetUserId`).
- **Interactive Tables**: Lists matching attendance records in a tabular format showing Employee ID, Name, Date, Check-in/Check-out times, and Status details.
- **Pagination**: Integrates the `<Pagination />` component to handle pagination state (`page` and `limit`) for large datasets.

## 3. Code Patterns & Best Practices
- **Autocomplete Debouncing**: Uses a `setTimeout` cleanup function inside `useEffect` to debounce input searches, reducing unnecessary API calls to the server.
- **Responsive Layouts**: Wraps the data table in a scrollable horizontal container (`overflow-x-auto`) to ensure readability on smaller screens.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- **Endpoints mapping**:
  - `GET /api/attendance/history` -> Queried by `fetchAttendance` with parameters: `{ targetUserId, page, limit }`.
  - `GET /api/users/all` -> Queried by the search effect to fetch employee matches based on query strings.
- **Validation**: Requires matching query validation schemas on the backend router: `ownerSchemas.historyQuery` and `userSchemas.userQuery`.

---

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports & Setup (Lines 1-4)**: Resolves React state/lifecycle hooks, custom API client, Pagination component, and Lucide react icons.
2. **Component & State Variables (Lines 6-25)**: Defines target states for attendance records, request states, errors, pagination attributes, search queries, search suggestions, and filtered employee identifiers.
3. **Data Fetching Routine (Lines 27-58)**: Issues GET queries to fetch paginated logs from the `/attendance/history` route, updating the state or showing errors, and runs automatically via `useEffect`.
4. **Autocomplete Search Management (Lines 61-125)**: Implements debouncing (300ms) to lookup matching employees under `/users/all`, and defines handlers to select, clear, or modify the query string.
5. **Interactive UI View (Lines 128-272)**: Handles rendering of the layout header, look-up search box, data tables showing record logs, loading/error flags, and the Pagination controls component.

- **Lines 1-4 (Imports)**:
  - **Basic Function**: Imports React hooks, axios instance, Pagination component, and Lucide icons.
  - **Detailed Explanation**: Imports `React`, `useEffect`, and `useState` hooks. Imports custom axios client instance `api`. Imports the reusable `Pagination` component. Imports icons `Loader2`, `CalendarCheck`, `Search`, and `X` from `lucide-react`.
- **Lines 6-25 (Component & Local States)**:
  - **Basic Function**: Component instantiation and state definitions.
  - **Detailed Explanation**: Defines the `OwnerAttendance` component. Declares states for logs (`attendance`), request indicator (`loading`), errors (`error`), pagination variables (`page`, `limit`, `paginationInfo`), search query input (`searchQuery`), search outcomes (`searchResults`), filtered employee id (`targetUserId`), selected employee details (`selectedUserObj`), autocomplete display (`showDropdown`), and autocomplete request state (`searchLoading`).
- **Lines 27-54 (fetchAttendance)**:
  - **Basic Function**: Fetches paginated attendance logs from the backend.
  - **Detailed Explanation**: Sets `loading` to `true` and clears `error`. Performs a `GET` request to `/attendance/history`, sending parameters `targetUserId`, `page`, and `limit`. Updates the local `attendance` and `paginationInfo` state on success, or sets `error` message on catch, resetting `loading` in the `finally` block.
- **Lines 56-58 (useEffect for Fetch)**:
  - **Basic Function**: Reacts to pagination and filters.
  - **Detailed Explanation**: Re-triggers `fetchAttendance` automatically whenever `targetUserId`, `page`, or `limit` states update.
- **Lines 61-93 (useEffect for User Search)**:
  - **Basic Function**: Performs debounced autocomplete query for employee lookups.
  - **Detailed Explanation**: Validates search length (>= 2 characters). Skips searches if the query matches the already selected user details. Uses a debounced `setTimeout` (300ms delay) to query `GET /users/all` with the search query. Updates search outcomes, toggles the dropdown view, and returns a cleanup callback to clear the timer.
- **Lines 95-101 (handleSelectUser)**:
  - **Basic Function**: Handles selecting an employee from the dropdown.
  - **Detailed Explanation**: Sets the filter user ID (`targetUserId`), saves the selected user object, updates the text input box, hides the dropdown, and resets `page` back to 1.
- **Lines 103-110 (handleClearSearch)**:
  - **Basic Function**: Resets all lookup search attributes.
  - **Detailed Explanation**: Clears search inputs, drops target filters, closes search result dropdowns, and resets page index back to 1 to refresh the full company log.
- **Lines 112-125 (handleSearchChange)**:
  - **Basic Function**: Handles changes to the lookup input text.
  - **Detailed Explanation**: Updates `searchQuery`. If the input is empty, triggers `handleClearSearch()`. If the user types a new value distinct from the currently selected user profile, resets target filtering selectors.
- **Lines 128-269 (Component UI Render)**:
  - **Basic Function**: Renders the management header, lookup autocomplete box, status feedback elements, table data, and pagination footer.
  - **Detailed Explanation**:
    - Lines 129-136: Renders outer page information headers.
    - Lines 140-193: Renders lookup input section with search icon, clear button, and absolute autocomplete matching results dropdown cards.
    - Lines 195-209: Renders conditional views (loader, error blocks, empty log notices).
    - Lines 211-248: Renders the attendance data table mapping rows to details like Employee ID, Name, Date, Check-in/out logs, Hours, and Status.
    - Lines 251-263: Renders the reusable pagination footer passing pagination details and page update callbacks.

