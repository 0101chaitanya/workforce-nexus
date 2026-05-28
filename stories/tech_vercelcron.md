# Technical Documentation: Vercel Cron Integration

This document explains how the Employee Management System integrates with **Vercel Cron Jobs** to execute scheduled backend tasks in a serverless environment.

## 1. The Problem with Traditional Cron

Historically, Node.js applications use libraries like `node-cron` to schedule background tasks. This approach requires the Node process to be running 24/7. 

However, in modern Serverless deployments (like Vercel functions) or PaaS "Free Tiers" (like Render), the server spins down to sleep when there is no incoming traffic. If the server is asleep at 11:55 PM, the internal `node-cron` timer will never fire, and critical tasks (like daily attendance reconciliation) will fail.

## 2. The Serverless Solution

To guarantee execution regardless of server state, the cron logic was decoupled into a standard REST API endpoint:
`POST /api/cron/daily-attendance`

Instead of relying on the backend to track time, we rely on an external scheduler (like Vercel Cron) to hit this endpoint at the correct time. When the request comes in, the serverless function wakes up, executes the logic, and goes back to sleep.

## 3. Configuring Vercel Cron

If the frontend (or an API gateway) is deployed on Vercel, you can configure Vercel's edge network to automatically invoke your backend endpoint by creating a `vercel.json` file in your project root.

### Example `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-attendance",
      "schedule": "55 23 * * *"
    }
  ]
}
```
- **`path`**: The URL path Vercel will request.
- **`schedule`**: A standard POSIX cron expression defining when the job runs (in this case, 11:55 PM daily).

*Note: Vercel defaults to UTC time. If your company operates in IST, you must adjust the cron expression to account for the timezone offset, or rely on a timezone-aware service like Cron-job.org instead.*

## 4. Security (`CRON_SECRET`)

Because the cron job is exposed as a public URL (`/api/cron/daily-attendance`), a malicious user could hit the endpoint repeatedly to trigger the logic. 

To secure it, Vercel automatically injects an `Authorization` header containing a secure token. 
The backend verifies this token:
```javascript
const authHeader = req.headers['authorization'];
if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: "Unauthorized" });
}
```
If deploying to a service other than Vercel, you should manually define a `CRON_SECRET` environment variable and configure your external pinging service (like Cron-job.org) to pass that secret in the headers.
