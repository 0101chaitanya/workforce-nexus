# frontend/src/components/common/Pagination.jsx

## 1. Overview
`frontend/src/components/common/Pagination.jsx` is a reusable UI component that provides pagination controls (previous/next buttons, page numbers, and rows-per-page selectors) for data tables.

## 2. Key Responsibilities & Flow
- **Props**: Receives controls including `page`, `limit`, `total`, `totalPages`, `hasNext`, `hasPrev`, `onPageChange`, and `onLimitChange`.
- **Dynamic Visible Page Range**: Limits the list of visible page buttons to a maximum of 5, shifting the window dynamically based on the current page to handle large page lists.
- **Page Size Selector**: Displays a dropdown selector (e.g. 5, 10, 25, 50 rows per page) that calls `onLimitChange` to update results limit queries.
- **Navigation Callbacks**: Passes target page indices to the parent controller via `onPageChange` when page number buttons or previous/next buttons are clicked.

## 3. Code Patterns & Best Practices
- **Reusable Stateless Component**: Keeps UI rendering separated from data fetching logic by relying entirely on props and callbacks.
- **Edge-Case Handling**: Returns `null` if there are no records, hiding unnecessary pagination controls when lists are empty.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Matches with backend database pagination schemas (e.g. `ownerSchemas.historyQuery`) and controllers (e.g. `attendanceController.js` and `leaveController.js` paginated listings).
- Connects directly to features displaying data tables like `OwnerEmployees.jsx`, `OwnerAttendance.jsx`, `EmployeeLeaves.jsx`, and others.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Module Imports**: Imports React and Chevron arrow icons.
2. **Component Header & Props**: Defines the component arguments and options with defaults.
3. **Guard Clause**: Immediately returns `null` to render nothing if there are no records.
4. **Visible Page Array Calculation**: Calculates a dynamic window of page numbers to show (up to 5 page buttons) around the current page.
5. **Record Information Text**: Displays the offset count range currently shown, along with the total count.
6. **Limit Selector Dropdown**: Renders a dropdown to change rows-per-page, triggering `onLimitChange`.
7. **Page Control Buttons**: Displays previous/next buttons and page number buttons, attaching navigation event handlers.

- **Lines 1-2 (Module Imports)**:
  - **Basic Function**: Loads React and lucide-react arrow icons.
  - **Detailed Explanation**: Imports `React` and the `ChevronLeft` and `ChevronRight` icons to use inside the pagination buttons.
- **Lines 4-14 (Component Header & Props)**:
  - **Basic Function**: Defines the Pagination function component and its expected props.
  - **Detailed Explanation**: Receives pagination properties (`page`, `limit`, `total`, `totalPages`, `hasNext`, `hasPrev`) along with callbacks (`onPageChange`, `onLimitChange`) and the optional `limitOptions` array (defaulting to `[5, 10, 25, 50]`).
- **Line 15 (Guard Clause)**:
  - **Basic Function**: Prevents rendering if data is empty.
  - **Detailed Explanation**: If `total` is missing or is `0`, returns `null` to hide the pagination UI.
- **Lines 17-36 (Visible Page Array Calculation)**:
  - **Basic Function**: Calculates which page number buttons to show.
  - **Detailed Explanation**: Defines helper `getPageNumbers`. It targets a max of 5 visible pages. If totalPages is less than 5, it returns an array from 1 to `totalPages`. Otherwise, it calculates `start` and `end` offsets around the active `page` value, correcting for boundary overflows. Returns an array of visible page indexes.
- **Lines 38-46 (Record Information Text)**:
  - **Basic Function**: Renders description statistics.
  - **Detailed Explanation**: Displays a text block highlighting the index range of current items being viewed (using `(page - 1) * limit + 1` for start and `page * limit` capped at `total` for end) out of the total record count.
- **Lines 49-64 (Limit Selector Dropdown)**:
  - **Basic Function**: Renders a dropdown selector to modify row display limits.
  - **Detailed Explanation**: If `onLimitChange` is supplied, renders a select block. Sets its value to `limit`. On selection change, it converts the selected value to a number and fires `onLimitChange(newValue)`. Iterates over `limitOptions` to render standard `<option>` tags.
- **Lines 66-98 (Page Control Buttons)**:
  - **Basic Function**: Renders the previous, page number, and next button navigation controls.
  - **Detailed Explanation**:
    - Renders the previous page button: when clicked, calls `onPageChange(page - 1)` (bounded by 1); disabled if `hasPrev` is false.
    - Loops over the calculated pages array to render numeric buttons: highlighted in indigo if active, triggering `onPageChange(pageNum)` on click.
    - Renders the next page button: when clicked, calls `onPageChange(page + 1)` (bounded by `totalPages`); disabled if `hasNext` is false.
