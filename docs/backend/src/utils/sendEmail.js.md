# backend/src/utils/sendEmail.js

## 1. Overview
`backend/src/utils/sendEmail.js` configures the SMTP mail delivery client using the `nodemailer` package. It provides the core mechanism to mail OTPs, setup parameters, and confirmation messages to users.

## 2. Key Responsibilities & Flow
- Loads settings from environment variables (`process.env.EMAIL` and `process.env.PASSWORD`).
- Configures a nodemailer transport object mapping to `smtp.gmail.com` using secure SSL on port `465`.
- Exports the pre-configured transporter object so that controllers can dispatch emails via `sendMail()`.

## 3. Code Patterns & Best Practices
- **Reusable SMTP Transport Pool**: Creates and exports a single transporter instance, utilizing nodemailer's underlying connection pool for efficiency.
- **Environment Driven Settings**: Uses env variables to keep host credentials externalized.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- This utility does not communicate with the frontend directly. However, it powers the backend's auth OTP generation flow which the frontend requests during registration and login (`Register.jsx`, `Login.jsx`).

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Imports & Configuration**: Imports Nodemailer and loads environment variable configurations.
2. **Mail Transporter Definition**: Initializes the Nodemailer SMTP mail transporter using Gmail configuration.
3. **Module Exports**: Exports the transporter client.

- **Lines 1-2 (Imports & Configuration)**:
  - **Basic Function**: Import dependencies and read environment configurations.
  - **Detailed Explanation**: Imports `nodemailer` (Line 1) for email capabilities and loads configuration files (Line 2) from `.env` using dotenv.
  - **Key Function Calls**:
    - `require("nodemailer")`: Loads the `nodemailer` module. It is called to bring in email transport capabilities. It takes the package name string `"nodemailer"` as an argument and returns the `nodemailer` library object.
    - `require("dotenv")`: Loads the `dotenv` module. It is called to access its configuration loading method. It takes the package name string `"dotenv"` as an argument and returns the `dotenv` library object.
    - `config()`: Configures and loads environment variables. It is called to read the `.env` file at the project root, parse its content, and load it into environment variables. It takes no arguments, has the side effect of updating `process.env`, and returns an object containing either a `parsed` property or an `error`.
- **Lines 4-13 (Mail Transporter Definition)**:
  - **Basic Function**: Define the transporter connection configurations.
  - **Detailed Explanation**: Instantiates `transporter` via `nodemailer.createTransport` (Line 4), setting `service` to gmail (Line 5), SMTP host destination to `smtp.gmail.com` (Line 6), standard port for SSL to `465` (Line 7), and authentication credentials to read from `process.env.EMAIL` and `process.env.PASSWORD` (Lines 9-12).
  - **Key Function Calls**:
    - `nodemailer.createTransport(options)`: Instantiates a nodemailer transporter connection. It is called to set up the connection details for email dispatch. It takes a configuration options object (containing `service`, `host`, `port`, `secure`, and `auth`) as an argument and returns a transporter object.
- **Line 15 (Module Exports)**:
  - **Basic Function**: Export the configured transporter.
  - **Detailed Explanation**: Exports `transporter` (Line 15) using CommonJS syntax so that routes or controllers can send emails by calling `transporter.sendMail()`.
  - **Key Function Calls**: None

