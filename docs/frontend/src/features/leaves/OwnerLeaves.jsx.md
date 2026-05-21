# frontend/src/features/leaves/OwnerLeaves.jsx

## 1. Overview
`frontend/src/features/leaves/OwnerLeaves.jsx` implements the administrative dashboard for managing employee leave requests, allowing owners to view, filter, approve, or reject leave submissions.

## 2. Key Responsibilities & Flow
- **Request Feeds**: Retrieves company-wide leave records from the `/leaves/history` endpoint, supporting filter parameters and pagination controls.
- **Search Auto-complete**:
  - Debounces employee search queries (300ms delay) to fetch matching accounts from `/users/all`.
  - Selecting an employee filters the active leave request feed to show only their submissions.
- **Approval Actions (Modal Remarks Dialog)**:
  - Clicking "Approve" or "Reject" opens a confirmation dialog.
  - The owner can enter optional remarks before submitting their decision.
  - Submits a PUT request to `/leaves/:leaveId/status` with the new status and remarks, then refreshes the feed.

## 3. Code Patterns & Best Practices
- **Remarks Modal Confirmation**: Requires owners to confirm approval or rejection decisions via a modal dialog, preventing accidental status updates while allowing them to write context-specific remarks.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- **Endpoints mapping**:
  - `GET /api/leaves/history` -> Called by `fetchLeaves` with optional filters (`targetUserId`, `page`, `limit`).
  - `PUT /api/leaves/:leaveId/status` -> Called by `handleConfirmAction` to approve or reject a leave request.
  - `GET /api/users/all` -> Queries matching employee details during filtering.
- **Validation**: Enforces request schema formats matching backend Zod rules: `leaveSchemas.statusUpdate` and `ownerSchemas.historyQuery`.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports & Setup (Lines 1-4)**: Resolves React state/lifecycle components, custom API client wrapper, Pagination component, and UI icons from `lucide-react`.
2. **State Setup (Lines 6-33)**: Configures states for leaves records list, filter employee parameters, loader status, action loading status, error notifications, pagination parameters, approval modals, and lookup searches.
3. **fetchLeaves Function (Lines 35-62)**: Queries `/leaves/history` sending pagination parameters and `targetUserId` filters to fetch leave requests list.
4. **Target filter & Initial Load useEffect (Lines 64-66)**: Subscribes to `targetUserId`, `page`, and `limit` to re-query the API.
5. **Lookup Autocomplete useEffect (Lines 69-101)**: Debounces search input (300ms window) and queries `/users/all` suggestions.
6. **Autocomplete Search Helpers (Lines 103-133)**: Coordinates user clicks and searches (`handleSelectUser`, `handleClearSearch`, `handleSearchChange`).
7. **Leave Update Decision Controls (Lines 135-163)**: Triggers approval/rejection dialogs (`updateLeave`), updates leave status records (`handleConfirmAction`), and cancels modals (`handleCancelAction`).
8. **Main Presentation UI (Lines 165-385)**: Renders leave details headers, search lookup inputs, records list tables, pagination controls, and modal dialog overlays.

- **Lines 1-4 (Imports)**:
  - **Basic Function**: Import libraries, custom elements, and styling icons.
  - **Detailed Explanation**: Imports React hooks, the authenticated `api` module, the `Pagination` layout, and several user interface layout icons from `lucide-react`.
  - **Key Function Calls**: None.
- **Lines 6 (Component Declaration)**:
  - **Basic Function**: Define the `OwnerLeaves` component.
  - **Detailed Explanation**: Instantiates default function `OwnerLeaves` which encapsulates internal state definitions and rendering returns.
  - **Key Function Calls**: None.
- **Lines 7-20 (Basic State & Pagination)**:
  - **Basic Function**: Maintain list data, active filters, loading statuses, and pagination indexes.
  - **Detailed Explanation**: `leaves` holds fetched leave records. `targetUserId` holds the filtered employee's database ID. `loading` tracks table search tasks. `actionPending` contains the leave ID currently processing. `error` records network feedback. `page` and `limit` track pagination numbers. `paginationInfo` maps navigation items.
  - **Key Function Calls**:
    - `useState(initialState)`: Registers new state variables in the React component lifecycle:
      - `useState([])` for the retrieved leave records list (`leaves`).
      - `useState('')` for the filtered employee database ID (`targetUserId`).
      - `useState(true)` for the search table loading status.
      - `useState(null)` for the ID of the leave request currently undergoing state mutations (`actionPending`).
      - `useState(null)` for the network query validation errors (`error`).
      - `useState(1)` for tracking the current page index (`page`).
      - `useState(10)` for tracking the max table results count per page (`limit`).
      - `useState({ total: 0, totalPages: 1, hasNext: false, hasPrev: false })` for pagination metadata structure (`paginationInfo`).
