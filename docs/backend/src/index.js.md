# backend/src/index.js

## 1. Overview
`backend/src/index.js` is the main entry point for the backend web server. It loads configuration, connects to the MongoDB database, registers logging and request-parsing middleware, registers routing systems, and starts the Express server.

## 2. Key Responsibilities & Flow
1. **Config Loads**: Loads variables via `dotenv.config()`.
2. **Database Initialization**: Invokes `connectDB()` from `./config/db` to connect to MongoDB.
3. **Middleware Registration**:
   - Registers `morgan` combined with a custom `winston` transport write stream to pipe HTTP request logs into the logger.
   - Sets up `cors` middleware, specifying allowed origins matching `process.env.FRONTEND_URL` and configuring it to permit credential transfer (cookies) and specific HTTP methods/headers.
   - Configures `cookie-parser` for handling HTTP-only cookie tokens.
   - Enables JSON and URL-encoded request body parsing.
4. **Route Registration**: Maps base paths to corresponding sub-routers:
   - `/api/auth` -> `authRoutes`
   - `/api/attendance` -> `attendanceRoutes`
   - `/api/payroll` -> `payrollRoutes`
   - `/api/users` -> `userRoutes`
   - `/api/company` -> `companyRoutes`
   - `/api/leaves` -> `leaveRoutes`
   - `/api/dashboard` -> `dashboardRoutes`
5. **Server Bind**: Binds the server to listen on the port specified by `process.env.PORT`.

## 3. Code Patterns & Best Practices
- **Pipeline Middleware Architecture**: Implements a standard middleware chain in Express.
- **Unified Logging**: Integrates HTTP request logs (`morgan`) with system log files (`winston`) to maintain a single stream of server metrics and errors.
- **Secure CORS Policies**: Instead of allowing wildcard origins (`*`), CORS restricts access to `process.env.FRONTEND_URL` to prevent unauthorized cross-origin requests while enabling cookie exchange.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Listens on `PORT` and answers API inquiries issued from `frontend/src/app/axiosInterceptors.js`.
- Dictates CORS settings so that requests originating from the `FRONTEND_URL` (usually localhost:5173) are accepted.
- Coordinates all endpoints that components (such as `Login`, `Register`, `OwnerEmployees`, etc.) rely on.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Lines 1-13 (Imports and Configuration)**: Import external modules (express, cors, dotenv, cookie-parser, morgan, path), custom database connector, and custom logger, and call `dotenv.config()` to load settings from `.env`.
2. **Lines 14-22 (Route Imports)**: Require sub-routers for auth, attendance, payroll, users, leaves, company, and dashboard.
3. **Lines 23-24 (Database Connection)**: Call `connectDB()` to connect Mongoose to the MongoDB database.
4. **Lines 25-40 (Global Middleware Registration)**: Apply HTTP request logger (Morgan) integrated with Winston, CORS config, Cookie-Parser, JSON body parser, and URL-encoded body parser to the Express application.
5. **Lines 41-49 (API Route Mapping)**: Register all sub-routers to their respective `/api/...` base paths.
6. **Lines 50-53 (Server Startup)**: Start listening for HTTP requests on the specified port.

- **Lines 1-13 (Imports and Configuration)**:
  - **Basic Function**: Load modules, libraries, configurations, and environment variables.
  - **Detailed Explanation**: Imports `express` and initializes the application (`app = express()`). It also imports `cors` for cross-origin security, `dotenv` for env variables, `connectDB` for database connection, `cookieParser` for cookies, `morgan` for HTTP logging, `logger` (custom winston wrapper) for custom logging, and `path` for directories. Calls `dotenv.config()` to populate `process.env`.
  - **Key Function Calls**:
    - `require(module)`: Node.js CommonJS standard function to load modules. Loaded modules: `express`, `cors`, `dotenv`, `./config/db`, `cookie-parser`, `morgan`, `./utils/logger`, and `path`. Returns the imported module exports.
    - `express()`: Initializes an Express application instance. Returns the Express application object (`app`).
    - `dotenv.config()`: Loads and parses key-value pairs from the `.env` file in the current working directory, appending them to `process.env`. Returns an object containing the parsed variables or an error.
