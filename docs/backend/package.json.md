# backend/package.json

## 1. Overview
`backend/package.json` defines the metadata, build scripts, run scripts, runtime dependencies, and development dependencies of the backend Node.js application.

## 2. Key Responsibilities & Flow
### Main Entrypoint
- Specified by `"main": "src/index.js"`. Uses CommonJS (`"type": "commonjs"`).

### Run Scripts
- `npm run start`: Runs the server directly using standard Node.js: `node src/index.js`.
- `npm run dev`: Runs the server in development mode using `nodemon` (with a 2-second reload delay) to automatically restart the server on file changes.

### Key Dependencies
- `express`: Core web application framework for routes and middleware.
- `mongoose` & `mongodb`: Object Document Mapper (ODM) and database driver for MongoDB.
- `bcrypt`: Library for hashing passwords.
- `jsonwebtoken`: Library for generating and verifying JSON Web Tokens (JWT) for authentication.
- `cookie-parser`: Parses Cookie headers and populates `req.cookies`.
- `cors`: Handles Cross-Origin Resource Sharing.
- `dotenv`: Loads environment variables from the `.env` file.
- `zod`: Schema declaration and validation library.
- `winston` & `morgan`: Logging framework and HTTP request logger middleware.
- `nodemailer`: SMTP email dispatch utility (OTPs).
- `generate-password`: Utility for generating temporary random passwords for new users.
- `pdfkit`: Utility for generating PDFs dynamically (e.g. payroll slips).

## 3. Code Patterns & Best Practices
- **Automatic Reloading**: Nodemon dev dependency ensures rapid feedback loops.
- **Strict Validations**: Decouples request schema definitions and routes using the `zod` library.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Corresponds to `frontend/package.json`, matching dependencies conceptually (e.g. JWT-based communication on the front-end via Axios vs JWT parsing on the back-end via jsonwebtoken).

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Metadata & Entrypoint**: Defines package configuration, entry file, and module loading format.
2. **Scripts**: Declares npm start/dev commands for launching the application.
3. **Dependencies**: Specifies external runtime packages used by the application code.
4. **DevDependencies**: Lists development-only tools like Nodemon.

- **Lines 1-7 (Metadata & Entrypoint)**:
  - **Basic Function**: Package identifier and module format definition.
  - **Detailed Explanation**: Declares package name as `ems-backend` (Line 2), version as `1.0.0` (Line 3), privacy settings (Line 4), entrypoint file as `src/index.js` (Line 6), and configuration to use standard CommonJS modules (Line 7).
  - **Key Function Calls**: None
- **Lines 8-11 (Scripts)**:
  - **Basic Function**: Command configurations to start the backend application.
  - **Detailed Explanation**: `start` (Line 9) runs the main entrypoint file directly with Node.js. `dev` (Line 10) uses nodemon to monitor changes in source files and automatically restart the application with a 2-second delay.
  - **Key Function Calls**:
    - `node src/index.js`: Launches the Node.js runtime process to execute the backend entry point.
    - `nodemon --delay 2 src/index.js`: Runs nodemon to monitor file changes in development, restarting the server with a 2-second reload delay.
- **Lines 12-28 (Dependencies)**:
  - **Basic Function**: List of external NPM packages required for runtime execution.
  - **Detailed Explanation**: Includes cryptography library `bcrypt`, cookie parser middleware `cookie-parser`, CORS configuration utility `cors`, environment config loader `dotenv`, router framework `express`, password generator `generate-password`, auth token library `jsonwebtoken`, MongoDB client libraries `mongodb` and `mongoose`, HTTP logger `morgan`, file uploader `multer`, emailer `nodemailer`, PDF generator `pdfkit`, logging framework `winston`, and schema validator `zod`.
  - **Key Function Calls**: None
- **Lines 29-32 (DevDependencies)**:
  - **Basic Function**: Packages required only for development and local testing.
  - **Detailed Explanation**: Specifying `nodemon` (Line 30) as a dev dependency to automate local hot-reloading during backend development.
  - **Key Function Calls**: None