- **Lines 23-26 (Modal states)**:
  - **Basic Function**: Manage remarks modal view properties.
  - **Detailed Explanation**: `isModalOpen` toggles the dialog viewport overlay. `selectedLeave` captures the active leave ID to update. `actionType` is either 'approved' or 'rejected'. `remarks` records input text.
  - **Key Function Calls**:
    - `useState(initialState)`: Registers state hooks for:
      - `useState(false)` for modal display flag (`isModalOpen`).
      - `useState(null)` for targeted leave record (`selectedLeave`).
      - `useState(null)` for active mutation type ('approved' or 'rejected') (`actionType`).
      - `useState('')` for user-supplied remarks input buffer (`remarks`).
- **Lines 29-33 (Search states)**:
  - **Basic Function**: Manage autocomplete lookup inputs.
  - **Detailed Explanation**: `searchQuery` tracks the search filter string. `searchResults` maps suggested matching users list. `selectedUserObj` tracks selected user object. `showDropdown` toggles suggestions. `searchLoading` indicates progress.
  - **Key Function Calls**:
    - `useState(initialState)`: Registers state hooks for:
      - `useState('')` for search input text (`searchQuery`).
      - `useState([])` for autocomplete employee records array (`searchResults`).
      - `useState(null)` for active filter employee profile (`selectedUserObj`).
      - `useState(false)` for matching dropdown visibility state (`showDropdown`).
      - `useState(false)` for suggestions fetching loading indicator (`searchLoading`).
- **Lines 35-62 (fetchLeaves Function)**:
  - **Basic Function**: Pull leave history from the backend database.
  - **Detailed Explanation**: Sets `loading` true. Sends a GET request to `/leaves/history` passing pagination parameters and `targetUserId` filter properties. Assigns result list to `leaves` and updates the paginator controls. Catches rejections using `setError`.
  - **Key Function Calls**:
    - `setLoading(true)`: Sets loading state to true.
    - `setError(null)`: Clears error outputs.
    - `api.get(url, config)`: Dispatches GET request to `/leaves/history` with pagination options and user filtering. Returns a Promise.
    - `setLeaves(list)`: Caches leaf records list.
    - `setPaginationInfo(pagination)`: Configures pagination page settings.
    - `setError(message)`: Registers request failures to state.
    - `setLoading(false)`: Disables the loading layout.
- **Lines 64-66 (useEffect Hook)**:
  - **Basic Function**: Sync feed upon filter changes.
  - **Detailed Explanation**: Fires `fetchLeaves()` automatically when `targetUserId`, `page`, or `limit` is updated.
  - **Key Function Calls**:
    - `useEffect(callback, dependencies)`: Schedules the leaves fetch sequence to run when dependencies change.
    - `fetchLeaves()`: Initiates sync request.
- **Lines 69-101 (Search Autocomplete useEffect)**:
  - **Basic Function**: Query employee name searches.
  - **Detailed Explanation**: Resets dropdown suggestions if the query contains less than 2 characters or matches the selected user. Uses `setTimeout` of 300ms to debounce inputs. If the timer resolves, queries `GET /users/all` with the search query, updates `searchResults`, and opens the suggestions dropdown list.
  - **Key Function Calls**:
    - `useEffect(callback, dependencies)`: Schedules autocomplete search fetch on input query mutations.
    - `searchQuery.trim()`: Trims white spaces from user input query.
    - `setSearchResults([])`: Resets results array when query is too short.
    - `setShowDropdown(false)`: Disables dropdown display.
    - `setTimeout(callback, delay)`: Implements 300ms query delay to prevent over-querying. Returns a timer ID.
    - `setSearchLoading(true)`: Displays loading indicator.
    - `api.get(url, config)`: Dispatches GET request to `/users/all` with the search query as parameter. Returns a Promise.
    - `setSearchResults(list)`: Caches search results list.
    - `setShowDropdown(true)`: Opens selection dropdown.
    - `console.error(err)`: Outputs connection errors in debug terminal.
    - `setSearchLoading(false)`: Disables loading indicator.
    - `clearTimeout(timer)`: Clears the scheduled timeout to debounce inputs properly when query changes within the 300ms window.
- **Lines 103-109 (handleSelectUser Handler)**:
  - **Basic Function**: Apply selected employee filter parameters.
  - **Detailed Explanation**: Assigns employee ID to `targetUserId`, caches the object in `selectedUserObj`, sets the search input query text to the employee info, and resets pagination indexes.
  - **Key Function Calls**:
    - `setTargetUserId(id)`: Registers filtering employee target ID.
    - `setSelectedUserObj(user)`: Caches active employee details in state.
    - `setSearchQuery(text)`: Overwrites input with selection description.
    - `setShowDropdown(false)`: Closes suggestion panel.
    - `setPage(1)`: Shifts lists to first page.