- **Lines 14-22 (Route Imports)**:
  - **Basic Function**: Import route definitions for all features.
  - **Detailed Explanation**: Imports routers for `/api/auth`, `/api/attendance`, `/api/payroll`, `/api/users`, `/api/leaves`, `/api/company`, and `/api/dashboard` from their respective files.
  - **Key Function Calls**:
    - `require(module)`: Loads the sub-router modules: `./routes/authRoutes`, `./routes/attendanceRoutes`, `./routes/payrollRoutes`, `./routes/userRoutes`, `./routes/leaveRoutes`, `./routes/companyRoutes`, and `./routes/dashboardRoutes`. Returns the Express Router objects.
- **Lines 23-24 (Database Connection)**:
  - **Basic Function**: Connect to MongoDB.
  - **Detailed Explanation**: Invokes the `connectDB()` function which uses mongoose to connect to the MongoDB instance using connection options.
  - **Key Function Calls**:
    - `connectDB()`: Calls the database connection routine imported from `./config/db` to connect Mongoose to the MongoDB database. Returns a Promise.
- **Lines 25-40 (Global Middleware Registration)**:
  - **Basic Function**: Set up utility middlewares for logging, security, and payload parsing.
  - **Detailed Explanation**: Employs Morgan HTTP logger in `'dev'` mode, piping output streams through custom `logger.http`. Configures CORS to allow incoming requests specifically from `FRONTEND_URL` while enabling cookies/credentials. Applies `cookie-parser` to parse cookies, `express.json()` to parse JSON payloads, and `express.urlencoded()` to parse URL-encoded payloads.
  - **Key Function Calls**:
    - `app.use(middleware)`: Mounts a middleware function globally on the Express application. Returns the Express application object.
    - `morgan('dev', options)`: Initializes Morgan request logger in developer mode. The stream option is configured to redirect logs. Returns the Morgan middleware function.
    - `message.trim()`: Standard String prototype method. Trims whitespace and newlines from Morgan log lines. Returns the clean string.
    - `logger.http(message)`: Custom Winston wrapper logging method. Logs HTTP request information at the HTTP level. Returns the logger instance.
    - `cors(options)`: Configures CORS settings with custom allowed origins, credentials support, and standard HTTP headers and methods. Returns the CORS middleware function.
    - `cookieParser()`: Initializes cookie parser middleware to extract and populate cookies in `req.cookies`. Returns the cookie parser middleware function.
    - `express.json()`: Express built-in middleware that parses incoming requests with JSON payloads, populating `req.body`. Returns the JSON parser middleware function.
    - `express.urlencoded({ extended: true })`: Express built-in middleware that parses URL-encoded body payloads (supporting nested structures), populating `req.body`. Returns the URL-encoded parser middleware function.
- **Lines 41-49 (API Route Mapping)**:
  - **Basic Function**: Mount feature routes onto prefix paths.
  - **Detailed Explanation**: Configures Express paths `/api/auth`, `/api/attendance`, `/api/payroll`, `/api/users`, `/api/company`, `/api/leaves`, and `/api/dashboard` to route traffic into their respective imported router modules.
  - **Key Function Calls**:
    - `app.use(prefix, router)`: Mounts specialized sub-routers to specific base path prefixes on the application. Returns the Express application object.
- **Lines 50-53 (Server Startup)**:
  - **Basic Function**: Start the server to listen on the configured port.
  - **Detailed Explanation**: Listens on `process.env.PORT` for incoming client requests, printing a success message using the custom winston logger once the server begins running.
  - **Key Function Calls**:
    - `app.listen(port, callback)`: Starts the HTTP server listening on the specified port. Invokes the callback function once the server starts. Returns an `http.Server` instance.
    - `logger.info(message)`: Custom Winston wrapper logging method. Logs a server startup confirmation message at information level. Returns the logger instance.

