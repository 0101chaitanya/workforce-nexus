const mongoose = require("mongoose")

const attendanceSchema = new mongoose.Schema({
    checkInTime: {
        type: Date,
    }, checkOutTime: {
        type: Date,
    }, company: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true,
    }, date: {
        type: Date, required: true,
    }, remarks: {
        type: String,
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
