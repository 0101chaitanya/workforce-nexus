# Technical Story: Optimizations

This document highlights the various optimization strategies and architectural decisions implemented in the Employee Management System to ensure a high-performing, scalable, and responsive application.

---

## 1. Frontend Caching & State Management

To provide a seamless user experience and minimize unnecessary network requests, the frontend heavily leverages **Redux Toolkit** for state management and caching.

* **Cache Hit Verification**: When navigating between views (e.g., Dashboard, Leaves, Payroll), components verify if the required data is already present in the Redux store by checking the `isCached` flag and `cachedParams`. If a match is found, the API call is bypassed.
* **On-Demand Invalidation**: Data is only re-fetched when a user explicitly requests a refresh or when an action modifies the underlying data (e.g., applying for a leave), ensuring that the UI remains fast without sacrificing accuracy.

## 2. API Pagination & Lazy Loading

To optimize database throughput and minimize network payloads, all grid views and lists (Attendance, Leaves, Payroll, Employees) implement strict **End-to-End Pagination**.

* **Backend Optimization**: The API endpoints utilize Mongoose's `.skip()` and `.limit()` methods to fetch only the requested subset of data. This prevents massive payloads from being loaded into memory or transmitted over the network.
* **Frontend Handling**: Redux slices maintain pagination states (`page`, `limit`, `totalPages`) locally, and the UI only requests the specific chunks of data needed for the current view.

## 3. Backend Caching Strategies

The backend incorporates several in-memory and external caching techniques to optimize database operations.

* **Connection Pool Caching**: In a multi-tenant environment, creating new database connections per request is expensive. The backend caches active Mongoose connection pools in memory to reuse them across subsequent requests.
* **Redis Caching**: Static or frequently requested data that rarely changes (like public company profiles) is cached in Redis, bypassing the primary MongoDB database entirely for these requests.
* **Model-Level Caching**: Commonly accessed derived values (e.g., Gross Salary) are pre-calculated and cached directly on the user model to avoid complex aggregations during simple profile fetches.

## 4. Stateless Architecture for Serverless

The system is optimized for serverless deployments (such as Vercel) by maintaining a completely **stateless architecture**.

* **JWT Authentication**: Instead of relying on stateful server sessions (which would require a centralized session store and add latency), the application uses JWT-based access and refresh token rotation. Tokens are stored securely in HTTP-only cookies, allowing any serverless function instance to verify a request independently.
* **Cold Start Mitigation**: By keeping the API endpoints lightweight and stateless, the impact of serverless cold starts is minimized.

## 5. Background Task Offloading (Cron Jobs)

Resource-intensive and periodic tasks are decoupled from user requests and handled via background jobs.

* **Automated Reconciliation**: The daily attendance reconciliation process (marking absent employees) is triggered by an external cron job (e.g., Vercel Cron) hitting a secured endpoint. This ensures that the heavy computation and database updates happen asynchronously in the background, rather than slowing down user-facing endpoints.

## 6. Rate Limiting and Traffic Control

To protect serverless resources and prevent API abuse (such as OTP spamming or brute-force attacks), strict traffic control is implemented at the middleware level.

* **MongoDB-Backed Rate Limiting**: The backend uses `express-rate-limit` combined with `rate-limit-mongo`. This persists the hit counts in MongoDB rather than in-memory, ensuring that rate limits are accurately enforced across multiple serverless function instances and cold starts.
* **Granular Constraints**: A broad global limit (e.g., 100 requests / 15 mins) protects the entire `/api/` surface, while sensitive authentication routes and cron triggers have much stricter limits (e.g., 5 requests / 15 mins).
* **Frontend Handling**: The frontend's global error utility (`toastHelper.js`) specifically intercepts `429 Too Many Requests` responses. It displays a consolidated warning toast with a unique `toastId`, ensuring the user's screen isn't overwhelmed by duplicate notifications if multiple requests fail simultaneously.
