# Story: Employee Leave Requests (`/employee/leaves`)

This document explains the end-to-end flow of the Employee Leave Requests screen, which allows workers to submit new leave applications, track pending reviews, and view historical approvals.

---

## 1. User Story & Narrative

> **As an** Employee,  
> **I want** to submit leave applications specifying dates and reasons, and review their approval status,  
> **So that** I can request time off and monitor administrative feedback decisions.

### The Journey:
1. **Accessing Leaves**: The Employee navigates to the **Leaves** tab. The UI retrieves cached logs if page parameters match. Otherwise, it presents a loading indicator and calls the history log API to retrieve leave applications and summary statistics.
2. **Reviewing Statistics**: At the top, the Employee inspects three summary widgets:
   - **Pending Approvals**
   - **Approved Leaves**
   - **Rejected Requests**
3. **Submitting a Leave Request**:
   - The Employee clicks **"Apply for Leave"**, opening a form modal.
   - They configure:
     - **Leave Type**: sick, annual, personal, or unpaid.
     - **Start Date** & **End Date**: Selected via standard calendars.
     - **Reason**: Explaining the absence.
   - The frontend validates form schemas.
   - On submission, the backend registers the leave request with a default status of `"pending"`.
   - The Employee receives a success notification. The form closes, and the UI triggers a forced refresh (cache bypass) of page 1 to show the newly submitted leave at the top of the table.

---

## 2. Frontend Design & State Flow

### View Component:
- **File**: `frontend/src/features/leaves/EmployeeLeaves.jsx`

### Redux State Integration:
- **Slice**: `frontend/src/features/leaves/leavesSlice.js` (State Namespace: `state.leaves.employee`)
- **State Properties**:
  - `leaves`: Array of leave applications.
  - `loading`: Main history fetch spinner.
  - `submitLoading`: Spinner for submit button.
  - `page` / `limit` / `paginationInfo`: Standard pagination parameters.
  - `leaveStats`: Object holding aggregate counts of `pending`, `approved`, and `rejected` leaves.

### Cache Verification:
- Inside `fetchLeaves(force)`:
  ```javascript
  if (!force && isCached && cachedParams &&
      cachedParams.page === page &&
      cachedParams.limit === limit) {
    return; // Retrieve from store, bypass API
  }
  ```
- Submitting a request triggers `fetchLeaves(true)` which invalidates cached lists and updates statistics globally.

---

## 3. Backend Integration & Logic

### Endpoints:
1. `GET /api/leaves/history` (Retrieve user-specific leave records and aggregated counts)
2. `POST /api/leaves/apply` (Submit new leave application)

### Controller Details:
- **File**: `backend/src/controllers/leaveController.js`
- **Methods**: `getLeaveHistory`, `applyLeave`

### Key Logical Processes:
- **Automatic User Restricting**:
  - Validates authentication token.
  - Since the user is an `employee`, the query is restricted to: `{ user: req.user._id, company: companyId }`.
- **Parallel Document Counting**:
  - Runs parallel `Leave.countDocuments()` calls for different statuses to return the employee's aggregate stats along with the paginated list.
- **Request Creation**:
  - Saves the new `Leave` document with the active employee's ID and company context, initializing `status: "pending"`.

---

## 4. Database Collections Used

- **`Leave`**: Stores individual leave records containing employee, company, type, start/end dates, reason, status, and remarks.
