# Story: Owner Employees Directory (`/owner/employees`)

This document explains the end-to-end flow of the Owner's Employee Directory screen, which allows business owners to view, search, paginate, add, and edit employee records.

---

## 1. User Story & Narrative

> **As an** Organization Owner,  
> **I want** to search and view all of my employees, onboard new employees with temporary credentials, and edit their professional and personal details,  
> **So that** I can maintain up-to-date and accurate personnel records for my workforce.

### The Journey:
1. **Accessing the Directory**: The Owner clicks on the **Employees** navigation tab. The page loads and instantly displays the directory. If the page index and query parameters match previous visits, the cached directory from Redux is displayed instantly; otherwise, a loading spinner is shown while fetching fresh records from the database.
2. **Searching & Paginating**: 
   - The Owner types into the search input. To prevent lag and excessive API requests, a 500ms debounce timer runs. If the search term is empty or at least 2 characters, the directory refreshes automatically using the search term.
   - The Owner clicks page numbers at the bottom to paginate through the employee roster.
3. **Onboarding a New Employee**:
   - The Owner clicks the **"Add New Employee"** button, opening a modal.
   - They fill in the name, email, salary, branch, and position, then click submit.
   - The backend creates the employee record, generates a cryptographically secure temporary password, and sends a welcome email containing login credentials. The Owner is notified of success and can see the generated password.
   - The frontend clears the form, closes the modal, and triggers a forced refresh (cache bypass) of page 1 to display the newly onboarded employee.
4. **Editing Employee Profiles**:
   - The Owner clicks **"Edit Info"** on an employee card. This opens an edit modal populated with the employee's existing details.
   - The Owner can update administrative fields (salary, branch, position) as well as personal contact details.
   - Saving the changes hits the backend, triggers a forced refresh, and reflects the updated information on the directory grid.

---

## 2. Frontend Design & State Flow

### View Component:
- **File**: `frontend/src/features/employees/OwnerEmployees.jsx`

### Redux State Integration:
- **Slice**: `frontend/src/features/employees/employeesSlice.js`
- **State Properties**:
  - `employees`: List of fetched employee objects.
  - `loading`: Loader spinner state.
  - `searchQuery`: Debounced search filter string.
  - `page` / `limit`: Pagination parameters.
  - `paginationInfo`: Contains backend-driven pagination indicators (`total`, `totalPages`, `hasNext`, `hasPrev`).
  - `isCached`: Tracks if search results are cached.
  - `cachedParams`: Stores the exact parameters (`page`, `limit`, `searchQuery`) of the cached list.

### Caching Check:
- Inside `fetchEmployees(queryVal, pageVal, limitVal, force)`:
  ```javascript
  if (!force && isCached && cachedParams &&
      cachedParams.page === pageVal &&
      cachedParams.limit === limitVal &&
      cachedParams.searchQuery === queryVal) {
    return; // Retrieve from store, bypass API
  }
  ```
- Any mutation (adding or updating an employee) calls `fetchEmployees(..., true)` to force-clear cache and fetch fresh records.

---

## 3. Backend Integration & Logic

### Endpoints:
1. `GET /api/users/search-users-or-get-all` (Fetch/Search and Paginate Company Employees)
2. `POST /api/users/add` (Onboard New Employee)
3. `PUT /api/users/admin-update/:id` (Update Employee Administrative Profile)

### Controller Details:
- **File**: `backend/src/controllers/userController.js`
- **Methods**: `searchUsers`, `addUser`, `updateUserByAdmin`

### Key Logical Processes:
- **Directory Search & Regex Filtering** (`searchUsers`):
  - Extracts the search term `query` from the URL parameters.
  - Constructs a Mongoose query matching the company context.
  - If a search term exists, a case-insensitive regex check (`$regex`, `$options: "i"`) searches against three fields: `fullName`, `email`, and `identity` using the `$or` operator.
  - Paginates the search query using `.skip()` and `.limit()` calculated from `(page - 1) * limit`.
- **Onboarding & Credential Generation** (`addUser`):
  - Verifies that the email is not already registered globally.
  - Invokes `generateSecurePassword` to create a strong, randomized temporary password.
  - Creates the new `User` document with `role: "employee"` and `isVerified: true`.
  - Sends a rich welcome email containing the email address and temporary password using Nodemailer (`transporter.sendMail`).
  - Returns the temporary password in the response so the owner can copy it manually if needed.
- **Administrative Update** (`updateUserByAdmin`):
  - Authorizes that the requester is indeed an `owner`.
  - Performs a lookup matching both the employee ID and the owner's company context: `User.findOne({ _id: id, company: companyId })`.
  - Updates professional metadata (salary, role, branch, position) and contact fields, saving the document.

---

## 4. Database Collections Used

- **`User`**: Holds employee profile schemas including authentication hashes, professional details (salary, branch, position), contact info (phone, address), and role configurations.
