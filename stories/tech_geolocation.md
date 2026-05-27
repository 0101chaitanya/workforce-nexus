# Technical Story: Geolocation & Geofenced Distance Formula

This document explains the geofencing system used in the Employee Management System, including frontend HTML5 GPS coordinate retrieval and backend proximity verification using the Haversine mathematical formula.

---

## 1. Flow Architecture

```mermaid
sequenceDiagram
    participant Browser as Client Browser (GPS)
    participant UI as React UI Component
    participant Controller as Express Controller
    participant DB as MongoDB

    UI->>Browser: Request Location (getCurrentPosition)
    alt Location Granted
        Browser-->>UI: Coordinates: { latitude, longitude }
        UI->>Controller: POST /api/attendance/clock-in { latitude, longitude }
        Controller->>DB: Fetch Company Office GPS & Radius
        DB-->>Controller: Office Coordinates & Allowed Radius
        Controller->>Controller: Compute Distance via Haversine Formula
        alt Distance <= Radius
            Controller->>DB: Save Attendance Record (Present)
            Controller-->>UI: 201 Created (Clocked In)
        else Distance > Radius
            Controller-->>UI: 400 Bad Request (Outside Boundary)
        end
    alt Location Denied
        Browser-->>UI: GeolocationPositionError
        UI-->>UI: Block Clock-in / Show Error Alert
    end
```

---

## 2. Frontend GPS Coordinate Retrieval

The frontend uses the HTML5 Geolocation API to fetch precise coordinate points.

* **Trigger Location**: `frontend/src/features/attendance/EmployeeAttendance.jsx`

### Code Implementation:
```javascript
const getCoordinates = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Geolocation is not supported by your browser."));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true, // Forces usage of GPS hardware if available
        timeout: 10000,           // 10-second timeout limit
        maximumAge: 0             // Prevents retrieving cached coordinates
      }
    );
  });
};
```

---

## 3. Backend Geofence Verification (Haversine Formula)

The backend calculates the **great-circle distance** between the employee's browser coordinates and the company's office coordinates using the **Haversine formula**.

* **Controller file**: `backend/src/controllers/attendanceController.js`
* **Method**: `getDistance(lat1, lon1, lat2, lon2)`

### A. Mathematical Formula
Given two points on a sphere of radius $R$:
1. Convert coordinates from degrees to radians:
   $$\Delta\text{lat} = (\text{lat}_2 - \text{lat}_1) \times \frac{\pi}{180}$$
   $$\Delta\text{lon} = (\text{lon}_2 - \text{lon}_1) \times \frac{\pi}{180}$$
2. Apply the spherical law of cosines / Haversine steps:
   $$a = \sin^2\left(\frac{\Delta\text{lat}}{2}\right) + \cos(\text{lat}_1 \times \frac{\pi}{180}) \times \cos(\text{lat}_2 \times \frac{\pi}{180}) \times \sin^2\left(\frac{\Delta\text{lon}}{2}\right)$$
   $$c = 2 \times \text{atan2}(\sqrt{a}, \sqrt{1 - a})$$
   $$\text{distance} = R \times c$$
   *(where $R = 6,371,000 \text{ meters}$, the mean radius of Earth)*

### B. Code Implementation
```javascript
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radius of the Earth in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Returns distance in meters
}
```

---

## 4. Background Proximity Auditing (`verifyProximity`)

To prevent employees from turning off location settings or leaving the office premises after clocking in, the frontend runs a background proximity checker that hits `/api/attendance/verify-proximity` every 3 minutes.

- **Underlying Logic**:
  - If coordinate fields are empty, undefined, or missing (e.g. employee denied/revoked browser permission midway), the backend **automatically clocks them out**, setting `checkOutTime = new Date()`, computing total hours, and recording `remarks: "Auto-clocked out: Geolocation permission denied or unavailable."`.
  - If coordinates are resolved, the backend computes the distance. If $\text{distance} > \text{allowedRadius}$ (default 200m), it **automatically clocks them out** with `remarks: "Auto-clocked out: Left office boundary"`.
  - This ensures that active sessions are verified in real time.
