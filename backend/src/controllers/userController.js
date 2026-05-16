const User = require("../models/User");
const bcrypt = require("bcrypt");

exports.addUser = async (req, res) => {
    try {
        const { fullName, email, password, role, salary, branch } = req.body;
        const companyId = req.company._id;

        // Verify if user already exists globally or in company
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists",
                success: false
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            role: role || "staff",
            company: companyId,
            salary,
            branch,
            isVerified: true // Assuming owner created users are verified
        });

        await newUser.save();

        // Avoid sending back the password
        newUser.password = undefined;

        return res.status(201).json({
            message: "User added successfully",
            success: true,
            data: newUser
        });

    } catch (err) {
        console.error(`Error in addUser: ${err}`);
        return res.status(500).json({
            message: "Internal server error",
            success: false
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
        console.error(`Error in searchUsers: ${err}`);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};
