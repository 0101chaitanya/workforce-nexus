const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { validateQuery } = require("../middleware/validationMiddleware");
const ownerSchemas = require("../schemas/ownerSchemas");
const payrollController = require("../controllers/payrollController");

const router = express.Router();

router.use(protect); // All payroll routes are protected

router.get("/history", validateQuery(ownerSchemas.historyQuery), payrollController.getPayrollHistory);

module.exports = router;
