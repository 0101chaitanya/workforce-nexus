const Payroll = require("../models/Payroll");
const User = require("../models/User");
const logger = require("../utils/logger");

exports.getPayrollHistory = async (req, res) => {
    try {
        const { targetUserId } = req.query;
        const companyId = req.company._id;

        let query = { company: companyId };

        if (req.user.role === 'owner') {
            if (targetUserId) {
                query.user = targetUserId;
            }
        } else {
            // Normal user can only see their own payroll
            query.user = req.user._id;
        }

        const payrollHistory = await Payroll.find(query)
            .populate('user', 'fullName email')
            .sort({ year: -1, month: -1 });

        return res.status(200).json({
            message: "Payroll history fetched successfully",
            success: true,
            data: payrollHistory
        });

    } catch (err) {
        logger.error(`Error in getPayrollHistory: ${err.message || err}`, { stack: err.stack });
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            occurredAt: new Date().toISOString()
        });
    }
};

exports.generateCompanyPayroll = async (req, res) => {
    try {
        const companyId = req.company._id;

        // Find the most recently generated payroll for this company
        const lastPayroll = await Payroll.findOne({ company: companyId })
            .sort({ year: -1, month: -1 });

        let month, year;
        const currentDate = new Date();

        if (lastPayroll) {
            // Calculate the next month sequentially
            let nextMonth = lastPayroll.month + 1;
            year = lastPayroll.year;

            if (nextMonth > 12) {
                nextMonth = 1;
                year += 1;
            }

            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear();

            // Prevent generating payrolls for future months
            if (year > currentYear || (year === currentYear && nextMonth > currentMonth)) {
                return res.status(400).json({
                    message: "All past payrolls have already been generated up to the current month.",
                    success: false,
                    occurredAt: currentDate.toISOString()
                });
            }

            month = nextMonth;
        } else {
            // Fallback if no payrolls exist: use the previous month
            let targetMonthIndex = currentDate.getMonth();
            year = currentDate.getFullYear();
            if (targetMonthIndex === 0) {
                targetMonthIndex = 11;
                year -= 1;
            } else {
                targetMonthIndex -= 1;
            }
            month = targetMonthIndex + 1;
        }

        // Fetch all users for the company
        const users = await User.find({ company: companyId });

        if (!users || users.length === 0) {
            return res.status(404).json({
                message: "No users found in the company",
                success: false,
                occurredAt: new Date().toISOString()
            });
        }

        const payrolls = [];
        for (const user of users) {
            // Check if payroll already exists for this user for the given month and year
            const existingPayroll = await Payroll.findOne({
                user: user._id,
                company: companyId,
                month,
                year
            });

            if (existingPayroll) {
                continue; // Skip if already generated for this user
            }

            const basicPay = user.salary || 0;
            // Simplified tax calculation (e.g. 10% tax for > 50,000 basic pay) - can be adjusted
            const taxes = basicPay > 50000 ? basicPay * 0.1 : 0;
            const netPay = basicPay - taxes;

            payrolls.push({
                user: user._id,
                company: companyId,
                month,
                year,
                basicPay,
                taxes,
                netPay,
                status: 'generated'
            });
        }

        if (payrolls.length === 0) {
            return res.status(400).json({
                message: "Payroll already generated for all users for this period",
                success: false,
                occurredAt: new Date().toISOString()
            });
        }

        // Insert new payroll documents into the database
        await Payroll.insertMany(payrolls);

        return res.status(201).json({
            message: `Payroll generated successfully for ${payrolls.length} users`,
            success: true,
            data: payrolls
        });

    } catch (err) {
        logger.error(`Error in generateCompanyPayroll: ${err.message || err}`, { stack: err.stack });
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            occurredAt: new Date().toISOString()
        });
    }
};
