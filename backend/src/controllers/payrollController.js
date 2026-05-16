const Payroll = require("../models/Payroll");
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
