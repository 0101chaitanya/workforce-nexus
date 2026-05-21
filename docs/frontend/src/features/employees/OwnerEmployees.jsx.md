# OwnerEmployees.jsx

## 1. Overview
The `OwnerEmployees.jsx` component is an administration control panel designed for corporate owners. It acts as an interactive directory list and control board to query registered employees, register/add new employees (which automatically triggers system onboarding emails containing generated credentials), and edit employee corporate/personal details (including full name, position, branch, base salary, role assignments, phone, and address).

---

## 2. Key Responsibilities & Flow
- **Displaying and Filtering Personnel**:
  - Automatically fetches all registered employee records on component mount using `fetchEmployees()`.
  - Integrates a search filter text input. Typing in the search bar triggers a debounced layout fetch (500ms delay) with `query` parameters targetting name/email/ID strings.
- **Adding New Employees**:
  - The "Add New Employee" button presents a modal containing input fields for `fullName`, `email`, `salary`, `branch`, and `position`.
  - On submit, a `POST` request is dispatched to `/api/users/add`.
  - If the server returns yup/joi validation errors (HTTP 400), they are mapped to local input validation error states to show inline error descriptions.
  - On a successful response, a success alert is triggered stating that the registration email was dispatched, the modal is closed, the form reset, and directory lists refreshed.
- **Updating Profiles**:
  - Clicking "Edit Info" on any employee card launches the update modal prefilled with that user's values.
  - Triggers a `PUT` request to `/api/users/admin-update/:id`.
  - Handles validation errors (HTTP 400) inline or shows standard error boxes.

---

## 3. Code Patterns & Best Practices
- **Debounced Server Querying**:
  - Leverages a combination of React `useCallback` (to memoize `fetchEmployees`) and `useEffect` with a 500ms timeout delay to debounce search input typing, decreasing API workload.
- **Form Validation Schema Mapping**:
  - Catches yup/validation array schemas returned on HTTP 400 from the backend, converts them into localized key-value structures, and projects helper warning strings directly beneath the corresponding inputs.
- **Role-based Styling Rules**:
  - Adjusts badge visual styling based on owner/employee role labels (`role === 'owner'` gets a golden amber design).

---

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
This frontend component maps to the following backend elements:
- **Routes / Endpoints consumed**:
  - `GET` `/api/users/all` -> Handled by `userRoutes.js` and `userController.js` (`getAllUsers`).
  - `POST` `/api/users/add` -> Handled by `userRoutes.js` and `userController.js` (`addEmployee`). Validated using `ownerSchemas.addEmployeeSchema`.
  - `PUT` `/api/users/admin-update/:id` -> Handled by `userRoutes.js` and `userController.js` (`adminUpdateUser`). Validated using `ownerSchemas.adminUpdateUserSchema`.
- **Mongoose Model Reference**:
  - Accesses and modifies Mongoose fields in `User.js` (`fullName`, `email`, `salary`, `branch`, `position`, `phone`, `address`, `role`).

---

## 5. Line-by-Line Code Explanation
- **Lines 1-3 (Imports)**:
  - Imports React hooks (`useState`, `useEffect`, `useCallback`).
  - Imports icons from `lucide-react` (`Search`, `UserPlus`, `Edit2`, `Shield`, `Loader2`, `AlertCircle`, `Phone`, `MapPin`, `Briefcase`).
  - Imports the custom axios client wrapper `api`.
- **Lines 6-10 (State Hooks)**:
  - `employees`: Array list storing fetched user profiles.
  - `loading`/`error`/`successMessage`: Tracks loading, query failure, and operation success message states.
  - `searchQuery`: Tracks employee directory keyword lookup query text.
- **Lines 13-16 (Modal states)**:
  - `isAddModalOpen`/`isEditModalOpen`: Modal visibility trigger booleans.
  - `selectedUser`: Stores the user object targetted by the active edit form.
  - `modalLoading`: Modal submit loading indicator state.
- **Lines 19-21 (Form States)**:
  - `validationErrors`: Key-value object mapping specific inputs to backend-returned validation errors.
  - `addForm`/`editForm`: Stores values corresponding to Add User and Edit User form inputs.
- **Lines 23-37 (`fetchEmployees` memoized query handler)**:
  - Wrapped in `useCallback` to prevent component re-render loops.
  - Hits `/api/users/all`, attaching keyword lookup strings and pagination options.
- **Lines 39-42 (Initial Mount useEffect)**:
  - Fires initial `fetchEmployees()` parameter-free fetch on render mount.
- **Lines 45-54 (Search Debounce useEffect)**:
  - Monitors keyboard entries on `searchQuery`.
  - Sets a 500ms timeout window to debounce directory searches, canceling the preceding timer if a new key is pressed.
- **Lines 56-84 (`handleAddSubmit` handler)**:
  - Triggers a `POST` request to `/api/users/add` containing form payload.
  - On validation error response (HTTP 400), parses returned details and stores field error messages into `validationErrors`.
  - On success, displays confirmation message, closes the modal, clears the inputs, and updates directories.
- **Lines 86-100 (`handleEditClick` helper)**:
  - Populates edit states and fields with the selected employee details, and triggers modal visibility.
- **Lines 102-129 (`handleEditSubmit` handler)**:
  - Submits a `PUT` request to `/api/users/admin-update/:id`.
  - Maps any backend validation rejections inline and refreshes lists on success.
- **Lines 131-138 (Conditional Initial Loading)**:
  - Displays full directory loading state widget if `employees` array is empty and list loading is active.
- **Lines 140-512 (JSX Layout Render)**:
  - Lines 142-155: Directory Page Header and "Add New Employee" trigger button.
  - Lines 157-169: Success/Error messages callout banners.
  - Lines 171-181: Directory Search input bar.
  - Lines 183-228: Employee Cards Grid (displays initial avatar circle, role label badge, full name, email address, corporate spec properties, and Edit Info button).
  - Lines 231-347: Onboarding modal dialog containing the registration form (Name, Email, Salary, Branch, Position) and submit/cancel buttons. Maps inline validation messages using keys inside `validationErrors`.
  - Lines 350-508: Editor modal dialog containing the profile editor form (Name, Role drop-down, Salary, Branch, Position, Phone, Address inputs) and submit/cancel buttons.


