# Story: Owner Leave Approval (`/owner/leaves`)

This document explains the end-to-end flow of the Owner Leave Approval screen, which allows business owners to review leave requests from employees, search for a specific employee's leaves, and approve or reject applications with reviewer feedback remarks.

---

## 1. User Story & Narrative

> **As an** Organization Owner,  
> **I want** to browse all submitted leave applications, search leaves by employee, and approve or reject pending leave requests with reviewer remarks,  
> **So that** I can manage employee absences, track available staff sizes, and compile attendance records for monthly salary audits.

### The Journey:
1. **Navigating to Leave Approvals**: The Owner clicks the **Leaves** tab. The UI retrieves cached data from Redux if filters and page numbers align with previous fetches. Otherwise, it presents a loading indicator and calls the server to obtain leave records and approval statistics.
2. **Reviewing Statistics**: At the top of the grid or lists, the Owner sees three quick counts:
   - **Pending Requests**
   - **Approved Requests**
   - **Rejected Requests**
3. **Filtering by Employee**:
   - The Owner types an employee's name or ID into the lookup box.
   - An autocomplete query hits `/api/users/search-users-or-get-all?query=...` with a 300ms debounce.
   - Selecting a worker sets the active `targetUserId` filter, resets pagination to page 1, and fetches leave history for that employee only.
4. **Processing a Request (Approve/Reject)**:
   - The Owner clicks the checkmark icon (**Approve**) or cross icon (**Reject**) on a pending leave entry.
   - A review modal pops up. The Owner types optional remarks (feedback notes explaining the decision) and clicks **Confirm**.
   - The frontend validates input using Zod schemas, hits the server endpoint `PUT /api/leaves/:leaveId/status`, and triggers a forced refresh (cache bypass) to fetch the updated lists and update statistics cards.

---

## 2. Frontend Design & State Flow

### View Component:
- **File**: `frontend/src/features/leaves/OwnerLeaves.jsx`

### Redux State Integration:
- **Slice**: `frontend/src/features/leaves/leavesSlice.js` (State Namespace: `state.leaves.owner`)
- **State Properties**:
  - `leaves`: List of leave requests.
  - `targetUserId`: Active filter for employee-specific requests.
  - `loading`: Main history fetch spinner.
  - `actionPending`: Matches the ID of the leaf request currently being approved/rejected to show a micro-spinner on its buttons.
  - `page` / `limit`: Pagination parameters.
  - `paginationInfo`: Total counts and pagination navigation guides.
  - `searchQuery` / `searchResults` / `showDropdown` / `searchLoading`: Autocomplete elements for the employee lookup filter.
  - `selectedUserObj`: Active selected user profile object.
  - `isCached`: Cache state indicator.
  - `cachedParams`: Stores parameters of the cached list: `page`, `limit`, and `targetUserId`.

### Caching Check:
- Inside `fetchLeaves(force)`:
  ```javascript
  if (!force && isCached && cachedParams &&
      cachedParams.page === page &&
      cachedParams.limit === limit &&
      cachedParams.targetUserId === targetUserId) {
    return; // Retrieve from store, bypass API
  }
  ```
- Submitting the review triggers a forced refresh `fetchLeaves(true)` which invalidates cached lists and updates statistics globally.

---

## 3. Backend Integration & Logic

### Endpoints:
1. `GET /api/leaves/history` (Retrieve leave lists and aggregate counts)
2. `PUT /api/leaves/:leaveId/status` (Submit approval or rejection with remarks)

### Controller Details:
- **File**: `backend/src/controllers/leaveController.js`
- **Methods**: `getLeaveHistory`, `updateLeaveStatus`

### Key Logical Processes:
- **Leaves Listing & Statistics Aggregate**:
  - Authorizes the requester.
  - Resolves queries. If the requester is an `owner`, they can filter using `targetUserId` or fetch all company records: `{ company: companyId }`.
  - In parallel with fetching paginated records, the backend runs `Leave.countDocuments()` queries to compile counts of `pending`, `approved`, and `rejected` leaves within the active query context, returning a consolidated stats object in the response.
- **Review Decisions updating database states**:
  - Receives the request params containing `leaveId` and request body containing `status` (`"approved"` or `"rejected"`) and `remarks`.
  - Runs a safe Mongo find-and-update lookup limited to the owner's company context: `Leave.findOneAndUpdate({ _id: leaveId, company: companyId }, { status, remarks }, { new: true })`.
  - Populates the user's name and email for the response payload to allow direct UI feedback updates.

---

## 4. Database Collections Used

- **`Leave`**: Stores individual leave records containing the employee reference, company ID, type (e.g. sick/annual/unpaid), start/end dates, reason, status, and admin remarks.
- **`User`**: Linked collection used to fetch user details.
