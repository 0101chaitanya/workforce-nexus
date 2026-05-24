const mongoose = require("mongoose");

/**
 * @typedef {Object} LeaveSchema
 * @property {mongoose.Types.ObjectId} user - **Reference** to the applying User.
 * @property {mongoose.Types.ObjectId} company - **Reference** to the user's Company.
 * @property {string} type - Type of leave (`sick`, `personal`, `annual`, `unpaid`).
 * @property {Date} startDate - Leave request **start date**.
 * @property {Date} endDate - Leave request **end date**.
 * @property {string} reason - Detailed explanation for the leave request.
 * @property {string} status - Application state (`pending`, `approved`, `rejected`).
 * @property {string} [remarks] - Owner's notes upon review approval or rejection.
 */
const leaveSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
    },
    type: {
        type: String,
        enum: ["sick", "personal", "annual", "unpaid"],
        required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    remarks: { type: String } // For owners to add a note when approving/rejecting
}, { timestamps: true });

module.exports = mongoose.model("Leave", leaveSchema);