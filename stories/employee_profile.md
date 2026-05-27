# Story: Employee Profile & Credentials (`/employee/profile`)

This document explains the end-to-end flow of the Employee Profile screen, which enables employees to manage their personal contacts, residential details, bank accounts, and account passwords.

---

## 1. User Story & Narrative

> **As an** Employee,  
> **I want** to view my job attributes, update my personal contact details/bank accounts, and change my portal login password,  
> **So that** I can keep my information up-to-date and maintain account security.

### The Journey:
1. **Accessing Settings**: The Employee clicks the **Profile** navigation tab. The UI retrieves cached profile settings from Redux if available; otherwise, it hits the API for the employee's specific record.
2. **Reviewing Job Details**: The Employee views administrative info like role, branch, position, email, and salary. These are locked as **read-only** (only the owner can modify these from the admin directory).
3. **Updating Personal Details**:
   - The Employee clicks the **"Edit Details"** button. The fields for name, phone, address, DOB, and bank account number become editable.
   - On submission, the frontend runs format checks (validating phone structures and date strings), sends the update request to the server, updates local authorization states, and forces a cache refresh to reload the updated attributes.
4. **Changing Password**:
   - The Employee goes to the password card. They input their old password, new password, and verify-confirmation password.
   - The frontend checks that new passwords match.
   - The backend compares the old password against the stored password hash using `bcrypt`. If correct, it hashes the new password and commits the change. The form clears, and the user receives a success notification.

---

## 2. Frontend Design & State Flow

### View Component:
- **File**: `frontend/src/features/profile/EmployeeProfile.jsx`

### Redux State Integration:
- **Slice**: `frontend/src/features/profile/profileSlice.js`
- **State Properties**:
  - `profile`: Object containing the logged-in user's profile metadata.
  - `loading`: Loader spinner state during profile retrieves.
  - `saveLoading`: Spinner for update operations.
  - `passwordLoading`: Spinner for credential modification operations.
  - `isCached`: Cache state flag.

### Cache Verification:
- Inside `fetchProfileDetails(silent, force)`:
  ```javascript
  if (!force && isCached && profile) {
    // Populate form fields with cached profile
    return; 
  }
  ```
- Password changes do not affect profile data caching, but modifying personal details calls `fetchProfileDetails(true, true)` to bypass and overwrite the cache.

---

## 3. Backend Integration & Logic

### Endpoints:
1. `GET /api/users/info/:id` (Fetch profile details by user ID)
2. `PUT /api/users/profile` (Update personal and contact info)
3. `PUT /api/users/change-password` (Update authentication password)

### Controller Details:
- **File**: `backend/src/controllers/userController.js`
- **Methods**: `getUserById`, `updateProfile`, `changePassword`

### Key Logical Processes:
- **Role Verification on Lookups** (`getUserById`):
  - Fetches the user by ID from route parameters.
  - Safeguard rule: If the requesting user is an `employee`, they are blocked from requesting any ID other than their own (`req.user._id`), returning a `403 Forbidden` response.
- **Safe Self-Service Profiles Updates** (`updateProfile`):
  - Extracts parameters `fullName`, `phone`, `address`, `dateOfBirth`, and `bankAccount` from the request body.
  - Restricts update values to these fields only, avoiding modifications to salaries, roles, or company links.
- **Password Checking & Pre-Save Encryption Hooks** (`changePassword`):
  - Retrieves the user by ID and extracts `oldPassword` and `newPassword` from the body.
  - Compares the `oldPassword` plaintext with the hashed password in the DB using `bcrypt.compare`.
  - Updates the password field on the mongoose model. Mongoose runs a pre-save hook (`UserSchema.pre('save')`) that hashes the password with 10 salt rounds before writing it to MongoDB.

---

## 4. Database Collections Used

- **`User`**: Holds employee profile fields, password hashes, and personal/professional credentials.
