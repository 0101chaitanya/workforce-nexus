# Story: Owner Attendance Management (`/owner/attendance`)

This document explains the end-to-end flow of the Owner Attendance Management screen, which allows business owners to monitor historical and real-time clock-in/out logs, inspect work hours, and filter records by specific employees using an autocomplete search interface.

---

## 1. User Story & Narrative

> **As an** Organization Owner,  
> **I want** to browse the attendance records of my entire workforce and look up log sheets for individual employees,  
> **So that** I can track active shift compliance, review check-in/out locations, and audit total hours for payroll calculation.

### The Journey:
1. **Accessing the View**: The Owner navigates to the **Attendance** tab. The UI retrieves cached logs from Redux if pagination and user filters match. Otherwise, it presents a loading indicator and retrieves paginated company-wide attendance files from the database.
2. **Filtering by Employee (Autocomplete Lookup)**:
   - The Owner wants to inspect a specific employee's records. They type the name or ID in the **"Look Up Employee"** search box.
   - A 300ms debounce timer runs on the frontend before firing an autocomplete API request (`GET /api/users/search-users-or-get-all?query=...`) to list matching profiles.
   - An autocomplete list drops down. The Owner clicks on the employee's name.
   - The UI updates the input to display the employee's identity/name, sets the active `targetUserId` filter, resets the pagination page to 1, and fetches the filtered attendance history.
3. **Clearing Filter**: The Owner clicks the clear (**X**) icon in the search box. The input is wiped, `targetUserId` is set to null, and the list resets back to showing all company attendance records.
4. **Refreshing Data**: The Owner clicks the **Refresh** button to force-retrieve the newest check-in and check-out logs, ensuring real-time alignment with employees active in the field.

---

## 2. Frontend Design & State Flow

### View Component:
- **File**: `frontend/src/features/attendance/OwnerAttendance.jsx`

### Redux State Integration:
- **Slice**: `frontend/src/features/attendance/attendanceSlice.js` (State Namespace: `state.attendance.owner`)
- **State Properties**:
  - `attendance`: List of attendance log records.
  - `loading`: Main history fetch spinner indicator.
  - `page` / `limit`: Pagination parameters.
  - `paginationInfo`: Object indicating pages, total counts, and sibling page availability.
  - `searchQuery`: Text currently typed inside the employee lookup input.
  - `searchResults`: Autocomplete search array matching the `searchQuery`.
  - `targetUserId`: Mongo ID of the currently selected employee.
  - `selectedUserObj`: Full profile object of the selected employee.
  - `showDropdown`: Boolean determining visibility of the autocomplete dropdown.
  - `searchLoading`: Autocomplete spinner state.
  - `isCached`: Tracks if the list is cached.
  - `cachedParams`: Matches parameters of the cached list: `page`, `limit`, and `targetUserId`.

### Caching Check:
- Inside `fetchAttendance(force)`:
  ```javascript
  if (!force && isCached && cachedParams &&
      cachedParams.page === page &&
      cachedParams.limit === limit &&
      cachedParams.targetUserId === targetUserId) {
    return; // Bypass network request
  }
  ```

---

## 3. Backend Integration & Logic

### Endpoints:
1. `GET /api/users/search-users-or-get-all?query=...` (Autocomplete user list helper)
2. `GET /api/attendance/history` (Fetch paginated company-wide or user-specific logs)

### Controller Details:
- **File**: `backend/src/controllers/attendanceController.js`
- **Method**: `getAttendanceHistory`

### Key Logical Processes:
- **Role-Based History Fetching**:
  - Validates authentication token and extracts `req.company._id`.
  - Checks if the user is an `owner`.
  - If `req.user.role === 'owner'`, it evaluates the presence of `targetUserId` in the query params.
    - If `targetUserId` is present, it constructs the MongoDB query filters as: `{ company: companyId, user: targetUserId }`.
    - If no `targetUserId` is provided, it returns all records matching: `{ company: companyId }`.
  - If the requester were an employee instead of an owner, the controller overrides the query to force-restrict lookup to: `{ company: companyId, user: req.user._id }`.
  - Executes `.populate('user', 'fullName email position identity')` to join user profile details onto each attendance log.
  - Computes pagination indices using `.skip()` and `.limit()` and sorts descending by date (`{ date: -1 }`).

---

## 4. Database Collections Used

- **`Attendance`**: Holds individual records containing the `user` reference, check-in and check-out timestamps, `totalHours` worked during the shift, day/date logs, status (e.g., `"present"`), and manual remarks (e.g., auto-checkout details).
- **`User`**: Linked collection used to resolve full names, roles, positions, and employee identity cards.
