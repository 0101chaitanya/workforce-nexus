const Leave = require("../models/Leave");
const logger = require("../utils/logger");

exports.applyLeave = async (req, res) => {
    try {
        const { type, startDate, endDate, reason } = req.body;
        const userId = req.user._id;
        const companyId = req.company._id;

        // Ensure start date is before or equal to end date
        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({
                message: "Start date cannot be after end date",
                success: false,
                occurredAt: new Date().toISOString()
            });
        }

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