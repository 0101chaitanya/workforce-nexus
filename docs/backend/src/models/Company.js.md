# backend/src/models/Company.js

## 1. Overview
The `Company` model acts as the organizational boundary in the database, partitioning employees, payroll structures, leaves, and attendance logs.

## 2. Key Responsibilities & Flow
- **Fields & Constraints**:
  - `companyName`: Required, unique, trimmed string.
  - `email`: Required, unique, lowercase email string.
  - `isVerified`: Boolean flag used during registration workflows. Defaults to `false`.
  - `owner`: ObjectId referencing the `User` model (specifically role: 'owner').
  - `logo`: ObjectId (intended for file storage referencing gridfs or static assets).
  - `address`, `phone`: Contact information.
- **Timestamps**:
  - Automatically records creation and update timestamps via `{ timestamps: true }`.

## 3. Code Patterns & Best Practices
- **Data Partitioning Boundaries**: All transactional schemas (`User`, `Leave`, `Attendance`, `Payroll`) index against a `Company` reference. This enables multi-tenant database designs where queries are filtered by `req.company._id`.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Populates company info displayed on the dashboard header and side panels.
- Configured by owners in the frontend organization manager view ([OwnerOrganization.jsx](file:///Users/0101chaitanya/EmployeeManagementSystem/EmployeeManagementSystem/docs/frontend/src/features/organization/OwnerOrganization.jsx.md)).

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports**: Imports Mongoose library for schema structures.
2. **Company Schema Declaration**: Specifies data types, indexes, and constraints for company entities.
3. **Model Instantiation & Export**: Compiles and exports the Company model.

- **Lines 1-2 (Imports)**:
  - **Basic Function**: Import dependency.
  - **Detailed Explanation**: Imports `mongoose` (Line 1) to create the schema and build the model.
  - **Key Function Calls**:
    - `require('mongoose')`: Loads the Mongoose library to provide MongoDB object modeling and schema definition. Returns the Mongoose module object.
- **Lines 3-25 (Company Schema Declaration)**:
  - **Basic Function**: Define company attributes and validation constraints.
  - **Detailed Explanation**: Declares `companySchema` (Line 3). It defines `companyName` as a required, unique, and trimmed String (Lines 4-6). It requires `email` as a unique, lowercase String (Lines 7-9). It sets `isVerified` as a Boolean defaulting to false (Lines 10-12). It defines `owner` as a User collection reference ObjectId (Lines 13-15). It includes an optional `logo` file identifier (Lines 16-18), contact `address` (Lines 19-21), and contact `phone` number (Lines 22-24). The schema is configured with `timestamps: true` (Line 25) to auto-populate `createdAt` and `updatedAt`.
  - **Key Function Calls**:
    - `new mongoose.Schema(definition, options)`: Constructor called to define the Company schema layout and constraints (such as `timestamps: true`). Returns a Schema instance.
- **Lines 27-28 (Model Instantiation & Export)**:
  - **Basic Function**: Compile and export the database model.
  - **Detailed Explanation**: Compiles the model named `Company` using `companySchema` (Line 27) and exports it (Line 28) for application-wide use.
  - **Key Function Calls**:
    - `mongoose.model('Company', companySchema)`: Compiles the `companySchema` into a model constructor named `'Company'`. Returns a Model constructor object to interact with the companies collection in MongoDB.
