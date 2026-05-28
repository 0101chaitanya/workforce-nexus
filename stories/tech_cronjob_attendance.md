# Technical Documentation: Cron Jobs & Attendance Status Calculation

This document outlines the architecture and business logic for background scheduled jobs (cron) and how they process daily attendance statuses for employees within the Employee Management System.

## 1. Overview

The system uses an external Serverless Cron service to automatically reconcile attendance records at the end of each day (11:55 PM). Because an employee's presence, absence, or half-day status is dependent on the total minutes they clocked in for the day, a scheduled task is critical to ensure that employees who forgot to clock out or those who didn't show up at all are properly accounted for in payroll and dashboard metrics.

*Note: The system previously relied on `node-cron`, but was migrated to a Serverless Endpoint architecture to support zero-downtime and cost-efficient cloud deployments (e.g. Vercel, Render Free Tier).*

## 2. Business Logic & Thresholds

Attendance status is computed based on the total minutes an employee works in a day. 
A standard full shift is defined as **9 hours** (540 minutes).

The status classifications are strictly computed as:
- **`present`**: Total minutes $\ge 540$ (9 hours).
- **`half-day`**: Total minutes $\ge 240$ (4 hours) but $< 540$.
- **`absent`**: Total minutes $< 240$.
- **`leave`**: The employee has an approved leave overriding the day.

## 3. The `cronController.js` Job

The scheduled task is exposed as a REST API endpoint at `POST /api/cron/daily-attendance` (handled by `backend/src/controllers/cronController.js`). It is expected to be triggered externally at `55 23 * * *` (11:55 PM daily).

### Step-by-Step Execution:
1. **Find All Employees**: The script fetches all users in the system with the `employee` role.
2. **Leave Reconciliation**: 
   - For each user, it checks the `Leave` collection to see if they have an active, `approved` leave for today.
   - If they do, the script performs an `upsert` on the `Attendance` collection, forcefully marking today's record with `status: 'leave'` and `totalHours: 0`.
3. **No-Show Absence**:
   - If the user has no approved leave and never clocked in today (no `Attendance` record), a new record is created with `status: 'absent'` and `totalHours: 0`.
4. **Auto Clock-Out**:
   - If the user clocked in but never clocked out, the script acts as an auto-clock-out mechanism. 
   - It sets the `checkOutTime` to the time of execution (11:55 PM), calculates the elapsed minutes, but penalizes the forgetfulness by overriding the `status` strictly to `'absent'`.
5. **Standard Clock-Out Validation**:
   - If the user already clocked out successfully during the day, the script performs a final verification pass, setting the `status` to `present`, `half-day`, or `absent` based on their total recorded minutes.

## 4. Integration with Standard Operations

While the cron job is the safety net, the system also calculates these statuses **in real-time** when an employee explicitly interacts with the system:

- **Manual Clock-Out**: When hitting the "Clock Out" button on the dashboard, the backend (`attendanceController.js`) computes the exact same minutes threshold and saves their status instantly. This ensures the dashboard reflects accurate stats immediately without waiting for midnight.
- **Proximity/Geofence Triggers**: If an employee leaves the office boundary or revokes their browser's location permission, the system's background ping will automatically force a clock-out. During this forced clock-out, their accumulated minutes are tallied and they are immediately assigned `present`, `half-day`, or `absent`.

## 5. Extensibility

Because the logic relies on minute integer thresholds (`540` and `240`), adjusting company policies (e.g. changing a full shift to 8 hours) simply requires updating these threshold constants in the cron controller and the attendance controller.
