const Leave = require("../models/Leave");
const logger = require("../utils/logger");

/**
 * Creates and submits a **new leave request** application.
 * @route `POST /api/leaves/apply`
 * @param {Object} req
 * @param {Object} req.user - Active user context.
 * @param {Object} req.company - Associated company details.
 * @param {Object} req.body
 * @param {string} req.body.type - Leave type (sick, annual, personal, unpaid).
 * @param {string} req.body.startDate - Leave start date.
 * @param {string} req.body.endDate - Leave end date.
 * @param {string} req.body.reason - Purpose details of the leave application.
 * @returns {Promise<Object>} JSON response containing the created leave entry.
 */
exports.applyLeave = async (req, res) => {
    try {
        const { type, startDate, endDate, reason } = req.body;
        const userId = req.user._id;
        const companyId = req.company._id;

        const leave = new Leave({
            user: userId,
            company: companyId,
            type,
            startDate,
            endDate,
            reason,
            status: "pending"
        });

        await leave.save();

        return res.status(201).json({
            message: "Leave applied successfully",
            success: true,
            data: leave
        });
    } catch (err) {
        logger.error(`Error in applyLeave: ${err.message || err}`, { stack: err.stack });
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            occurredAt: new Date().toISOString()
        });
    }
};

/**
 * Fetches leave application history logs for users.
 * Employees see their own leaves; **Owners** see all and receive summary statistics.
 * @route `GET /api/leaves/history`
 * @param {Object} req
 * @param {Object} req.user - Active user context.
 * @param {Object} req.company - Associated company details.
 * @param {Object} req.query
 * @param {string} [req.query.targetUserId] - Filter leaves by employee (Owner only).
 * @param {number} [req.query.page] - Page number.
 * @param {number} [req.query.limit] - Page limit.
 * @returns {Promise<Object>} JSON response containing list of leave requests and summary stats.
 */
exports.getLeaveHistory = async (req, res) => {
    try {
        const { targetUserId, page, limit } = req.query;
        const companyId = req.company._id;
        let query = { company: companyId };

        if (req.user.role === 'owner') {
            // Owners can fetch all leaves, or filter by a specific user
            if (targetUserId) {
                query.user = targetUserId;
            }
        } else {
            // Normal employees can only see their own leave requests
            query.user = req.user._id;
        }

        const pendingCount = await Leave.countDocuments({ ...query, status: 'pending' });
        const approvedCount = await Leave.countDocuments({ ...query, status: 'approved' });
        const rejectedCount = await Leave.countDocuments({ ...query, status: 'rejected' });
        const stats = {
            pending: pendingCount,
            approved: approvedCount,
            rejected: rejectedCount
        };

        if (page !== undefined && limit !== undefined) {
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 10;
            const skip = (pageNum - 1) * limitNum;

            const total = await Leave.countDocuments(query);
            const leaves = await Leave.find(query)
                .populate('user', 'fullName email position identity')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum);

            const totalPages = Math.ceil(total / limitNum);

            return res.status(200).json({
                message: "Leave history fetched successfully",
                success: true,
                data: leaves,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages,
                    hasNext: pageNum < totalPages,
                    hasPrev: pageNum > 1
                },
                stats
            });
        } else {
            const leaves = await Leave.find(query)
                .populate('user', 'fullName email position identity')
                .sort({ createdAt: -1 }); // Most recent first

            return res.status(200).json({
                message: "Leave history fetched successfully",
                success: true,
                data: leaves,
                stats
            });
        }
    } catch (err) {
        logger.error(`Error in getLeaveHistory: ${err.message || err}`, { stack: err.stack });
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            occurredAt: new Date().toISOString()
        });
    }
};

/**
 * Updates status of a leave request with reviewer notes (**Owner only**).
 * @route `PUT /api/leaves/status/:leaveId`
 * @param {Object} req
 * @param {Object} req.company - Associated company details.
 * @param {Object} req.params
 * @param {string} req.params.leaveId - Leave request ID.
 * @param {Object} req.body
 * @param {string} req.body.status - New status (approved or rejected).
 * @param {string} [req.body.remarks] - Reviewer feedback notes.
 * @returns {Promise<Object>} JSON response containing the updated leave details.
 */
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { leaveId } = req.params;
        const { status, remarks } = req.body;
        const companyId = req.company._id;

        const leave = await Leave.findOneAndUpdate(
            { _id: leaveId, company: companyId },
            { status, remarks },
            { new: true }
        ).populate('user', 'fullName email');

        if (!leave) {
            return res.status(404).json({ message: "Leave request not found", success: false });
        }

        return res.status(200).json({ message: `Leave ${status} successfully`, success: true, data: leave });
    } catch (err) {
        logger.error(`Error in updateLeaveStatus: ${err.message || err}`, { stack: err.stack });
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};
