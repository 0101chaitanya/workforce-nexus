# Employee Management System

A comprehensive, full-stack web application designed for business owners to manage their organization's employees, attendance, leaves, and payroll processing. Employees get a dedicated dashboard to punch in/out, view their payslips, and apply for leaves.

## Table of Contents
- [Live Demo](#live-demo)
- [Features](#features)
- [Architecture](#architecture)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

## Live Demo

- **Frontend Application**: [https://employee-management-system-ne1z.vercel.app/login](https://employee-management-system-ne1z.vercel.app/login)
- **Backend API**: [https://employee-management-system-five-gules.vercel.app](https://employee-management-system-five-gules.vercel.app/)

## Features

### 🔐 Authentication & Authorization
- **Role-Based Access Control**: Distinct capabilities and dashboards for `owner` and `employee` roles.
- **Secure Authentication**: JWT-based access and refresh token rotation with HTTP-only cookies.
- **Email Verification & OTP**: Secure login and password recovery flows using Resend SDK.

### 🏢 Organization & Employee Management
- **Company Setup**: Owners can configure organization details, settings, and work hours.
- **Employee Onboarding**: Owners can invite/create new employees with assigned roles and departments.
- **Profile Management**: Users can manage their personal information and view their employment details.
- **Dashboard Analytics**: Quick statistical overviews for owners (total employees, active leaves, today's attendance) and personalized summaries for employees.

### ⏰ Attendance Tracking
- **Real-Time Clock In/Out**: Employees can record their daily attendance directly from their dashboard.
- **Automated Daily Reconciliation**: Background cron jobs automatically mark un-clocked employees as absent.
- **Attendance History**: Detailed logs of daily working hours, late arrivals, and early departures.

### 🏖️ Leave Management
- **Leave Applications**: Employees can request leaves with specific dates and reasons.
- **Approval Workflow**: Owners can review, approve, or reject leave requests.
- **Leave Balances**: Tracking of taken vs. available leaves based on company policies.

### 💸 Payroll Processing
- **Salary Configuration**: Set base salaries, allowances, and deductions per employee.
- **Automated Payslip Generation**: Compile monthly attendance, leaves, and salary data into comprehensive records.
- **PDF Export**: Generate formatted PDF payslips that employees can download.

### 📊 Reporting
- **Comprehensive Reports**: Insights into attendance trends, leave patterns, and payroll expenditures.
- **Data Export**: Ability to generate and export structured data summaries.

### ☁️ Infrastructure
- **Serverless Ready**: Optimized for serverless deployments (e.g., Vercel) with stateless endpoints.
- **Scheduled Cron Jobs**: Secure, external-trigger ready cron endpoints for automated system tasks.

## Architecture

This is a Monorepo containing a full MERN stack application.

### `frontend/`
- React (Vite) Single Page Application
- Tailwind CSS for modern, responsive styling
- React Router for protected routing

### `backend/`
- Node.js & Express API Server
- MongoDB (Mongoose) for database operations
- JWT Authentication (Access + Refresh token rotation)
- Resend SDK for transactional emails (e.g. OTPs)

## Environment Variables

To run the application locally, you must provide `.env` files in both the `frontend` and `backend` directories.

### Backend (`backend/.env`)
These variables configure the server, database connection, and security tokens.

| Variable | Description |
| :--- | :--- |
| `MONGODB_URI` | The connection string to your MongoDB cluster (e.g. Atlas). |
| `FRONTEND_URL` | The URL of your frontend app (e.g., `http://localhost:5173`). Used for CORS settings. |
| `PORT` | The port the Express server will run on (e.g., `3000`). |
| `JWT_TOKEN` | Secret key used to sign the short-lived access token. |
| `JWT_REFRESH_TOKEN`| Secret key used to sign the long-lived refresh token. |
| `NODE_ENV` | `development` or `production`. In production, cookies enforce `secure: true` and `sameSite: "none"`. |
| `RESEND_API_KEY` | Your Resend API key for sending transactional emails. |
| `RESEND_FROM_EMAIL`| The email address that emails will be sent from. |
| `CRON_SECRET` | *(Optional)* Secret token to secure the `/api/cron/daily-attendance` endpoint from unauthorized invocations. |

### Frontend (`frontend/.env`)
These variables define where the client application sends API requests.

| Variable | Description |
| :--- | :--- |
| `VITE_BACKEND_URL` | The base URL of the backend API (e.g. `http://localhost:3000/api`). |

## Deployment

The application is optimized for Serverless platforms like Vercel.

1. **Frontend**: Deploy the `frontend/` folder directly to Vercel. The `vercel.json` file inside ensures proper React SPA routing.
2. **Backend**: Deploy the `backend/` folder to Vercel. The `vercel.json` configuration wraps the Express server into a serverless function. Configure the Vercel Cron feature to invoke `/api/cron/daily-attendance` nightly.
