# Employee Management System

A comprehensive, full-stack web application designed for business owners to manage their organization's employees, attendance, leaves, and payroll processing. Employees get a dedicated dashboard to punch in/out, view their payslips, and apply for leaves.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

## Features

- **Role-Based Dashboards**: Distinct interfaces and capabilities for `owner` and `employee` roles.
- **Attendance Tracking**: Real-time clock-in/out with automated daily reconciliation.
- **Leave Management**: Employees apply for leaves; owners review, approve, or reject.
- **Payroll Generation**: Automated generation of comprehensive PDF payslips.
- **Serverless Ready**: The system runs cron jobs via external triggers (e.g. Vercel Cron) allowing the backend to scale to zero.

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
