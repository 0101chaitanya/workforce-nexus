# Technical Story: Caching Strategies

This document explains the caching mechanisms used across the Employee Management System to optimize performance, minimize database queries, and provide a fast, responsive user interface.

---

## 1. Frontend State Caching (Redux)

The application relies heavily on **Redux** for caching data on the client side. This prevents unnecessary API calls when users navigate back and forth between tabs (e.g., Dashboard, Payroll, Attendance, Leaves).

### A. Mechanism
When a component mounts (e.g., the Employee Leaves view or Owner Dashboard), it checks the Redux store for existing data.

- **`isCached` Flag**: Slices in the Redux store maintain an `isCached` boolean to indicate if data has already been fetched.
- **`cachedParams` Object**: For paginated or filtered views, the store retains the parameters used for the last fetch (e.g., `page`, `limit`, `targetUserId`).

### B. Cache Verification Logic
Before making an API call, components verify if the requested parameters match the cached parameters:

```javascript
// Example: Cache Verification in Employee Leaves or Payroll
if (!force && isCached && cachedParams &&
    cachedParams.page === page &&
    cachedParams.limit === limit &&
    cachedParams.targetUserId === targetUserId) {
    // Bypass API call and use data from Redux store
    return;
}
```

### C. Forced Invalidation (Cache Bypass)
When a user modifies data (such as submitting a new leave request or updating their profile), the frontend must invalidate the cache to retrieve fresh data.

- **Forced Refresh**: Components pass a `force = true` parameter to their fetch actions (`fetchLeaves(true)`, `fetchProfileDetails(true, true)`).
- **On-Demand Refresh**: Views like the Owner Dashboard include a manual **Refresh** button that triggers an API call with `force = true`, bypassing the cache to fetch real-time updates.
- **Invalidation on Logout**: Actions like `invalidateCache()` reset `isCached` to `false` when a session ends to ensure data security.

---

## 2. Backend Caching

The backend incorporates several caching techniques to optimize database load and connection management.

### A. Connection Pool Caching (Multi-Tenancy)
In a multi-tenant architecture, establishing a new database connection per request is expensive. The backend caches active Mongoose connection pools in memory:

```javascript
// Example: Connection caching
const tenantDB = connections[tenantId] || mongoose.createConnection(tenantURI, options);
connections[tenantId] = tenantDB; // Cache the connection for subsequent requests
```

### B. Data Model Caching
Certain frequently accessed but rarely modified attributes are cached directly on database models to avoid complex aggregations or joins:
- **Employee Gross Salary**: Cached directly on the `User` model, reducing the need to compute or join payroll schemas dynamically for simple profile queries.

### C. Redis Caching
For static or high-volume metadata requests, the backend implements **Redis** caching.
- **Public Company Profiles**: Data that doesn't change frequently (like public company metadata) is cached in Redis to serve requests rapidly without hitting the primary database layer.

---

## Summary

By combining **Redux-based frontend caching** for seamless UI navigation and **in-memory/Redis backend caching** for optimized resource management, the system significantly reduces latency and database overhead.
