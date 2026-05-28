/**
 * @file index.js
 * @description Main entry point of the backend application. Initializes the Express server, Connects to MongoDB, Setup CORS, Morgan logging, cookie-parser middlewares and loads all api routers.
 */

const express = require('express');
const app = express();

const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require("./config/db");
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const logger = require('./utils/logger');

dotenv.config();

// Load routes
const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const userRoutes = require("./routes/userRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const companyRoutes = require("./routes/companyRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const cronRoutes = require("./routes/cronRoutes");

// In serverless, we don't connect globally at the top level because we need to await it
// per request to prevent Mongoose buffering timeouts.

// Initialize scheduled tasks (Removed for Serverless deployment - now handled via /api/cron endpoints)
// require('./services/cronService');

// Middleware
app.use(morgan('dev', {
    stream: { write: (message) => logger.http(message.trim()) }
}));
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Ensure Database is connected before handling any requests (Serverless Pattern)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        logger.error(`Failed to connect to database: ${error.message}`);
        res.status(500).json({ success: false, message: 'Database connection failed' });
    }
});


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/users", userRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/cron", cronRoutes);

const PORT = process.env.PORT || 3000;

// Only start the server if not running in a serverless environment (like Vercel)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        logger.info(`Server running on http://localhost:${PORT}`);
    });
}

// Export the Express API for Vercel Serverless Functions
module.exports = app;
