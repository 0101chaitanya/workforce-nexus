const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const authSchemas = require("../schemas/authSchemas");
const {
  sendOtp,
  verifyOtp,
  register,
  login,
  logout,
  regenerateAccessToken,
  testGet
} = require("../controllers/authController");

const router = express.Router();

// --- Authentication ---
router.post("/login", validate(authSchemas.login), login);
router.post("/logout", logout);
router.post("/register", validate(authSchemas.register), register);

// --- OTP & Verification ---
router.post("/send-otp", validate(authSchemas.sendOtp), sendOtp);
router.post("/verify-otp", validate(authSchemas.verifyOtp), verifyOtp);

// --- Token Management ---
router.post("/regenerate-refresh-token", regenerateAccessToken);

// --- Profile / Protected Resources ---
router.get("/me", protect, testGet);

module.exports = router;