const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
    },

    company: {
        type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true,
    },

    startDate: {
        type: Date, required: true,
    },

    endDate: {
        type: Date, required: true,
    },

    reason: {
        type: String, trim: true,
    },

    leaveType: {
        type: String,
        enum: ["sick", "personal", "annual", "unpaid"],
        default: "personal",
    },

    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    }, approvalDate: {
        type: Date,
    }, rejectionReason: {
        type: String,
    },
}, { timestamps: true });

const Leave = mongoose.model("Leave", leaveSchema);

module.exports = Leave;
