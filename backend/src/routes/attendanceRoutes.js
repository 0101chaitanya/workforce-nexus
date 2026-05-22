const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { validateQuery } = require("../middleware/validationMiddleware");
const ownerSchemas = require("../schemas/ownerSchemas");
const attendanceController = require("../controllers/attendanceController");

const router = express.Router();

router.use(protect); // All attendance routes are protected

router.post("/clock-in", attendanceController.clockIn);
router.put("/clock-out", attendanceController.clockOut);
router.post("/verify-proximity", attendanceController.verifyProximity);
router.get("/history", validateQuery(ownerSchemas.historyQuery), attendanceController.getAttendanceHistory);

module.exports = router;
