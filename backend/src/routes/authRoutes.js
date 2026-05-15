const express = require("express");
const { protect, authorizeRole } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const authSchemas = require("../schemas/authSchemas");
const authController = require("../controllers/authController");

const authRoutes = express.Router();

// authRoutes.post("/send-otp", validate(authSchemas.sendOtp), authController.sendOtp);

module.exports = authRoutes;
