const Payroll = require("../models/Payroll");
const User = require("../models/User");
const Leave = require("../models/Leave");
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
            .populate('user', 'fullName email position')
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

        // Fetch all employees for the company (excluding owners)
        const users = await User.find({ company: companyId, role: 'employee' });

        if (!users || users.length === 0) {
            return res.status(404).json({
                message: "No users found in the company",
                success: false,
                occurredAt: new Date().toISOString()
            });
        }

        // Calculate days in the target month for daily wage calculation
        const daysInMonth = new Date(year, month, 0).getDate();

        // Fetch all approved unpaid leaves that overlap with the target month
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

        const unpaidLeaves = await Leave.find({
            company: companyId,
            status: 'approved',
            type: 'unpaid',
            $or: [
                { startDate: { $lte: monthEnd }, endDate: { $gte: monthStart } }
            ]
        });

        // Group unpaid leave days by user
        const getDayStart = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        const startOfM = getDayStart(monthStart);
        const endOfM = getDayStart(monthEnd);

        const leaveDeductionsByUser = {};
        for (const leave of unpaidLeaves) {
            const userIdStr = leave.user.toString();
            if (!leaveDeductionsByUser[userIdStr]) leaveDeductionsByUser[userIdStr] = 0;

            const lStart = getDayStart(leave.startDate);
            const lEnd = getDayStart(leave.endDate);

            const actualStart = Math.max(lStart, startOfM);
            const actualEnd = Math.min(lEnd, endOfM);

            if (actualStart <= actualEnd) {
                const days = Math.round((actualEnd - actualStart) / (1000 * 60 * 60 * 24)) + 1;
                leaveDeductionsByUser[userIdStr] += days;
            }
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

            const grossSalary = user.salary || 0;
            const dailyWage = grossSalary / daysInMonth;
            const unpaidDays = leaveDeductionsByUser[user._id.toString()] || 0;
            const deductions = Math.round(unpaidDays * dailyWage);

            // Adjust basic pay based on unpaid leaves
            const basicPay = Math.max(0, grossSalary - deductions);

            // Simplified tax calculation based on adjusted pay
            const taxes = basicPay > 50000 ? Math.round(basicPay * 0.1) : 0;
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
