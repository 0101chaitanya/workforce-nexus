const express = require("express");
const { protect, isAuthorized } = require("../middleware/authMiddleware");
const { validateQuery } = require("../middleware/validationMiddleware");
const ownerSchemas = require("../schemas/ownerSchemas");
const payrollController = require("../controllers/payrollController");

const router = express.Router();

router.use(protect); // All payroll routes are protected

router.get("/history", validateQuery(ownerSchemas.historyQuery), payrollController.getPayrollHistory);
router.post("/generate", isAuthorized(), payrollController.generateCompanyPayroll);
router.get("/tenure/download", payrollController.downloadTenurePayslip);
router.get("/:id/download", payrollController.downloadPayslip);
module.exports = router;
