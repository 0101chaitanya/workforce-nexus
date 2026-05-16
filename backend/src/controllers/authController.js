const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../utils/sendEmail.js");
const Company = require("../models/Company");
const User = require("../models/User");
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const { catchAsync } = require("../middleware/authMiddleware");

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
        html: `<h2>Your OTP for email verification is ${otp}</h2>`,
    });

    return res.status(200).json({ message: "OTP sent successfully to email", success: true });
});

exports.verifyOtp = catchAsync(async (req, res) => {
    const { email, otp } = req.body;
    
    // Direct lookup avoids redundantly searching Company collection first
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User did not request an OTP", success: false });

    if (user.otp !== Number(otp) || Date.now() > user.otpExpiry) {
        return res.status(400).json({ message: "OTP invalid or expired", success: false });
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
    if (!user) return res.status(404).json({ message: "User not found", success: false });
    if (!user.isVerified) return res.status(403).json({ message: "Email verification is required before registration", success: false });
    if (user.password) return res.status(400).json({ message: "User is already registered", success: false });

    const company = await Company.findById(user.company);
    if (company) company.owner = user._id;

    user.fullName = fullName;
    user.password = await bcrypt.hash(password, 10);

    await Promise.all([user.save(), company ? company.save() : Promise.resolve()]);

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
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid email or password", success: false });
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
    if (!refreshToken) return res.status(401).json({ message: "No refresh token provided", success: false });

    // catchAsync wrapper will handle JWT verify errors and send 401
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);
    
    const user = await User.findById(decoded.user._id).populate({
        path: "company",
        populate: { path: "owner", select: "fullName email" }
    });

    if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).json({ message: "Invalid or revoked refresh token", success: false });
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
            console.warn("Logout: Token expired or invalid, clearing cookie.");
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
