const User = require("../models/User");
const bcrypt = require("bcrypt");
const { generateSecurePassword } = require("../utils/passwordGenerator");
const transporter = require("../utils/sendEmail");
const logger = require("../utils/logger");

/**
 * Onboards a **new employee**. Generates a secure temporary password and emails credentials.
 * @route `POST /api/users/add`
 * @param {Object} req
 * @param {Object} req.company - Associated company details.
 * @param {Object} req.body
 * @param {string} req.body.email - Employee email.
 * @param {string} req.body.fullName - Employee full name.
 * @param {string} [req.body.position] - Job title.
 * @param {string} [req.body.branch] - Location branch.
 * @param {number} [req.body.salary] - Annual salary package.
 * @param {string} [req.body.dateOfBirth] - Date of birth.
 * @param {string} [req.body.phone] - Phone number.
 * @param {string} [req.body.address] - Physical home address.
 * @param {string} [req.body.bankAccount] - Bank account details.
 * @returns {Promise<Object>} JSON response containing the created user and raw temporary password.
 */
exports.addUser = async (req, res) => {
    try {
        const { fullName, email, salary, branch, position } = req.body;
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
            role: "employee",
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
                    <li><strong>Role:</strong> ${"employee"}</li>
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

/**
 * Updates the password for the active authenticated user context.
 * @route `PUT /api/users/change-password`
 * @param {Object} req
 * @param {Object} req.user - Active user context.
 * @param {Object} req.body
 * @param {string} req.body.oldPassword - Present plaintext password.
 * @param {string} req.body.newPassword - Desired plaintext password.
 * @returns {Promise<Object>} JSON response confirming success.
 */
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

/**
 * Searches and paginates employees belonging to the company context.
 * Supports case-insensitive regex filtering on `fullName`, `email`, and `identity`.
 * @route `GET /api/users/search`
 * @param {Object} req
 * @param {Object} req.company - Associated company details.
 * @param {Object} req.query
 * @param {string} [req.query.query] - Case-insensitive filter term.
 * @param {number} [req.query.page] - Target page index.
 * @param {number} [req.query.limit] - Size of pagination page.
 * @returns {Promise<Object>} JSON response containing paginated list.
 */
exports.searchUsers = async (req, res) => {
    try {
        const { query, page, limit } = req.query;
        const companyId = req.company._id;

        let searchQuery = { company: companyId };

        if (query && query.trim() !== "") {
            searchQuery.$or = [
                { fullName: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
                { identity: { $regex: query, $options: "i" } }
            ];
        } else {
            searchQuery.role = { $ne: "owner" };
        }

        // If pagination params are provided, use pagination; otherwise fetch all
        if (page !== undefined && limit !== undefined) {
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 10;

            const skip = (pageNum - 1) * limitNum;
            const total = await User.countDocuments(searchQuery);
            const users = await User.find(searchQuery)
                .select("-password -refreshToken -otp -otpExpiry")
                .sort({ fullName: 1 })
                .skip(skip)
                .limit(limitNum);

            const totalPages = Math.ceil(total / limitNum);

            return res.status(200).json({
                message: "Users fetched successfully",
                success: true,
                data: users,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages,
                    hasNext: pageNum < totalPages,
                    hasPrev: pageNum > 1
                }
            });
        } else {
            // Fetch all users without pagination
            const users = await User.find(searchQuery)
                .select("-password -refreshToken -otp -otpExpiry")
                .sort({ fullName: 1 });

            return res.status(200).json({
                message: "Users fetched successfully",
                success: true,
                data: users
            });
        }

    } catch (err) {
        logger.error(`Error in searchUsers: ${err.message || err}`, { stack: err.stack });
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            occurredAt: new Date().toISOString()
        });
    }
};

/**
 * Retrieves all company employees (excluding owners) alphabetically.
 * @route `GET /api/users/all`
 * @param {Object} req
 * @param {Object} req.company - Associated company details.
 * @returns {Promise<Object>} JSON response containing list of all users.
 */
exports.getAllCompanyUsers = async (req, res) => {
    try {
        const companyId = req.company._id;

        const users = await User.find({ company: companyId, role: { $ne: "owner" } })
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

/**
 * Safe self-service profile updates (e.g., `phone`, `address`, `bankAccount`).
 * @route `PUT /api/users/profile`
 * @param {Object} req
 * @param {Object} req.user - Active user context.
 * @param {Object} req.body
 * @returns {Promise<Object>} JSON response containing the updated user.
 */
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

/**
 * Updates administrative fields of an employee (**Owner/Admin restricted**).
 * @route `PUT /api/users/update/:id`
 * @param {Object} req
 * @param {Object} req.company - Associated company details.
 * @param {Object} req.params
 * @param {string} req.params.id - Employee User record ID.
 * @param {Object} req.body
 * @returns {Promise<Object>} JSON response containing updated employee.
 */
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

/**
 * Resolves detailed profile data for a specific employee.
 * Access control restricts employees to their own details; **Owners** can fetch anyone.
 * @route `GET /api/users/profile/:id`
 * @param {Object} req
 * @param {Object} req.user - Active user context.
 * @param {Object} req.company - Associated company details.
 * @param {Object} req.params
 * @param {string} req.params.id - User ID to query.
 * @returns {Promise<Object>} JSON response containing profile.
 */
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
