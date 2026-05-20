# API Endpoints Documentation

## 1. Auth Routes (`/api/auth`)

### POST `/api/auth/login`
- **Description:** Authenticate user and get tokens.
- **Input Data (Body):**
  - `email` (string, required): Valid email address.
  - `password` (string, required): Min 8 characters.
- **Output (200 OK):**
  - `accessToken` (string)
  - `user` (object): `_id`, `fullName`, `email`, `role`, `isVerified`
  - `company` (object | null): `_id`, `companyName`, `email`, `owner`
  - `message` (string): "Login successful!"
  - `success` (boolean): true
  - *Sets `refreshToken` in HTTP-only cookie.*
- **Output (401 Error):** `message`, `success`, `occurredAt`

### POST `/api/auth/logout`
- **Description:** Logout user and clear tokens.
- **Output (200 OK):** `message` ("User logged out successfully"), `success` (true).
  - *Clears `refreshToken` cookie.*

### POST `/api/auth/register`
- **Description:** Register a new user (and company if applicable).
- **Input Data (Body):**
  - `fullName` (string, required): 6-70 chars.
  - `email` (string, required): Valid email address.
  - `password` (string, required): Strict rules (lowercase, uppercase, number, special char, min 8 chars).
- **Output (201 Created):** `message` ("User registered successfully!"), `success` (true).
- **Output (403/404/400 Error):** `message`, `success`, `occurredAt`

### POST `/api/auth/send-otp`
- **Description:** Send OTP to email for verification.
- **Input Data (Body):**
  - `email` (string, required)
  - `companyName` (string, required): 6-70 chars.
- **Output (200 OK):** `message` ("OTP sent successfully to email"), `success` (true).

### POST `/api/auth/verify-otp`
- **Description:** Verify OTP for email verification.
- **Input Data (Body):**
  - `email` (string, required)
  - `otp` (number, required): 5 digits.
- **Output (200 OK):** `message` ("Email Verified"), `success` (true).
- **Output (400 Error):** `message` ("OTP invalid or expired"), `success` (false).

### POST `/api/auth/regenerate-access-token`
- **Description:** Regenerate access token using refresh token.
- **Input (Cookies):** `refreshToken`
- **Output (200 OK):** `accessToken` (string), `message`, `success` (true).
- **Output (401 Error):** `message`, `success`

### GET `/api/auth/me`
- **Description:** Get current user and company details (Test route).
- **Headers:** `Authorization: Bearer <token>`
- **Output (200 OK):** `message`, `success`, `user` (object), `company` (object).

### POST `/api/auth/forgot-password-otp`
- **Description:** Send OTP for password reset.
- **Input Data (Body):**
  - `email` (string, required)
- **Output (200 OK):** `message`, `success`

### POST `/api/auth/reset-password`
- **Description:** Reset password using OTP.
- **Input Data (Body):**
  - `email` (string, required)
  - `otp` (number, required): 5 digits.
  - `newPassword` (string, required): Strict password rules.
- **Output (200 OK):** `message` ("Password reset successfully"), `success` (true).


## 2. Attendance Routes (`/api/attendance`)
*(Requires Authentication)*

### POST `/api/attendance/clock-in`
- **Description:** Clock in the user for today.
- **Output (201 Created):** `message`, `success` (true), `data` (Attendance object).
- **Output (400 Error):** `message` ("Already clocked in for today").

### PUT `/api/attendance/clock-out`
- **Description:** Clock out the user for today.
- **Output (200 OK):** `message`, `success` (true), `data` (Attendance object with `checkOutTime` and `totalHours`).
- **Output (404/400 Error):** `message`, `success`.

### GET `/api/attendance/history`
- **Description:** Get attendance history. Owners can filter by user.
- **Input Data (Query):**
  - `targetUserId` (string, optional): Valid MongoDB ObjectId (Only for owners).
- **Output (200 OK):** `message`, `success` (true), `data` (Array of Attendance objects populated with user details).


## 3. Payroll Routes (`/api/payroll`)
*(Requires Authentication)*

### GET `/api/payroll/history`
- **Description:** Get payroll history.
- **Input Data (Query):**
  - `targetUserId` (string, optional): Valid MongoDB ObjectId (Only for owners).
- **Output (200 OK):** `message`, `success`, `data` (Array of Payroll objects populated with user info).

