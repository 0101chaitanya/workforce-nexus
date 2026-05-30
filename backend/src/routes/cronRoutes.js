/**
 * @file cronRoutes.js
 * @description API endpoints for serverless cron execution.
 */

const express = require("express");
const router = express.Router();
const cronController = require("../controllers/cronController");
const { authLimiter } = require("../middleware/rateLimiter");

// The cron service (e.g. Vercel Cron) will send a GET or POST request to trigger this.
router.get("/daily-attendance", authLimiter, cronController.dailyAttendanceCron);
router.post("/daily-attendance", authLimiter, cronController.dailyAttendanceCron);

module.exports = router;
