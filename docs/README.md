# Employee Management System - Documentation Map

Welcome to the documentation suite of the Employee Management System. This folder mirrors the project's layout, providing a detailed guide to every backend and frontend component, the patterns used, and their coordination.

## Directory Structure & Maps

### 📂 Backend
Detailed documentation for the Node.js/Express and MongoDB backend API:
- **Core Server Entry**: [index.js.md](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/backend/src/index.js.md)
- **Routes**: [routes/](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/backend/src/routes/) — Guides to API endpoints for auth, company, leaves, payroll, attendance, etc.
- **Controllers**: [controllers/](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/backend/src/controllers/) — Houses endpoint handlers and business logic.
- **Models**: [models/](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/backend/src/models/) — Defines Mongoose database schemas.
- **Schemas**: [schemas/](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/backend/src/schemas/) — Request validation schema validation definitions.
- **Middleware**: [middleware/](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/backend/src/middleware/) — Auth validation and middleware filters.
- **Utils**: [utils/](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/backend/src/utils/) — Token generation, logging, emailing, and utility utilities.

### 📂 Frontend
Detailed documentation for the React + Vite + Tailwind + Redux-toolkit frontend client:
- **App Entry & Routes**: [App.jsx.md](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/App.jsx.md)
- **App Store & Core**: [app/](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/app/) — Redux store configuration and Axios network interceptor setup.
- **Common Components**: [components/](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/components/) — Shared layouts and custom UI widgets.
- **Feature Modules**: [features/](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/) — Slice files and views partitioned by user domain:
  - **Authentication**: `auth/` (Login, Register, auth state slice)
  - **Employees Management**: `employees/` (Owner dashboard)
  - **Attendance Module**: `attendance/` (Check-in/Check-out flows for Owners & Employees)
  - **Leaves Management**: `leaves/` (Leave applications, approvals, records)
  - **Payroll Module**: `payroll/` (Salary structures, slips, and payroll distribution)
  - **Organization Setting**: `organization/` (Company profile configurations)
  - **Reports / Dashboards**: `reports/` (Statistics dashboards)

---

## Architecture Flow Overview
1. **Network Layer**: Frontend components invoke async endpoints via [axiosInterceptors.js](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/app/axiosInterceptors.js.md), which injects credentials and automatically attempts JWT access token regeneration upon `401 Unauthorized` responses.
2. **Request Security**: Backend validates headers via [authMiddleware.js](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/backend/src/middleware/authMiddleware.js.md) (extracting bearer tokens) and filters request payloads using schema validation [validationMiddleware.js](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/backend/src/middleware/validationMiddleware.js.md).
3. **Database Interactions**: Backend controllers coordinate CRUD tasks with MongoDB using [Mongoose models](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/backend/src/models/).

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Introduction**: Welcomes the developer and outlines the purpose of the documentation map.
2. **Directory Structure & Maps**: Indexes documentation files for backend and frontend.
3. **Architecture Flow Overview**: Outlines request lifecycle across frontend and backend.

- **Lines 1-4 (Introduction)**:
  - **Basic Function**: State the purpose of the documentation directory.
  - **Detailed Explanation**: Lines 1-3 declare the title and general overview of the documentation map structure, stating that it mirrors the main project structure.
  - **Key Function Calls**: None
- **Lines 5-30 (Directory Structure & Maps)**:
  - **Basic Function**: Provide hyperlinks to documentation sections.
  - **Detailed Explanation**: Tabulates documentation links for Backend modules (Lines 7-15) covering routes, controllers, models, schemas, middleware, and utils, and Frontend modules (Lines 17-29) covering core App entrypoint, state management slices, common UI components, and domain features.
  - **Key Function Calls**: None
- **Lines 33-37 (Architecture Flow Overview)**:
  - **Basic Function**: Summarize the system's request and security lifecycle.
  - **Detailed Explanation**: Explains how Axios network layers (Line 34) interact with JWT validation middleware (Line 35), and Mongoose database model operations (Line 36).
  - **Key Function Calls**: None
