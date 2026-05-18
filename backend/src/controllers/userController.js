const User = require("../models/User");
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
