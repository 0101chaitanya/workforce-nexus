const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const authSchemas = require("../schemas/authSchemas");
const {
  sendOtp,
  verifyOtp,
  forgotPasswordOtp,
  register,
  login,
  logout,
  regenerateAccessToken,
  testGet,
  resetPassword,
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
router.post("/regenerate-access-token", regenerateAccessToken);

// --- Profile / Protected Resources ---
router.get("/me", protect, testGet);

// Forgot Password Flow
router.post("/forgot-password-otp", validate(authSchemas.forgotPasswordOtp), forgotPasswordOtp);
router.post("/reset-password", validate(authSchemas.resetPassword), resetPassword);

module.exports = router;