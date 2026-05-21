const express = require("express");
const { protect, isAuthorized } = require("../middleware/authMiddleware");
const { validate, validateQuery } = require("../middleware/validationMiddleware");
const leaveSchemas = require("../schemas/leaveSchemas");
const leaveController = require("../controllers/leaveController");

const router = express.Router();

router.use(protect); // All leave routes are protected

// Employee & Owner routes
router.post("/apply", validate(leaveSchemas.applyLeave), leaveController.applyLeave);
router.get("/history", validateQuery(leaveSchemas.historyQuery), leaveController.getLeaveHistory);

// Owner only routes
router.put("/:leaveId/status", isAuthorized(), validate(leaveSchemas.updateLeaveStatus), leaveController.updateLeaveStatus);

module.exports = router;