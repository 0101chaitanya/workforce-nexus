const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema({
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

    month: {
        type: Number, // 1 for January, 12 for December
        min: 1,
        max: 12,
        required: true
    },
    year: {
        type: Number, // e.g., 2026
        required: true
    },
    basicPay: {
        type: Number,
        required: true
    },
    taxes: {
        type: Number,
        default: 0
    },
    netPay: {
        type: Number,
        required: true
    },
    paidDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ["not-generated", 'pending', 'generated'],
        default: 'not-generated'
    }
}, { timestamps: true });

const Payroll = mongoose.model("Payroll", payrollSchema);

module.exports = Payroll;
