const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const logger = require('../utils/logger');

/**
 * Executes the end-of-day attendance calculation.
 * Designed to be triggered by an external Serverless Cron service (e.g. Vercel Cron, Cron-job.org).
 * @route `POST /api/cron/daily-attendance`
 */
exports.dailyAttendanceCron = async (req, res) => {
    // Optional: Add a simple secret check to prevent unauthorized execution
    const authHeader = req.headers['authorization'];
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        logger.warn("Unauthorized attempt to run cron job.");
        return res.status(401).json({ message: "Unauthorized", success: false });
    }

    logger.info('Running end-of-day attendance status calculation via Serverless Endpoint...');
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const users = await User.find({ role: 'employee', isActive: { $ne: false } });

        for (const user of users) {
            // 1. Check if user has an approved leave for today
            const leave = await Leave.findOne({
                user: user._id,
                status: 'approved',
                startDate: { $lte: today },
                endDate: { $gte: today }
            });

            if (leave) {
                await Attendance.findOneAndUpdate(
                    { user: user._id, date: today, company: user.company },
                    { $set: { status: 'leave', totalHours: 0 } },
                    { upsert: true, new: true }
                );
                continue;
            }

            // 2. Fetch or evaluate attendance record
            let attendance = await Attendance.findOne({
                user: user._id,
                date: today
            });

            if (!attendance) {
                // If they never clocked in, they are absent
                await Attendance.create({
                    user: user._id,
                    company: user.company,
                    date: today,
                    status: 'absent',
                    totalHours: 0
                });
            } else {
                // They clocked in
                if (!attendance.checkOutTime) {
                    // Auto clockout at midnight, mark as absent
                    attendance.checkOutTime = new Date();
                    const diffMs = attendance.checkOutTime - attendance.checkInTime;
                    attendance.totalHours = Math.round(diffMs / (1000 * 60));
                    attendance.status = 'absent';
                } else {
                    // They clocked out normally, compute status based on minutes
                    const totalMins = attendance.totalHours || 0;
                    if (totalMins >= 540) { // 9 hours
                        attendance.status = 'present';
                    } else if (totalMins >= 240) { // 4 hours
                        attendance.status = 'half-day';
                    } else {
                        attendance.status = 'absent';
                    }
                }
                await attendance.save();
            }
        }
        logger.info('End-of-day attendance job completed successfully.');
        return res.status(200).json({ message: "Cron job executed successfully", success: true });
    } catch (error) {
        logger.error(`Error in end-of-day cron API: ${error.message}`, { stack: error.stack });
        return res.status(500).json({ message: "Cron job failed", success: false, error: error.message });
    }
};