- **Lines 111-118 (handleClearSearch Handler)**:
  - **Basic Function**: Reset employee query filters.
  - **Detailed Explanation**: Clears query strings, resets `targetUserId` and `selectedUserObj` to empty, and redirects pagination back to page 1.
  - **Key Function Calls**:
    - `setSearchQuery('')`: Clears search field text.
    - `setTargetUserId('')`: Clears active filters.
    - `setSelectedUserObj(null)`: Discards filtered user records from cache.
    - `setSearchResults([])`: Clears search results list.
    - `setShowDropdown(false)`: Closes suggestions overlay.
    - `setPage(1)`: Forces table to page 1.
- **Lines 120-133 (handleSearchChange Handler)**:
  - **Basic Function**: Update search text inputs.
  - **Detailed Explanation**: Tracks text changes. Resets current target filters if the text gets cleared or changes from the selected employee name.
  - **Key Function Calls**:
    - `setSearchQuery(val)`: Updates input text state.
    - `handleClearSearch()`: Clears employee filter state if query text becomes empty.
    - `setTargetUserId('')`: Clears filtered user ID if text deviates from selection.
    - `setSelectedUserObj(null)`: Resets filtered user details.
- **Lines 135-140 (updateLeave Handler)**:
  - **Basic Function**: Launch remarks dialog.
  - **Detailed Explanation**: Attaches leave ID and decision status ('approved' or 'rejected'), clears previous remarks, and opens the modal.
  - **Key Function Calls**:
    - `setSelectedLeave(id)`: Registers targeted leave ID.
    - `setActionType(status)`: Registers mutation action status.
    - `setRemarks('')`: Clears remarks buffer.
    - `setIsModalOpen(true)`: Sets state to display modal overlay.
- **Lines 142-156 (handleConfirmAction Handler)**:
  - **Basic Function**: Submit approval/rejection updates.
  - **Detailed Explanation**: Sets `actionPending` indicator to block duplicates. Dispatches a `PUT` request to `/leaves/${selectedLeave}/status` containing target `status` and `remarks`. On success, refetches active lists, closes dialog overlay, and resets modal buffer states.
  - **Key Function Calls**:
    - `setActionPending(id)`: Locks user actions.
    - `api.put(url, data)`: Dispatches PUT request updating leave status and remarks. Returns a Promise.
    - `fetchLeaves()`: Triggers details sync request.
    - `setIsModalOpen(false)`: Closes input overlay.
    - `setSelectedLeave(null)`: Resets target ID.
    - `setActionType(null)`: Clears active action flag.
    - `setRemarks('')`: Resets remarks state.
    - `setError(message)`: Outputs update validation rejections.
    - `setActionPending(null)`: Unlocks action triggers.
- **Lines 158-163 (handleCancelAction Handler)**:
  - **Basic Function**: Close remarks modal.
  - **Detailed Explanation**: Resets modal states and closes views.
  - **Key Function Calls**:
    - `setIsModalOpen(false)`: Closes overlay modal.
    - `setSelectedLeave(null)`: Resets target ID.
    - `setActionType(null)`: Resets status type.
    - `setRemarks('')`: Clears modal inputs buffer.
- **Lines 165-385 (JSX Layout Render)**:
  - **Basic Function**: Renders the complete leave approval page.
  - **Detailed Explanation**:
    - Lines 167-177: Page header displaying title and info badges.
    - Lines 180-237: Filter container. Renders search box, suggestions dropdown, and search clear triggers.
    - Lines 239-326: Requests table. Outputs loaders, empty indicators, or a database record grid mapping employee details, leave type, dates, reason, status badge, remarks notes, and Approve/Reject action buttons.
    - Lines 327-340: Integrates `Pagination` controls.
    - Lines 343-382: Modal overlay screen. Renders remarks text area and action Confirm/Cancel buttons.
  - **Key Function Calls**:
    - `handleSearchChange(value)`: Triggers changes in lookup inputs.
    - `handleClearSearch()`: Dispatches search input clearing.
    - `searchResults.map(callback)`: Renders autocomplete selections.
    - `handleSelectUser(user)`: Selects target employee suggestion.
    - `leaves.map(callback)`: Renders leave entries in table.
    - `new Date(leave.startDate).toLocaleDateString()`: Converts startDate timestamp string to local representation.
    - `new Date(leave.endDate).toLocaleDateString()`: Converts endDate timestamp string to local representation.
    - `updateLeave(id, 'approved')`: Dispatches approval popup sequences.
    - `updateLeave(id, 'rejected')`: Dispatches rejection popup sequences.
    - `setPage(newPage)`: Updates current page inside pagination `onPageChange` callback.
    - `setLimit(newLimit)`: Updates current limit inside pagination `onLimitChange` callback.
    - `setRemarks(value)`: Updates active comments in textarea block.
    - `handleCancelAction()`: Closes modal on button click.
    - `handleConfirmAction()`: Confirms mutation action on button click.
