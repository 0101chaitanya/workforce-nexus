# frontend/src/features/organization/OwnerOrganization.jsx

## 1. Overview
`frontend/src/features/organization/OwnerOrganization.jsx` implements the organizational profile page, allowing owners to view and edit company details (like company name, address, and phone number).

## 2. Key Responsibilities & Flow
- **Data Fetching**: Requests the company's verified dataset on page mount from `/company/protected`.
- **Form Controls & Validation**:
  - Toggles between read-only and edit forms.
  - Submits updated company profile parameters to the backend using a PUT request to `/company/update`.
  - Refetches the updated company data and exits editing mode upon a successful save.
- **Access Restrictions**: Restricts view access to administrative owners, displaying verification badges to confirm authorization.

## 3. Code Patterns & Best Practices
- **Editing Buffers**: Copies the active company info into a local state buffer (`editForm`) when entering edit mode. This allows the user to cancel their changes without affecting the displayed data or making unnecessary API requests.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- **Endpoints mapping**:
  - `GET /api/company/protected` -> Called by `fetchCompany` to retrieve the active organization profile.
  - `PUT /api/company/update` -> Called by `handleSave` to submit updated organization parameters.
- **Validation**: Submissions are validated against the backend `ownerSchemas.companyUpdate` schema.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports & Setup (Lines 1-3)**: Resolves React state, custom Axios interceptors API wrapper, and UI icons.
2. **State Setup (Lines 6-12)**: Sets up variables for company object, loading spinner, error/success notifications, editing view toggles, editForm input parameters, and saving indicators.
3. **fetchCompany Function (Lines 14-31)**: Hits `/company/protected` to query company profile stats. Populates state values and editing buffers.
4. **Action Handlers (Lines 33-61)**: Coordinates switching modes (`handleEdit`, `handleCancel`) and submits form elements to `/company/update` (`handleSave`).
5. **Mount useEffect Hook (Lines 63-65)**: Invokes `fetchCompany` automatically upon initial render.
6. **Pre-render Checks (Lines 67-86)**: Intercepts views to output full screen loading or critical query failures.
7. **Main Presentation UI (Lines 88-222)**: Renders owner details panels, company setting layouts, and toggling forms.

- **Lines 1-3 (Imports)**:
  - **Basic Function**: Pull dependencies and visual icons.
  - **Detailed Explanation**: Imports React, `useEffect`, and `useState`. Also imports the customized axios wrapper `api` to authorize transactions, and a list of icons from `lucide-react` for company setting blocks.
- **Lines 5 (Component Definition)**:
  - **Basic Function**: Declare `OwnerOrganization` layout wrapper.
  - **Detailed Explanation**: Instantiates the arrow function component `OwnerOrganization` to hold settings states and triggers.
- **Lines 6-12 (State Setup)**:
  - **Basic Function**: Define status, loading, edit forms, and transition flags.
  - **Detailed Explanation**: `company` stores the retrieved corporate record. `loading` monitors initial Mount fetches. `error` and `successMessage` cache network statuses. `isEditing` toggles form modes. `editForm` stores buffered inputs (companyName, address, phone). `saving` prevents multiple submit actions.
- **Lines 14-31 (fetchCompany Function)**:
  - **Basic Function**: Retrieve company record from the database.
  - **Detailed Explanation**: Sets `loading` to true. Hits the authenticated `/company/protected` GET endpoint. Stores returned information into `company` state and initializes the `editForm` inputs buffer. Catches failures and registers message texts via `setError`. Finally sets `loading` false.
- **Lines 33-35 (handleEdit Handler)**:
  - **Basic Function**: Open edit mode form.
  - **Detailed Explanation**: Sets `isEditing` to true to replace the display cards with editable form text boxes.
- **Lines 37-44 (handleCancel Handler)**:
  - **Basic Function**: Close form without saving updates.
  - **Detailed Explanation**: Sets `isEditing` false and restores the buffered `editForm` states to match the untouched `company` profile values.
- **Lines 46-61 (handleSave Handler)**:
  - **Basic Function**: Update company settings profile database.
  - **Detailed Explanation**: Blocks page refresh via `e.preventDefault()`. Sets `saving` true and clears alerts. Updates `/company/update` with `editForm` body payload. If successful, triggers `fetchCompany()` to refresh profile values, turns off edit mode, and displays success alerts.
- **Lines 63-65 (useEffect Hook)**:
  - **Basic Function**: Fetch company details on mount.
  - **Detailed Explanation**: Triggers a parameter-free callback to `fetchCompany()` when the page first loads.
- **Lines 67-74 (Loading Return Block)**:
  - **Basic Function**: Render full page loading layout.
  - **Detailed Explanation**: Intercepts render flow to show active page spinners when loading details is true.
- **Lines 76-86 (Error Return Block)**:
  - **Basic Function**: Render database access error alerts.
  - **Detailed Explanation**: Intercepts render flow to report database lookup rejections.
- **Lines 88-222 (JSX Presentation Layout)**:
  - **Basic Function**: Main display page view.
  - **Detailed Explanation**:
    - Lines 90-103: Header segment with verified owner access description badge.
    - Lines 105-117: Success or failure inline banners.
    - Lines 119-219: Multi-column detail grid. The first column renders either the editable input form (Name, Phone, Address with Save/Cancel triggers) if `isEditing` is true, or the readonly details list with an Edit action trigger. The second column renders the owner's full name.
