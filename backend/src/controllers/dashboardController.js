const User = require("../models/User");
const Payroll = require("../models/Payroll");
const Leave = require("../models/Leave");
const Attendance = require("../models/Attendance");
const logger = require("../utils/logger");

/**
 * Gathers **high-level statistics** (total employees, active leaves, daily attendance, recent payroll totals)
 * for the company owner's dashboard view.
 * @route `GET /api/dashboard/stats`
 * @param {Object} req
 * @param {Object} req.company - Associated company details.
 * @returns {Promise<Object>} JSON response containing analytics numbers.
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const companyId = req.company._id;

        // 1. Total Employees
        const totalEmployees = await User.countDocuments({ company: companyId, role: 'employee' });

        // Setup date bounds for today's metrics
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);

        // 2. Employees currently on leave today
        const employeesOnLeave = await Leave.countDocuments({
            company: companyId,
            status: 'approved',
            startDate: { $lte: endOfToday },
            endDate: { $gte: today }
        });

        // 3. Today's Attendance (Employees present today)
        const todayAttendance = await Attendance.countDocuments({
            company: companyId,
            date: { $gte: today, $lte: endOfToday }
        });

        // 4. Total Payroll for the most recent month
        let totalPayroll = 0;
        let lastPayrollMonth = null;
        let lastPayrollYear = null;

        const lastPayroll = await Payroll.findOne({ company: companyId }).sort({ year: -1, month: -1 });

        if (lastPayroll) {
            lastPayrollMonth = lastPayroll.month;
            lastPayrollYear = lastPayroll.year;

            const recentPayrolls = await Payroll.find({
                company: companyId,
                month: lastPayrollMonth,
                year: lastPayrollYear
            });

            // Calculate the total net pay disbursed for that month
            totalPayroll = recentPayrolls.reduce((sum, record) => sum + (record.netPay || 0), 0);
        }

        return res.status(200).json({
            message: "Dashboard stats fetched successfully",
            success: true,
            data: {
                totalEmployees,
                employeesOnLeave,
                todayAttendance,
                recentPayroll: {
                    amount: totalPayroll,
                    month: lastPayrollMonth,
                    year: lastPayrollYear
                }
            }
        });
    } catch (err) {
        logger.error(`Error in getDashboardStats: ${err.message || err}`, { stack: err.stack });
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            occurredAt: new Date().toISOString()
        });
    }
};