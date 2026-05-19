const express = require("express");
const { protect, isAuthorized } = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/dashboardController");

const router = express.Router();

router.use(protect); // Ensure user is authenticated

router.get("/stats", isAuthorized("owner"), dashboardController.getDashboardStats);

module.exports = router;