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
- **Lines 6 (Component Declaration)**:
  - **Basic Function**: Define the `OwnerLeaves` component.
  - **Detailed Explanation**: Instantiates default function `OwnerLeaves` which encapsulates internal state definitions and rendering returns.
- **Lines 7-20 (Basic State & Pagination)**:
  - **Basic Function**: Maintain list data, active filters, loading statuses, and pagination indexes.
  - **Detailed Explanation**: `leaves` holds fetched leave records. `targetUserId` holds the filtered employee's database ID. `loading` tracks table search tasks. `actionPending` contains the leave ID currently processing. `error` records network feedback. `page` and `limit` track pagination numbers. `paginationInfo` maps navigation items.
- **Lines 23-26 (Modal states)**:
  - **Basic Function**: Manage remarks modal view properties.
  - **Detailed Explanation**: `isModalOpen` toggles the dialog viewport overlay. `selectedLeave` captures the active leave ID to update. `actionType` is either 'approved' or 'rejected'. `remarks` records input text.
- **Lines 29-33 (Search states)**:
  - **Basic Function**: Manage autocomplete lookup inputs.
  - **Detailed Explanation**: `searchQuery` tracks the search filter string. `searchResults` maps suggested matching users list. `selectedUserObj` tracks selected user object. `showDropdown` toggles suggestions. `searchLoading` indicates progress.
- **Lines 35-62 (fetchLeaves Function)**:
  - **Basic Function**: Pull leave history from the backend database.
  - **Detailed Explanation**: Sets `loading` true. Sends a GET request to `/leaves/history` passing pagination parameters and `targetUserId` filter properties. Assigns result list to `leaves` and updates the paginator controls. Catches rejections using `setError`.
- **Lines 64-66 (useEffect Hook)**:
  - **Basic Function**: Sync feed upon filter changes.
  - **Detailed Explanation**: Fires `fetchLeaves()` automatically when `targetUserId`, `page`, or `limit` is updated.
- **Lines 69-101 (Search Autocomplete useEffect)**:
  - **Basic Function**: Query employee name searches.
  - **Detailed Explanation**: Resets dropdown suggestions if the query contains less than 2 characters or matches the selected user. Uses `setTimeout` of 300ms to debounce inputs. If the timer resolves, queries `GET /users/all` with the search query, updates `searchResults`, and opens the suggestions dropdown list.
- **Lines 103-109 (handleSelectUser Handler)**:
  - **Basic Function**: Apply selected employee filter parameters.
  - **Detailed Explanation**: Assigns employee ID to `targetUserId`, caches the object in `selectedUserObj`, sets the search input query text to the employee info, and resets pagination indexes.
- **Lines 111-118 (handleClearSearch Handler)**:
  - **Basic Function**: Reset employee query filters.
  - **Detailed Explanation**: Clears query strings, resets `targetUserId` and `selectedUserObj` to empty, and redirects pagination back to page 1.
- **Lines 120-133 (handleSearchChange Handler)**:
  - **Basic Function**: Update search text inputs.
  - **Detailed Explanation**: Tracks text changes. Resets current target filters if the text gets cleared or changes from the selected employee name.
- **Lines 135-140 (updateLeave Handler)**:
  - **Basic Function**: Launch remarks dialog.
  - **Detailed Explanation**: Attaches leave ID and decision status ('approved' or 'rejected'), clears previous remarks, and opens the modal.
- **Lines 142-156 (handleConfirmAction Handler)**:
  - **Basic Function**: Submit approval/rejection updates.
  - **Detailed Explanation**: Sets `actionPending` indicator to block duplicates. Dispatches a `PUT` request to `/leaves/${selectedLeave}/status` containing target `status` and `remarks`. On success, refetches active lists, closes dialog overlay, and resets modal buffer states.
- **Lines 158-163 (handleCancelAction Handler)**:
  - **Basic Function**: Close remarks modal.
  - **Detailed Explanation**: Resets modal states and closes views.
- **Lines 165-385 (JSX Layout Render)**:
  - **Basic Function**: Renders the complete leave approval page.
  - **Detailed Explanation**:
    - Lines 167-177: Page header displaying title and info badges.
    - Lines 180-237: Filter container. Renders search box, suggestions dropdown, and search clear triggers.
    - Lines 239-326: Requests table. Outputs loaders, empty indicators, or a database record grid mapping employee details, leave type, dates, reason, status badge, remarks notes, and Approve/Reject action buttons.
    - Lines 327-340: Integrates `Pagination` controls.
    - Lines 343-382: Modal overlay screen. Renders remarks text area and action Confirm/Cancel buttons.
