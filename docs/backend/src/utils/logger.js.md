# backend/src/utils/logger.js

## 1. Overview
`backend/src/utils/logger.js` implements a structured logging system using the `winston` logging framework. It replaces generic `console.log` messages with level-based logging (info, error, debug, etc.) and archives outputs to error and combined log files.

## 2. Key Responsibilities & Flow
- **Logging Level Determination**: Sets the default logging level to `info` in production and `debug` in development.
- **Log Formatting**:
  - Automatically captures stack traces for exceptions (`errors({ stack: true })`).
  - Serializes logs into a standard string: `${timestamp} ${level}: ${stack || message}`.
- **Transport Outputs**:
  - **`error.log`**: Standard file transport catching warnings and errors.
  - **`combined.log`**: Standard file transport archiving all logs.
  - **Console Out**: Active in non-production environments with custom console colorizations.

## 3. Code Patterns & Best Practices
- **Structured Error Handling**: Utilizes Winston's standard error format modifier to catch thrown Error objects and print stack traces instead of generic `[object Object]` strings.
- **Environment Aware Log Piping**: Prevents console clutter in production while keeping file-based audit trails intact.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- This utility is backend-only. It archives request and server metadata including parameters sent by frontend axios operations and records any database connection anomalies.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports**: Imports Winston logging packages and path helper.
2. **Custom Format Definition**: Formats how log messages and stack traces are displayed.
3. **Logger Instantiation**: Configures logging levels, global formats, and log file destinations.
4. **Development Console Logger**: Adds colored console output for development environment.
5. **Module Export**: Exports the configured logger instance.

- **Lines 1-4 (Imports)**:
  - **Basic Function**: Import dependencies and extract formatting utilities.
  - **Detailed Explanation**: Imports `winston` (Line 1) for structured logging, `path` (Line 2) for system directory path joining, and extracts helper formatting functions from `winston.format` (Line 4).
- **Lines 6-9 (Custom Format Definition)**:
  - **Basic Function**: Structure output log lines.
  - **Detailed Explanation**: Defines `logFormat` (Line 7) which extracts log properties (`level`, `message`, `timestamp`, `stack`) and formats them into a single string displaying timestamp, level, and the error stack trace if it exists, otherwise the text message (Line 8).
- **Lines 11-29 (Logger Instantiation)**:
  - **Basic Function**: Create and configure the winston logger object.
  - **Detailed Explanation**: Instantiates `logger` using `winston.createLogger` (Line 11). It chooses default logging level dynamically based on `NODE_ENV` (Line 12). It combines timestamp, error parser, and custom log format (Lines 13-17). In `transports`, it defines two file destinations: `error.log` for error level entries (Lines 20-23) and `combined.log` for all logs (Lines 25-27).
- **Lines 31-40 (Development Console Logger)**:
  - **Basic Function**: Enable logging to screen when developing.
  - **Detailed Explanation**: If `NODE_ENV` is not production (Line 32), it calls `logger.add` to register a Console transport (Line 33) with colorization, timestamp formatting, and custom `logFormat` (Lines 34-39).
- **Line 42 (Module Export)**:
  - **Basic Function**: Export the logger module.
  - **Detailed Explanation**: Exports `logger` (Line 42) for application-wide logging.
