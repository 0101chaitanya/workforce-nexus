const Attendance = require("../models/Attendance");
const mongoose = require("mongoose");

exports.clockIn = async (req, res) => {
    try {
        const userId = req.user._id;
        const companyId = req.company._id;

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
                success: false
            });
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
        console.error(`Error in clockIn: ${err}`);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

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
                success: false
            });
        }

        if (attendance.checkOutTime) {
            return res.status(400).json({
                message: "Already clocked out for today",
                success: false
            });
        }

        attendance.checkOutTime = new Date();
        
        // Calculate total hours
        const diffMs = attendance.checkOutTime - attendance.checkInTime;
        attendance.totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

        await attendance.save();

        return res.status(200).json({
            message: "Clocked out successfully",
            success: true,
            data: attendance
        });

    } catch (err) {
        console.error(`Error in clockOut: ${err}`);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

exports.getAttendanceHistory = async (req, res) => {
    try {
        const { targetUserId } = req.query;
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

        const attendanceHistory = await Attendance.find(query)
            .populate('user', 'fullName email')
            .sort({ date: -1 });

        return res.status(200).json({
            message: "Attendance history fetched successfully",
            success: true,
            data: attendanceHistory
        });

    } catch (err) {
        console.error(`Error in getAttendanceHistory: ${err}`);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};
