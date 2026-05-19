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
            html: `<div style="
    margin: 0;
    padding: 0;
    background: #eef2ff;
    font-family: Arial, Helvetica, sans-serif;
  ">
    <!-- MAIN WRAPPER -->
    <div style="
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      width: 95%;
    ">
        <!-- BIG HEADER -->
        <div style="
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        padding: 40px 20px;
        text-align: center;
        color: white;
      ">
            <div style="font-size: 26px; font-weight: bold; letter-spacing: 1px">
                Employee Management System
            </div>

            <p style="margin-top: 10px; font-size: 14px; opacity: 0.9">
                Account Notification
            </p>
        </div>

        <!-- BODY -->
        <div style="padding: 32px 24px">
            <h2 style="margin: 0 0 10px 0; font-size: 22px; color: #111827">
                Hello ${fullName},
            </h2>

            <p style="
          font-size: 15px;
          color: #4b5563;
          line-height: 1.7;
          margin-bottom: 20px;
        ">
                You have been successfully added to the company system by your
                administrator. Your account is now active and ready to use.
            </p>

            <!-- CREDENTIAL BOX -->
            <div style="
          background: #f8fafc;
          border: 1px solid #dbeafe;
          border-radius: 14px;
          padding: 18px;
          margin-bottom: 20px;
        ">
                <h3 style="margin: 0 0 12px 0; color: #2563eb; font-size: 16px">
                    Your Login Details
                </h3>

                <table style="
            width: 100%;
            font-size: 14px;
            border-collapse: collapse;
            word-break: break-word;
          ">
                    <tr>
                        <td style="
                padding: 8px 0;
                color: #6b7280;
                font-weight: bold;
                width: 35%;
              ">
                            Email:
                        </td>
                        <td style="padding: 8px 0; color: #111827">${email}</td>
                    </tr>

                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-weight: bold">
                            Password:
                        </td>
                        <td style="padding: 8px 0; color: #111827; font-weight: bold">
                            ${generatedPassword}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-weight: bold">
                            Role:
                        </td>
                        <td style="padding: 8px 0; color: #111827">
                            ${role || "employee"}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-weight: bold">
                            Branch:
                        </td>
                        <td style="padding: 8px 0; color: #111827">${branch || "N/A"}</td>
                    </tr>

                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-weight: bold">
                            Position:
                        </td>
                        <td style="padding: 8px 0; color: #111827">${position || "N/A"}</td>
                    </tr>

                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-weight: bold">
                            Salary:
                        </td>
                        <td style="padding: 8px 0; color: #111827">
                            ${salary || "Not disclosed"}
                        </td>
                    </tr>
                </table>
            </div>

            <!-- INFO NOTICE -->
            <div style="
          background: #eff6ff;
          border-left: 4px solid #2563eb;
          border-radius: 10px;
          padding: 14px;
          font-size: 13px;
          color: #374151;
          line-height: 1.6;
        ">
                This account is created by your organization. Please use these
                credentials to log in and complete your profile setup after first login.
            </div>

            <p style="
          margin-top: 20px;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.6;
        ">
                If you were not expecting this email, please contact your administrator
                immediately.
            </p>
        </div>

        <!-- FOOTER -->
        <div style="
        background: #f9fafb;
        padding: 14px;
        text-align: center;
        font-size: 12px;
        color: #9ca3af;
        border-top: 1px solid #e5e7eb;
      ">
            © 2026 Employee Management System
        </div>
    </div>
</div>`
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
