const cron = require('node-cron');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const logger = require('../utils/logger');

// Schedule job to run at 11:55 PM every day
cron.schedule('55 23 * * *', async () => {
    logger.info('Running end-of-day attendance status calculation job...');
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const users = await User.find({ role: 'employee' });

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
    } catch (error) {
        logger.error(`Error in end-of-day cron job: ${error.message}`, { stack: error.stack });
    }
});
