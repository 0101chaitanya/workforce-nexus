const jwt = require("jsonwebtoken");
const transporter = require("../utils/sendEmail.js");
const Company = require("../models/Company");
const User = require("../models/User");
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const { catchAsync } = require("../middleware/authMiddleware");
const logger = require("../utils/logger");
require("dotenv").config();
// --- Utility Helpers ---
const sanitizeUser = (user) => ({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified
});

const sanitizeCompany = (company) => ({
    _id: company._id,
    companyName: company.companyName,
    email: company.email,
    owner: company.owner
});

// --- Controllers ---

exports.sendOtp = catchAsync(async (req, res) => {
    const { email, companyName } = req.body;

    // Use early initialization logic to reduce redundant assignments
    const company = await Company.findOne({ email }) || new Company({ email, companyName });
    const user = await User.findOne({ email }) || new User({ email, company: company._id, role: "owner" });

    const otp = Math.floor(10000 + Math.random() * 90000); // 5 digits
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;

    await Promise.all([user.save(), company.save()]);

    await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "OTP Verification Email",
        html: `<div
  style="
    margin: 0;
    padding: 40px 15px;
    background: #eef2ff;
    font-family: Arial, Helvetica, sans-serif;
  "
>
  <div
    style="
      max-width: 560px;
      margin: auto;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    "
  >
    <!-- Header -->
    <div
      style="
        background: linear-gradient(135deg, #2563eb, #1e40af);
        padding: 35px 20px;
        text-align: center;
        color: white;
      "
    >
      <h1 style="margin: 0; font-size: 32px; letter-spacing: 1px">
        Verify Your Account
      </h1>

      <p style="margin-top: 10px; font-size: 15px; opacity: 0.9">
        Secure OTP Verification
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 40px 35px; text-align: center">
      <h2 style="margin-top: 0; color: #111827; font-size: 26px">
        Email Verification
      </h2>

      <p
        style="
          color: #6b7280;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 30px;
        "
      >
        Use the verification code below to complete your sign in process. This
        OTP is valid for only <strong>5 minutes</strong>.
      </p>

      <!-- OTP Box -->
      <div
        style="
          background: #f8fafc;
          border: 2px dashed #2563eb;
          border-radius: 16px;
          padding: 25px;
          margin: 30px 0;
        "
      >
        <div
          style="
            font-size: 42px;
            font-weight: bold;
            letter-spacing: 12px;
            color: #2563eb;
          "
        >
          ${otp}
        </div>
      </div>

      <!-- Security Notice -->
      <div
        style="
          background: #eff6ff;
          border-left: 4px solid #2563eb;
          padding: 15px;
          border-radius: 10px;
          text-align: left;
          margin-top: 25px;
        "
      >
        <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5">
          If you did not request this verification code, you can safely ignore
          this email.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div
      style="
        padding: 20px;
        background: #f9fafb;
        text-align: center;
        border-top: 1px solid #e5e7eb;
      "
    >
      <p style="margin: 0; color: #9ca3af; font-size: 13px">
        © 2026 Employee Management System
      </p>
    </div>
  </div>
</div>
`,
    });

    return res.status(200).json({ message: "OTP sent successfully to email", success: true });
});

exports.verifyOtp = catchAsync(async (req, res) => {
    const { email, otp } = req.body;

    // Direct lookup avoids redundantly searching Company collection first
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User did not request an OTP", success: false, occurredAt: new Date().toISOString() });

    if (user.otp !== otp || Date.now() > user.otpExpiry) {
        return res.status(400).json({ message: "OTP invalid or expired", success: false, occurredAt: new Date().toISOString() });
    }

    const company = await Company.findById(user.company);

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    if (company) company.isVerified = true;

    await Promise.all([user.save(), company ? company.save() : Promise.resolve()]);

    return res.status(200).json({ message: "Email Verified", success: true });
});

