# Story: Employee Attendance & Geofenced Clocking (`/employee/attendance`)

This document explains the end-to-end flow of the Employee Attendance screen, which enables workers to log daily shifts using GPS-geofenced check-ins and audits shift durations.

---

## 1. User Story & Narrative

> **As an** Employee,  
> **I want** to clock-in at the start of my shift (validated against office coordinates) and clock-out when finished,  
> **So that** my working hours are accurately captured and approved in the database for monthly salary computations.

### The Journey:
1. **Navigating to Attendance**: The Employee selects the **Attendance** tab. The UI retrieves cached logs if page parameters match. Otherwise, it presents a loading indicator and calls the history log API.
2. **Reviewing Shift Status**:
   - The UI evaluates page 1 records to check if there is an entry matching today's date.
   - If no record exists: Displays a **"Not Clocked In"** state with an active **"Clock In"** button.
   - If clocked in but not clocked out: Displays an **"Shift Active"** state showing the clock-in time and an active **"Clock Out"** button.
   - If clocked out: Displays a **"Shift Completed"** state showing the total hours logged for the day.
3. **Checking In (Geofenced Validation)**:
   - The Employee clicks **"Clock In"**. The browser requests HTML5 GPS coordinates (`navigator.geolocation.getCurrentPosition`).
   - If coordinates are resolved, they are submitted to `/api/attendance/clock-in`.
   - The backend retrieves company office coordinates and calculates the distance. If the worker is outside the company's allowed perimeter boundary (e.g. 200m), check-in is rejected with an error toast showing the distance. If within the boundary, check-in succeeds.
   - If the browser location is denied/disabled, the check-in is immediately blocked if company coordinates are active.
4. **Checking Out (Geofenced Validation)**:
   - The Employee clicks **"Clock Out"**. The browser requests HTML5 GPS coordinates (`navigator.geolocation.getCurrentPosition`), identical to the check-in process.
   - The coordinates are submitted to `PUT /api/attendance/clock-out`.
   - The backend validates the distance against the company perimeter. If the worker is outside the boundary, check-out is rejected.
   - If within the boundary (or if proximity checks are disabled), the backend logs the timestamp, calculates work duration, and changes the UI state to "Shift Completed".
---

## 2. Frontend Design & State Flow

### View Component:
- **File**: `frontend/src/features/attendance/EmployeeAttendance.jsx`

### Redux State Integration:
- **Slice**: `frontend/src/features/attendance/attendanceSlice.js` (State Namespace: `state.attendance.employee`)
- **State Properties**:
  - `history`: List of attendance logs.
  - `loading`: Main history fetch spinner.
  - `actionLoading`: Disable-spinner for clock-in/out button states.
  - `todayRecord`: Object containing today's attendance document if registered.
  - `page` / `limit` / `paginationInfo`: Standard pagination parameters.

### Cache Verification:
- Inside `fetchAttendance(force)`:
  ```javascript
  if (!force && isCached && cachedParams &&
      cachedParams.page === page &&
      cachedParams.limit === limit) {
    return; // Retrieve from store, bypass API
  }
  ```
- Triggering clock-in or clock-out actions calls `fetchAttendance(true)` to reload today's status and logs.

---

## 3. Backend Integration & Logic

### Endpoints:
1. `POST /api/attendance/clock-in` (Clock-in with location coordinates check)
2. `PUT /api/attendance/clock-out` (Clock-out with location coordinates check, calculates shift hours)
3. `POST /api/attendance/verify-proximity` (Background validation endpoint)

### Controller Details:
- **File**: `backend/src/controllers/attendanceController.js`
- **Methods**: `clockIn`, `clockOut`, `verifyProximity`

### Key Logical Processes:
- **Haversine Distance Formula Calculation**:
  - The distance between employee GPS coordinates ($\text{lat}_1, \text{lon}_1$) and company office coordinates ($\text{lat}_2, \text{lon}_2$) is calculated using:
    $$R = 6,371,000 \text{ meters (Earth Radius)}$$
    $$\Delta\text{lat} = (\text{lat}_2 - \text{lat}_1) \times \frac{\pi}{180}$$
    $$\Delta\text{lon} = (\text{lon}_2 - \text{lon}_1) \times \frac{\pi}{180}$$
    $$a = \sin^2\left(\frac{\Delta\text{lat}}{2}\right) + \cos(\text{lat}_1 \times \frac{\pi}{180}) \times \cos(\text{lat}_2 \times \frac{\pi}{180}) \times \sin^2\left(\frac{\Delta\text{lon}}{2}\right)$$
    $$c = 2 \times \text{atan2}(\sqrt{a}, \sqrt{1 - a})$$
    $$\text{distance} = R \times c$$
  - If the computed $\text{distance} > \text{proximityRadius}$ (default 200m), the request returns a `400 Bad Request`.
- **Clock Out Calculations**:
  - Finds today's active shift matching `{ user: userId, date: { $gte: today } }`.
  - Records `checkOutTime = new Date()`.
  - Calculates work duration: `totalHours = Math.round(diffMs / (1000 * 60))` (minutes).
- **Real-Time Geofence Auditing** (`verifyProximity`):
  - Automatically queries the active shift. If coordinates fail browser updates or exceed office boundary limits, the backend automatically logs a clock-out timestamp and calculates minutes worked.

---

## 4. Database Collections Used

- **`Attendance`**: Stores individual attendance records containing user details, check-in and check-out times, date, status, total hours worked, and notes.
- **`Company`**: Read to fetch company office GPS coordinates (`latitude`/`longitude`) andallowed boundary perimeter (`proximityRadius`).
