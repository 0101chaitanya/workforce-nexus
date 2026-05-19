const User = require("../models/User");
const bcrypt = require("bcrypt");
const { generateSecurePassword } = require("../utils/passwordGenerator");
const transporter = require("../utils/sendEmail");
const logger = require("../utils/logger");

exports.addUser = async (req, res) => {
    try {
        const { fullName, email, role, salary, branch, position } = req.body;
        const generatedPassword = generateSecurePassword();
        const companyId = req.company._id;

        // Verify if user already exists globally or in company
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists",
                success: false,
                occurredAt: new Date().toISOString()
            });
        }

        const newUser = new User({
            fullName,
            email,
            password: generatedPassword,
            role: role || "employee",
            company: companyId,
            salary,
            branch,
            position,
            isVerified: true // Assuming owner created users are verified
        });

        await newUser.save();

        // Send email to the new user
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Welcome to the Company - Your Account Details",
            html: `
                <h2>Hello ${fullName},</h2>
                <p>You have been added to the Employee Management System by your administrator.</p>
                <p><strong>Your login credentials:</strong></p>
                <ul>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Password:</strong> ${generatedPassword}</li>
                </ul>
                <p><strong>Other Details:</strong></p>
                <ul>
                    <li><strong>Role:</strong> ${role || "employee"}</li>
                    <li><strong>Branch:</strong> ${branch || "N/A"}</li>
                    <li><strong>Position:</strong> ${position || "N/A"}</li>
                </ul>
                <p>Please log in at your earliest convenience. We recommend changing your password after your first login.</p>
            `
        });

        // Avoid sending back the password in the user object
        newUser.password = undefined;

        return res.status(201).json({
            message: "User added successfully",
            success: true,
            data: newUser,
            generatedPassword // Sending the generated password for the owner to share with the user
        });

    } catch (err) {
        logger.error(`Error in addUser: ${err.message || err}`, { stack: err.stack });
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            occurredAt: new Date().toISOString()
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
                occurredAt: new Date().toISOString()
            });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Incorrect old password",
                success: false,
                occurredAt: new Date().toISOString()
            });
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json({
            message: "Password changed successfully",
            success: true
        });
    } catch (err) {
        logger.error(`Error in changePassword: ${err.message || err}`, { stack: err.stack });
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            occurredAt: new Date().toISOString()
        });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { query, role } = req.query;
        const companyId = req.company._id;

        let searchQuery = { company: companyId };

        if (query) {
            searchQuery.$or = [
                { fullName: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } }
            ];
        }

        if (role) {
            searchQuery.role = role;
        }

        const users = await User.find(searchQuery)
            .select("-password -refreshToken -otp -otpExpiry")
            .sort({ fullName: 1 });

        return res.status(200).json({
            message: "Users fetched successfully",
            success: true,
            data: users
        });

    } catch (err) {
        logger.error(`Error in searchUsers: ${err.message || err}`, { stack: err.stack });
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            occurredAt: new Date().toISOString()
        });
    }
};

exports.getAllCompanyUsers = async (req, res) => {
    try {
        const companyId = req.company._id;

        const users = await User.find({ company: companyId })
            .select("-password -refreshToken -otp -otpExpiry")
            .sort({ fullName: 1 });

        return res.status(200).json({
            message: "Company users fetched successfully",
            success: true,
            data: users
        });

    } catch (err) {
        logger.error(`Error in getAllCompanyUsers: ${err.message || err}`, { stack: err.stack });
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            occurredAt: new Date().toISOString()
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        // Normal employees can only update non-administrative fields
        const { fullName, phone, address, dateOfBirth, bankAccount } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
                occurredAt: new Date().toISOString()
            });
        }

        if (fullName !== undefined) user.fullName = fullName;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
        if (bankAccount !== undefined) user.bankAccount = bankAccount;

        await user.save();

        const updatedUser = await User.findById(userId).select("-password -refreshToken -otp -otpExpiry");

        return res.status(200).json({
            message: "Profile updated successfully",
            success: true,
            data: updatedUser
        });
    } catch (err) {
        logger.error(`Error in updateProfile: ${err.message || err}`, { stack: err.stack });
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            occurredAt: new Date().toISOString()
        });
    }
};

exports.updateUserByAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.company._id;

        // Explicit safety check
        if (req.user.role !== 'owner') {
            return res.status(403).json({
                message: "Not authorized. Only owners can perform this action",
                success: false,
                occurredAt: new Date().toISOString()
            });
        }

        // Admins can update all fields including administrative ones
        const { fullName, role, salary, branch, position, phone, address, dateOfBirth, bankAccount } = req.body;

        const user = await User.findOne({ _id: id, company: companyId });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
                occurredAt: new Date().toISOString()
            });
        }

        if (fullName !== undefined) user.fullName = fullName;
        if (role !== undefined) user.role = role;
        if (salary !== undefined) user.salary = salary;
        if (branch !== undefined) user.branch = branch;
        if (position !== undefined) user.position = position;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
        if (bankAccount !== undefined) user.bankAccount = bankAccount;

        await user.save();

        const updatedUser = await User.findOne({ _id: id }).select("-password -refreshToken -otp -otpExpiry");

        return res.status(200).json({
            message: "User updated successfully",
            success: true,
            data: updatedUser
        });
    } catch (err) {
        logger.error(`Error in updateUserByAdmin: ${err.message || err}`, { stack: err.stack });
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            occurredAt: new Date().toISOString()
        });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.company._id;

        // Ensure employees can only view their own profile, unless they are an owner
        if (req.user.role !== 'owner' && req.user._id.toString() !== id) {
            return res.status(403).json({
                message: "Not authorized to view this profile",
                success: false,
                occurredAt: new Date().toISOString()
            });
        }

        // Fetch user ensuring they belong to the correct company
        const user = await User.findOne({ _id: id, company: companyId })
            .select("-password -refreshToken -otp -otpExpiry");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
                occurredAt: new Date().toISOString()
            });
        }

        return res.status(200).json({
            message: "User fetched successfully",
            success: true,
            data: user
        });
    } catch (err) {
        logger.error(`Error in getUserById: ${err.message || err}`, { stack: err.stack });
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            occurredAt: new Date().toISOString()
        });
    }
};