### POST `/api/payroll/generate`
- **Description:** Generate company payroll for the month. *(Owner Only)*
- **Output (201 Created):** `message`, `success`, `data` (Array of newly generated Payroll objects).
- **Output (400 Error):** `message` ("Payroll already generated...").

### GET `/api/payroll/:id/download`
- **Description:** Download payslip as PDF.
- **Params:** `id` (string): Payroll ID.
- **Output (200 OK):** PDF File stream.
- **Output (404/403 Error):** `message`, `success`.


## 4. User Routes (`/api/users`)
*(Requires Authentication)*

### POST `/api/users/add`
- **Description:** Add a new employee. *(Owner Only)*
- **Input Data (Body):**
  - `fullName` (string, required)
  - `email` (string, required)
  - `role` (string, required): "employee"
  - `salary` (number, optional): Positive amount
  - `branch` (string, optional)
  - `position` (string, optional)
- **Output (201 Created):** `message`, `success`, `data` (User object), `generatedPassword` (string).

### GET `/api/users/all`
- **Description:** Search users in the company. *(Owner Only)*
- **Input Data (Query):**
  - `query` (string, optional): Search term for name/email.
  - `role` (string, optional): "employee" or "owner".
- **Output (200 OK):** `message`, `success`, `data` (Array of User objects).

### PUT `/api/users/profile`
- **Description:** Update own profile.
- **Input Data (Body):**
  - `fullName` (string, optional)
  - `phone` (string, optional)
  - `address` (string, optional)
  - `dateOfBirth` (date, optional)
  - `bankAccount` (string, optional)
- **Output (200 OK):** `message`, `success`, `data` (Updated User object).

### PUT `/api/users/change-password`
- **Description:** Change own password.
- **Input Data (Body):**
  - `oldPassword` (string, required)
  - `newPassword` (string, required)
- **Output (200 OK):** `message`, `success`.

### GET `/api/users/info/:id`
- **Description:** Get specific user by ID. (Owners can see any, employees only themselves).
- **Params:** `id` (string): User ID.
- **Output (200 OK):** `message`, `success`, `data` (User object).

### PUT `/api/users/admin-update/:id`
- **Description:** Update any user's profile and administrative fields. *(Owner Only)*
- **Params:** `id` (string): User ID.
- **Input Data (Body):**
  - `fullName`, `role`, `salary`, `branch`, `position`, `phone`, `address`, `dateOfBirth`, `bankAccount` (all optional).
- **Output (200 OK):** `message`, `success`, `data` (Updated User object).


## 5. Company Routes (`/api/company`)

### GET `/api/company/public/:id`
- **Description:** Get public company details.
- **Params:** `id` (string): Company ID.
- **Output (200 OK):** `message`, `success`, `data` (`companyName`, `logo`, `address`, `owner`).

### GET `/api/company/protected`
- **Description:** Get protected company details. *(Requires Authentication, Owner Only)*
- **Output (200 OK):** `message`, `success`, `data` (Full company object).


## 6. Leave Routes (`/api/leaves`)
*(Requires Authentication)*

### POST `/api/leaves/apply`
- **Description:** Apply for leave.
- **Input Data (Body):**
  - `type` (string, required): "sick", "personal", "annual", "unpaid".
  - `startDate` (ISO Date string, required)
  - `endDate` (ISO Date string, required)
  - `reason` (string, required)
- **Output (201 Created):** `message`, `success`, `data` (Leave object).

### GET `/api/leaves/history`
- **Description:** Get leave history. Owners can filter by user.
- **Input Data (Query):**
  - `targetUserId` (string, optional): Valid MongoDB ObjectId (Only for owners).
- **Output (200 OK):** `message`, `success`, `data` (Array of Leave objects).

### PUT `/api/leaves/:leaveId/status`
- **Description:** Update leave status. *(Owner Only)*
- **Params:** `leaveId` (string): Leave ID.
- **Input Data (Body):**
  - `status` (string, required): "approved" or "rejected".
  - `remarks` (string, optional)
- **Output (200 OK):** `message`, `success`, `data` (Updated Leave object).


## 7. Dashboard Routes (`/api/dashboard`)
*(Requires Authentication)*

### GET `/api/dashboard/stats`
- **Description:** Get dashboard statistics. *(Owner Only)*
- **Output (200 OK):** `message`, `success`, `data` (Object containing `totalEmployees`, `employeesOnLeave`, `todayAttendance`, `recentPayroll`).
