# Backend Environment Configuration

This document describes the environment variables required to run the backend of the Employee Management System.

You should create a `.env` file in the root of the `backend` directory containing these variables.

## Environment Variables

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `MONGODB_URI` | The connection string for the MongoDB database. | `mongodb+srv://<username>:<password>@cluster...` |
| `FRONTEND_URL` | The URL where the frontend application is hosted (used for CORS). | `http://localhost:5173` |
| `PORT` | The port number on which the Express server will listen. | `3000` |
| `JWT_TOKEN` | The secret key used to sign and verify access JWTs. | `your_jwt_secret_key` |
| `JWT_REFRESH_TOKEN` | The secret key used to sign and verify refresh JWTs. | `your_jwt_refresh_secret_key` |
| `EMAIL` | The sender email address used for outbound emails (e.g., sending OTPs). | `admin@example.com` |
| `PASSWORD` | The password or App Password for the sender email address. | `your_email_app_password` |
| `NODE_ENV` | The environment the app is running in (e.g., `development`, `production`). | `development` |

## `.env.example`

Below is an example of what your `.env` file might look like:

```env
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/ems?appName=Cluster0"
FRONTEND_URL="http://localhost:5173"
PORT=3000
JWT_TOKEN="your_jwt_secret_key"
JWT_REFRESH_TOKEN="your_jwt_refresh_secret_key"
EMAIL="admin@example.com"
PASSWORD="your_email_app_password"
NODE_ENV="development"
```

> **Note**: Be careful not to commit your actual `.env` file to version control, as it contains sensitive credentials. Ensure `.env` is listed in your `.gitignore` file.
