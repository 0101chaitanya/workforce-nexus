const Attendance = require("../models/Attendance");
const Company = require("../models/Company");
const mongoose = require("mongoose");
const logger = require("../utils/logger");

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the **Haversine formula**.
 * @param {number} lat1 - Latitude of origin.
 * @param {number} lon1 - Longitude of origin.
 * @param {number} lat2 - Latitude of destination.
 * @param {number} lon2 - Longitude of destination.
 * @returns {number} Distance in meters.
 */
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radius of the Earth in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
}

/**
 * Clocks in an employee if they are within the allowed proximity boundary of the office.
 * @route `POST /api/attendance/clock-in`
 * @param {Object} req
 * @param {Object} req.user - Active user context.
 * @param {Object} req.company - Associated company details.
 * @param {Object} req.body
 * @param {number} req.body.latitude - Employee's current latitude coordinate.
 * @param {number} req.body.longitude - Employee's current longitude coordinate.
 * @returns {Promise<Object>} JSON response containing clock-in record.
 */
exports.clockIn = async (req, res) => {
    try {
        const userId = req.user._id;
        const companyId = req.company._id;
        const { latitude, longitude } = req.body;

        // Check if there's already an attendance record for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingAttendance = await Attendance.findOne({
            user: userId,
            company: companyId,
            date: { $gte: today }
        });

        if (existingAttendance) {
            return res.status(400).json({
                message: "Already clocked in for today",
                success: false,
                occurredAt: new Date().toISOString()
            });
        }

        // Fetch company settings to get office coordinates
        const companyObj = await Company.findById(companyId);

        if (companyObj && companyObj.latitude !== undefined && companyObj.latitude !== null && companyObj.longitude !== undefined && companyObj.longitude !== null) {
            if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
                return res.status(400).json({
                    message: "Location access is required to clock-in for this company.",
                    success: false,
                    occurredAt: new Date().toISOString()
                });
            }

            const distance = getDistance(latitude, longitude, companyObj.latitude, companyObj.longitude);
            const radius = companyObj.proximityRadius || 200;

            if (distance > radius) {
                return res.status(400).json({
                    message: `Cannot clock-in: You are not within the office boundary (Distance: ${Math.round(distance)}m, allowed: ${radius}m).`,
                    success: false,
                    occurredAt: new Date().toISOString()
                });
            }
        }

        const attendance = new Attendance({
            user: userId,
            company: companyId,
            date: new Date(),
            checkInTime: new Date(),
            status: "present"
        });

        await attendance.save();

        return res.status(201).json({
            message: "Clocked in successfully",
            success: true,
            data: attendance
        });

    } catch (err) {
        logger.error(`Error in clockIn: ${err.message || err}`, { stack: err.stack });
        return res.status(500).json({
            message: "Error in clockIn",
            success: false,
            occurredAt: new Date().toISOString()
        });
    }
};

/**
 * If successful, marks the `checkOutTime`, computes `totalHours` in minutes, and resolves the day's attendance `status` to 'present', 'half-day', or 'absent'. worked.
 * @route `POST /api/attendance/clock-out`
 * @param {Object} req
 * @param {Object} req.user - Active user context.
 * @returns {Promise<Object>} JSON response confirming clock-out.
 */
exports.clockOut = async (req, res) => {
    try {
        const userId = req.user._id;
        const companyId = req.company._id;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            user: userId,
            company: companyId,
            date: { $gte: today }
        });

        if (!attendance) {
            return res.status(404).json({
                message: "No clock-in record found for today",
                success: false,
                occurredAt: new Date().toISOString()
            });
        }

        if (attendance.checkOutTime) {
            return res.status(400).json({
                message: "Already clocked out for today",
                success: false,
                occurredAt: new Date().toISOString()
            });
        }

        attendance.checkOutTime = new Date();

        // Calculate total hours in minutes
        const diffMs = attendance.checkOutTime - attendance.checkInTime;
        const totalMins = Math.round(diffMs / (1000 * 60));
        attendance.totalHours = totalMins;

        if (totalMins >= 540) {
            attendance.status = 'present';
        } else if (totalMins >= 240) {
            attendance.status = 'half-day';
        } else {
            attendance.status = 'absent';
        }

        await attendance.save();

        return res.status(200).json({
            message: "Clocked out successfully",
            success: true,
            data: attendance
        });

    } catch (err) {
        logger.error(`Error in clockOut: ${err.message || err}`, { stack: err.stack });
        return res.status(500).json({
            message: "Error in clockOut",
            success: false,
            occurredAt: new Date().toISOString()
        });
    }
};