exports.register = catchAsync(async (req, res) => {
    const { fullName, email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found", success: false, occurredAt: new Date().toISOString() });
    if (!user.isVerified) return res.status(403).json({ message: "Email verification is required before registration", success: false, occurredAt: new Date().toISOString() });
    if (user.password) return res.status(400).json({ message: "User is already registered", success: false, occurredAt: new Date().toISOString() });

    const company = await Company.findById(user.company);
    if (company) company.owner = user._id;

    user.fullName = fullName;
    user.password = password;

    await Promise.all([user.save(), company ? company.save() : Promise.resolve()]);

    await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Registration Successful",
        html: `<div style="margin:0; padding:40px 15px; background:#eef2ff; font-family:Arial, Helvetica, sans-serif;">

    <div
        style="max-width:600px; margin:auto; background:#fff; border-radius:20px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.08);">

        <!-- Header -->
        <div
            style="background:linear-gradient(135deg,#2563eb,#1d4ed8); padding:35px 20px; text-align:center; color:#fff;">
            <h1 style="margin:0; font-size:30px; letter-spacing:1px;">Registration Successful 🎉</h1>
            <p style="margin:10px 0 0; font-size:15px; opacity:0.9;">Employee Management System</p>
        </div>

        <!-- Body -->
        <div style="padding:40px 35px;">

            <h2 style="color:#111827; margin:0;">Welcome, ${fullName}!</h2>

            <p style="color:#4b5563; font-size:16px; line-height:1.7;">
                Your registration <strong>${company ? `for ${company.companyName}` : 'was'}</strong> successful.
            </p>

            <p style="color:#6b7280; font-size:15px; line-height:1.7;">
                Below are your login credentials. Please keep them secure.
            </p>

            <!-- Credentials Card -->
            <div style="background:#f8fafc; border:1px solid #dbeafe; border-radius:16px; padding:25px; margin:30px 0;">
                <h3 style="margin:0 0 20px; color:#2563eb;">Account Credentials</h3>
                <table style="width:100%; border-collapse:collapse; font-size:15px;">
                    <tr>
                        <td style="padding:12px 0; color:#6b7280; font-weight:bold; width:120px;">Email:</td>
                        <td style="padding:12px 0; color:#111827;">${email}</td>
                    </tr>
                    <tr>
                        <td style="padding:12px 0; color:#6b7280; font-weight:bold;">Password:</td>
                        <td style="padding:12px 0; color:#111827; font-weight:bold;">${password}</td>
                    </tr>
                </table>
            </div>

            <!-- Security Notice -->
            <div
                style="background:#eff6ff; border-left:4px solid #2563eb; border-radius:12px; padding:18px; margin-top:20px;">
                <p style="margin:0; color:#374151; font-size:14px; line-height:1.6;">
                    For better security, we recommend changing your password after your first login.
                </p>
            </div>

            <p style="margin-top:30px; color:#4b5563; font-size:15px; line-height:1.7;">
                Thank you for choosing our Employee Management System.
            </p>

        </div>

        <!-- Footer -->
        <div style="background:#f9fafb; border-top:1px solid #e5e7eb; padding:20px; text-align:center;">
            <p style="margin:0; color:#9ca3af; font-size:13px;">
                © 2026 Employee Management System. All rights reserved.
            </p>
        </div>

    </div>

</div>
`,
    });

    return res.status(201).json({
        message: `${company ? company.companyName : 'User'} registered successfully!`,
        success: true
    });
});

exports.login = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate({
        path: "company",
        populate: { path: "owner", select: "fullName email" }
    });

    // Combine checks to obfuscate failure reason for security
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: "Invalid email or password", success: false, occurredAt: new Date().toISOString() });
    }

    const refreshToken = generateRefreshToken(user, user.company);
    const accessToken = generateAccessToken(user, user.company);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
        accessToken,
        user: sanitizeUser(user),
        company: user.company ? sanitizeCompany(user.company) : null,
        message: "Login successful!",
        success: true
    });
});

exports.regenerateAccessToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token provided", success: false, occurredAt: new Date().toISOString() });

    // catchAsync wrapper will handle JWT verify errors and send 401
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);

    const user = await User.findById(decoded.user._id).populate({
        path: "company",
        populate: { path: "owner", select: "fullName email" }
    });

    if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).json({ message: "Invalid or revoked refresh token", success: false, occurredAt: new Date().toISOString() });
    }

    const accessToken = generateAccessToken(user, user.company);
    return res.status(200).json({ accessToken, message: "Token refreshed successfully", success: true });
});

exports.logout = catchAsync(async (req, res) => {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);
            await User.findByIdAndUpdate(decoded.user._id, { refreshToken: null });
        } catch (err) {
            logger.warn("Logout: Token expired or invalid, clearing cookie.");
        }
    }

    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "User logged out successfully", success: true });
});

exports.testGet = catchAsync(async (req, res) => {
    return res.status(200).json({
        message: "Test successful",
        success: true,
        user: req.user,
        company: req.company
    });
});
