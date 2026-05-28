const mongoose = require("mongoose");

/**
 * @typedef {Object} PayrollSchema
 * @property {mongoose.Types.ObjectId} user - **Reference** to the target employee (`User`).
 * @property {mongoose.Types.ObjectId} company - **Reference** to the user's Company.
 * @property {number} month - Calendar month for the payroll record (`1-12`).
 * @property {number} year - Calendar year (e.g., `2026`).
 * @property {number} basicPay - Employee's **basic salary** component.
 * @property {number} [hra] - **House Rent Allowance** component.
 * @property {number} [conveyance] - **Conveyance allowance** component.
 * @property {number} [medical] - **Medical allowance** component.
 * @property {number} [bonus] - **Performance** or custom bonus additions.
 * @property {number} [unpaidLeaveDeductions] - **Total salary deductions** computed from unpaid leaves.
 * @property {number} [taxes] - Computed **withholding taxes** (typically `10%`).
 * @property {number} grossPay - **Gross monthly salary** component (sum of basic, hra, conveyance, medical, bonus).
 * @property {number} netPay - **Net salary** disbursed to bank account (gross pay minus deductions and taxes).
 * @property {Date} [paidDate] - Salary disbursement timestamp.
 * @property {string} status - Processing state (`not-generated`, `pending`, `generated`).
 */
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
    hra: {
        type: Number,
        default: 0
    },
    conveyance: {
        type: Number,
        default: 0
    },
    medical: {
        type: Number,
        default: 0
    },
    bonus: {
        type: Number,
        default: 0
    },
    unpaidLeaveDeductions: {
        type: Number,
        default: 0
    },
    taxes: {
        type: Number,
        default: 0
    },
    grossPay: {
        type: Number,
        required: true
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

payrollSchema.index({ company: 1, year: 1, month: 1 });
payrollSchema.index({ user: 1, year: 1, month: 1 });
const Payroll = mongoose.model("Payroll", payrollSchema);

module.exports = Payroll;