/**
 * Retrieves the attendance history logs for a user or target employee (**owner only**).
 * Supports pagination.
 * @route `GET /api/attendance/history`
 * @param {Object} req
 * @param {Object} req.query
 * @param {string} [req.query.targetUserId] - Target employee ID to filter (Owner only).
 * @param {number} [req.query.page] - Current page number.
 * @param {number} [req.query.limit] - Page limit.
 * @returns {Promise<Object>} JSON response containing history list.
 */
exports.getAttendanceHistory = async (req, res) => {
    try {
        const { targetUserId, page, limit } = req.query;
        const companyId = req.company._id;

        let query = { company: companyId };

        if (req.user.role === 'owner') {
            if (targetUserId) {
                query.user = targetUserId;
            }
        } else {
            // Normal user can only see their own attendance
            query.user = req.user._id;
        }

        if (page !== undefined && limit !== undefined) {
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 10;
            const skip = (pageNum - 1) * limitNum;

            const total = await Attendance.countDocuments(query);
            const attendanceHistory = await Attendance.find(query)
                .populate('user', 'fullName email position identity')
                .sort({ date: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean();

            const totalPages = Math.ceil(total / limitNum);

            return res.status(200).json({
                message: "Attendance history fetched successfully",
                success: true,
                data: attendanceHistory,
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
            const attendanceHistory = await Attendance.find(query)
                .populate('user', 'fullName email position identity')
                .sort({ date: -1 });

            return res.status(200).json({
                message: "Attendance history fetched successfully",
                success: true,
                data: attendanceHistory
            });
        }

    } catch (err) {
        logger.error(`Error in getAttendanceHistory: ${err.message || err}`, { stack: err.stack });
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            occurredAt: new Date().toISOString()
        });
    }
};

/**
 * Validates the physical position of a clocked-in employee in real-time.
 * * In the event the user is marked out of bounds or missing location, the system automatically writes a `checkOutTime`, calculates their final status based on `totalHours` in minutes, and considers them out for the rest of the day.
 * @route `POST /api/attendance/verify-proximity`
 * @param {Object} req
 * @param {Object} req.body
 * @param {number} [req.body.latitude] - Employee's current latitude coordinate.
 * @param {number} [req.body.longitude] - Employee's current longitude coordinate.
 * @returns {Promise<Object>} JSON response reflecting current boundary status.
 */
exports.verifyProximity = async (req, res) => {
    try {
        const userId = req.user._id;
        const companyId = req.company._id;
        const { latitude, longitude } = req.body;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            user: userId,
            company: companyId,
            date: { $gte: today },
            checkInTime: { $exists: true },
            checkOutTime: { $exists: false }
        });

        if (!attendance) {
            return res.status(200).json({
                success: true,
                clockedOut: false,
                message: "No active clock-in session found for today."
            });
        }

        const companyObj = await Company.findById(companyId);

        if (!companyObj || companyObj.latitude === undefined || companyObj.latitude === null || companyObj.longitude === undefined || companyObj.longitude === null) {
            return res.status(200).json({
                success: true,
                clockedOut: false,
                message: "Company proximity coordinates are not configured."
            });
        }

        const radius = companyObj.proximityRadius || 200;

        if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
            attendance.checkOutTime = new Date();
            const diffMs = attendance.checkOutTime - attendance.checkInTime;
            const totalMins = Math.round(diffMs / (1000 * 60));
            attendance.totalHours = totalMins;

            if (totalMins >= 540) {
                attendance.status = 'present';
            } else if (totalMins >= 240) {
                attendance.status = 'half-day';
            } else {
                attendance.status = 'absent';
            }
            await attendance.save();

            return res.status(200).json({
                success: true,
                clockedOut: true,
                message: "Location access is required. Automatically clocked out.",
                data: attendance
            });
        }

        const distance = getDistance(latitude, longitude, companyObj.latitude, companyObj.longitude);

        if (distance > radius) {
            attendance.checkOutTime = new Date();
            const diffMs = attendance.checkOutTime - attendance.checkInTime;
            const totalMins = Math.round(diffMs / (1000 * 60));
            attendance.totalHours = totalMins;

            if (totalMins >= 540) {
                attendance.status = 'present';
            } else if (totalMins >= 240) {
                attendance.status = 'half-day';
            } else {
                attendance.status = 'absent';
            }
            await attendance.save();

            return res.status(200).json({
                success: true,
                clockedOut: true,
                message: "Exceeded office boundary. Automatically clocked out.",
                data: attendance
            });
        }

        return res.status(200).json({
            success: true,
            clockedOut: false,
            message: "Location verified. Within office boundaries."
        });

    } catch (err) {
        logger.error(`Error in verifyProximity: ${err.message || err}`, { stack: err.stack });
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            occurredAt: new Date().toISOString()
        });
    }
};
