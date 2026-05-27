const mongoose = require("mongoose")

/**
 * @typedef {Object} AttendanceSchema
 * @property {Date} [checkInTime] - Exact clock-in timestamp.
 * @property {Date} [checkOutTime] - Exact clock-out timestamp.
 * @property {mongoose.Types.ObjectId} company - Reference to the associated Company.
 * @property {Date} date - Calendar date of the attendance record (normalized).
 * @property {string} status - Attendance state (present, absent, half-day, leave).
 * @property {number} [totalHours] - Total logged duration in minutes for the day.
 * @property {mongoose.Types.ObjectId} user - Reference to the corresponding User.
 */
const attendanceSchema = new mongoose.Schema({
    checkInTime: {
        type: Date,
    }, checkOutTime: {
        type: Date,
    }, company: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true,
    }, date: {
        type: Date, required: true,
    }, status: {
        type: String,
        enum: ['present', 'absent', 'half-day', 'leave'], default: 'absent',
    }, totalHours: {
        type: Number,
    }, user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,
    },
}, {
    timestamps: true
})
const Attendance = mongoose.model("Attendance", attendanceSchema)

module.exports = Attendance

