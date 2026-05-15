const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../utils/sendEmail.js");
const Company = require("../models/Company");
const User = require("../models/User");

const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const secureDetailsSender = require("../utils/secureDetailsSender");

exports.sendOtp = async (req, res) => {
    const { email, companyName } = req.body;

    try {
        let company = await Company.findOne({ email });

        if (!company) {
            company = new Company();
            company.companyName = companyName;
            company.email = email;
        }

        let user = await User.findOne({ company: company._id, email });

        if (!user) {
            user = new User();
            user.email = email;
            user.company = company._id;
            user.role = "owner";
        }

        const otp = Math.floor(90000 * Math.random() + 10000);
        user.otp = otp;
        user.otpExpiry = Date.now() + 5 * 60 * 1000;

        await user.save();
        await company.save();

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "OTP verification Email",
            html: `<h2>Your OTP for email verification is ${otp}</h2>`,
        });

        return res.status(200).json({
            message: "OTP sent successfully to email",
            success: true,
        });
    } catch (err) {
        console.error(`Server error in send-otp endpoint: ${err}`);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const company = await Company.findOne({ email });

        if (!company) {
            return res.status(404).json({ message: "Company not found", success: false });
        }

        let user = await User.findOne({ company: company._id, email });

        if (!user) {
            return res.status(400).json({
                message: "User did not request an OTP",
                success: false
            });
        }

        if (user.otp !== Number(otp) || Date.now() > user.otpExpiry) {
            return res.status(400).json({
                message: "OTP invalid or expired",
                success: false
            });
        }

        company.isVerified = true;
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;

        await user.save();
        await company.save();

        return res.status(200).json({ message: "Email Verified", success: true });
    } catch (err) {
        console.error(`Error in /verify-otp endpoint: ${err}`);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

exports.register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const company = await Company.findOne({ email });

        if (!company) {
            return res.status(404).json({ message: "Company not found", success: false });
        }

        let user = await User.findOne({ company: company._id, email });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: "Email verification is required before registration",
                success: false
            });
        }

        if (user.password) {
            return res.status(400).json({
                message: "User is already registered",
                success: false
            });
        }

        company.owner = user._id;
        user.fullName = fullName;
        user.password = await bcrypt.hash(password, 10);

        await user.save();
        await company.save();

        return res.status(201).json({
            message: `${company.companyName} registered successfully!`,
            success: true,
        });

    } catch (err) {
        console.error(`Error in registration endpoint: ${err}`);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email }).populate({
            path: "company",
            populate: {
                path: "owner",
                select: "fullName email"
            }
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
                success: false
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
                success: false
            });
        }

        const refreshToken = generateRefreshToken(user, user.company);
        const accessToken = generateAccessToken(user, user.company);

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie(`refreshToken`, refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: false, // TODO: set to true in production if HTTPS
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const details = await secureDetailsSender(user.company._id, user._id);

        return res.status(200).json({
            accessToken,
            company: details.company,
            user: details.user,
            message: "Login successful!",
            success: true
        });
    } catch (err) {
        console.error(`Error in /login route: ${err}`);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// REMOVED 'protect' middleware. The access token is usually expired when this is called.
// It relies entirely on the 'refreshToken' cookie.
exports.regenerateAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided", success: false });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);

        // Ensure the user actually exists and the refresh token hasn't been revoked
        const user = await User.findById(decoded.user._id).populate({
            path: "company",
            populate: {
                path: "owner",
                select: "fullName email"
            }
        });

        if (!user) {
            console.error("User not found for ID:", decoded.user._id);
            return res.status(401).json({
                message: "User not found",
                success: false
            });
        }

        // Check if user has refreshToken property and if it matches
        if (!user.refreshToken || user.refreshToken !== refreshToken) {
            console.error("Refresh token mismatch or missing for user:", user._id);
            return res.status(401).json({
                message: "Invalid or revoked refresh token",
                success: false
            });
        }

        const accessToken = generateAccessToken(user, user.company);

        return res.status(200).json({
            accessToken,
            message: "Token refreshed successfully",
            success: true
        });

    } catch (err) {
        console.error("Error in /regenerate-access-token route:", err.message);
        console.error("Full error:", err);
        return res.status(401).json({
            message: "Invalid or expired refresh token",
            success: false
        });
    }
};

exports.logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            try {
                const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);
                await User.findByIdAndUpdate(decoded.user._id, { refreshToken: null });
            } catch (jwtErr) {
                console.error("Logout: Refresh token invalid or expired, clearing cookie anyway.");
            }
        }

        res.clearCookie("refreshToken");
        return res.status(200).json({
            message: "User logged out successfully",
            success: true
        });
    } catch (err) {
        console.error(`Error in logout route: ${err}`);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

exports.testGet = async (req, res) => {
    return res.status(200).json({
        message: "Test successful",
        success: true,
        user: req.user,
        company: req.company
    });
};
