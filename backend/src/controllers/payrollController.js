const Payroll = require("../models/Payroll");
const User = require("../models/User");
const Leave = require("../models/Leave");
const PDFDocument = require("pdfkit");
const logger = require("../utils/logger");

/**
 * Retrieves the payroll records history for employees.
 * Employees can only view their own history; **Owners** can fetch organization-wide records.
 * @route `GET /api/payroll/history`
 * @param {Object} req
 * @param {Object} req.query
 * @param {string} [req.query.targetUserId] - Target employee ID to filter (Owner only).
 * @param {number} [req.query.month] - Filter by specific calendar month.
 * @param {number} [req.query.year] - Filter by specific calendar year.
 * @returns {Promise<Object>} JSON response containing payroll entries list.
 */
exports.getPayrollHistory = async (req, res) => {
    try {
        const { targetUserId, page, limit } = req.query;
        const companyId = req.company._id;

        let query = { company: companyId };

        if (req.user.role === 'owner') {
            if (targetUserId) {
                query.user = targetUserId;
            }
        } else {
            // Normal user can only see their own payroll
            query.user = req.user._id;
        }

        if (page !== undefined && limit !== undefined) {
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 10;
            const skip = (pageNum - 1) * limitNum;

            const total = await Payroll.countDocuments(query);
            const payrollHistory = await Payroll.find(query)
                .populate('user', 'fullName email position identity')
                .sort({ year: -1, month: -1 })
                .skip(skip)
                .limit(limitNum);

            const totalPages = Math.ceil(total / limitNum);

            return res.status(200).json({
                message: "Payroll history fetched successfully",
                success: true,
                data: payrollHistory,
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
            const payrollHistory = await Payroll.find(query)
                .populate('user', 'fullName email position identity')
                .sort({ year: -1, month: -1 });

            return res.status(200).json({
                message: "Payroll history fetched successfully",
                success: true,
                data: payrollHistory
            });
        }

    } catch (err) {
        logger.error(`Error in getPayrollHistory: ${err.message || err}`, { stack: err.stack });
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            occurredAt: new Date().toISOString()
        });
    }
};

/**
 * Generates and streams a custom payslip **PDF** for a given payroll record.
 * @route `GET /api/payroll/:id/download`
 * @param {Object} req
 * @param {Object} req.params
 * @param {string} req.params.id - Payroll record ID.
 * @returns {Promise<void>} Streamed PDF document binary payload.
 */
exports.downloadPayslip = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.company._id;

        // Fetch the payroll record and populate user details
        const payroll = await Payroll.findOne({ _id: id, company: companyId })
            .populate('user', 'fullName email position branch identity');

        if (!payroll) {
            return res.status(404).json({ message: "Payroll record not found", success: false });
        }

        // Ensure employees can only download their own payslips
        if (req.user.role !== 'owner' && payroll.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to download this payslip", success: false });
        }

        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        const filename = `Payslip_${payroll.user.fullName.replace(/\s+/g, '_')}_${payroll.month}_${payroll.year}.pdf`;
        
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

        doc.pipe(res);

        // --- Header Section ---
        doc.fontSize(22).font('Helvetica-Bold').text('PAYSLIP', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).font('Helvetica').text(`Period: Month ${payroll.month}, ${payroll.year}`, { align: 'center' });
        doc.moveDown(2);

        // --- Employee Info Section ---
        doc.fontSize(14).font('Helvetica-Bold').text('Employee Details');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('black').stroke(); // Horizontal line
        doc.moveDown(0.5);
        
        doc.fontSize(11).font('Helvetica');
        const detailsY = doc.y;
        // Column 1
        doc.text(`Name: ${payroll.user.fullName}`, 50, detailsY);
        doc.text(`Employee ID: ${payroll.user.identity || 'N/A'}`, 50, detailsY + 16);
        doc.text(`Position: ${payroll.user.position || 'N/A'}`, 50, detailsY + 32);
        
        // Column 2
        doc.text(`Email: ${payroll.user.email}`, 300, detailsY);
        doc.text(`Branch: ${payroll.user.branch || 'N/A'}`, 300, detailsY + 16);
        doc.text(`Paid Date: ${payroll.paidDate ? new Date(payroll.paidDate).toLocaleDateString() : 'N/A'}`, 300, detailsY + 32);
        
        doc.y = detailsY + 55;
        doc.moveDown(1.5);

        // --- Payroll Details Section ---
        doc.fontSize(14).font('Helvetica-Bold').text('Earnings & Deductions');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('black').stroke();
        doc.moveDown(0.5);

        const tableStartY = doc.y;

        // Table Subheaders
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('Earnings', 50, tableStartY);
        doc.text('Amount', 200, tableStartY, { width: 80, align: 'right' });
        
        doc.text('Deductions', 310, tableStartY);
        doc.text('Amount', 460, tableStartY, { width: 80, align: 'right' });

        doc.y = tableStartY + 16;
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('gray').stroke();

        // Safe Defaults for Backward Compatibility
        const hra = payroll.hra || 0;
        const conveyance = payroll.conveyance || 0;
        const medical = payroll.medical || 0;
        const bonus = payroll.bonus || 0;
        const unpaidLeaveDeductions = payroll.unpaidLeaveDeductions || 0;
        const grossPay = payroll.grossPay || (payroll.basicPay + hra + conveyance + medical + bonus);
        const totalDeductions = (payroll.taxes || 0) + unpaidLeaveDeductions;
        
        doc.fontSize(10).font('Helvetica');
        
        const row1Y = doc.y + 8;
        doc.text('Basic Pay:', 50, row1Y);
        doc.text(`Rs. ${payroll.basicPay.toFixed(2)}`, 200, row1Y, { width: 80, align: 'right' });
        doc.text('Taxes:', 310, row1Y);
        doc.text(`Rs. ${(payroll.taxes || 0).toFixed(2)}`, 460, row1Y, { width: 80, align: 'right' });

        const row2Y = row1Y + 16;
        doc.text('House Rent Allowance (HRA):', 50, row2Y);
        doc.text(`Rs. ${hra.toFixed(2)}`, 200, row2Y, { width: 80, align: 'right' });
        doc.text('Unpaid Leave Deductions:', 310, row2Y);
        doc.text(`Rs. ${unpaidLeaveDeductions.toFixed(2)}`, 460, row2Y, { width: 80, align: 'right' });

        const row3Y = row2Y + 16;
        doc.text('Conveyance Allowance:', 50, row3Y);
        doc.text(`Rs. ${conveyance.toFixed(2)}`, 200, row3Y, { width: 80, align: 'right' });

        const row4Y = row3Y + 16;
        doc.text('Medical Allowance:', 50, row4Y);
        doc.text(`Rs. ${medical.toFixed(2)}`, 200, row4Y, { width: 80, align: 'right' });

        const row5Y = row4Y + 16;
        doc.text('Bonus:', 50, row5Y);
        doc.text(`Rs. ${bonus.toFixed(2)}`, 200, row5Y, { width: 80, align: 'right' });

        const totalsY = row5Y + 24;
        doc.moveTo(50, totalsY).lineTo(550, totalsY).strokeColor('gray').stroke();

        const totalsContentY = totalsY + 8;
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text('Gross Earnings:', 50, totalsContentY);
        doc.text(`Rs. ${grossPay.toFixed(2)}`, 200, totalsContentY, { width: 80, align: 'right' });
        
        doc.text('Total Deductions:', 310, totalsContentY);
        doc.text(`Rs. ${totalDeductions.toFixed(2)}`, 460, totalsContentY, { width: 80, align: 'right' });

        const netPayY = totalsContentY + 24;
        doc.moveTo(50, netPayY).lineTo(550, netPayY).strokeColor('black').stroke();

        const netPayContentY = netPayY + 8;
        doc.fontSize(13).font('Helvetica-Bold');
        doc.text('Net Payout:', 50, netPayContentY);
        doc.text(`Rs. ${payroll.netPay.toFixed(2)}`, 350, netPayContentY, { width: 190, align: 'right' });

        doc.y = netPayContentY + 25;

        // --- Footer Section ---
        doc.moveDown(5);
        doc.fontSize(10).font('Helvetica-Oblique').fillColor('gray');
        doc.text('This is a computer-generated document and requires no signature.', { align: 'center' });

        doc.end();

    } catch (err) {
        logger.error(`Error in downloadPayslip: ${err.message || err}`, { stack: err.stack });
        // Only send a JSON error if the PDF hasn't started streaming yet
        if (!res.headersSent) {
            return res.status(500).json({
                message: "Internal server error generating PDF",
                success: false,
                occurredAt: new Date().toISOString()
            });
        }
    }
};

/**
 * Computes and issues monthly payroll entries for all organization employees.
 * Accounts for unpaid leave deductions.
 * @route `POST /api/payroll/generate`
 * @param {Object} req
 * @param {Object} req.body
 * @param {number} req.body.month - Target payroll month (1-12).
 * @param {number} req.body.year - Target payroll year (e.g., 2026).
 * @returns {Promise<Object>} JSON response confirming payroll generation count.
 */
exports.generateCompanyPayroll = async (req, res) => {
    try {
        const companyId = req.company._id;

        // Find the most recently generated payroll for this company
        const lastPayroll = await Payroll.findOne({ company: companyId })
            .sort({ year: -1, month: -1 });

        let month, year;
        const currentDate = new Date();

        if (lastPayroll) {
            // Calculate the next month sequentially
            let nextMonth = lastPayroll.month + 1;
            year = lastPayroll.year;

            if (nextMonth > 12) {
                nextMonth = 1;
                year += 1;
            }

            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear();

            // Prevent generating payrolls for future months
            if (year > currentYear || (year === currentYear && nextMonth > currentMonth)) {
                return res.status(400).json({
                    message: "All past payrolls have already been generated up to the current month.",
                    success: false,
                    occurredAt: currentDate.toISOString()
                });
            }

            month = nextMonth;
        } else {
            // Fallback if no payrolls exist: use the previous month
            let targetMonthIndex = currentDate.getMonth();
            year = currentDate.getFullYear();
            if (targetMonthIndex === 0) {
                targetMonthIndex = 11;
                year -= 1;
            } else {
                targetMonthIndex -= 1;
            }
            month = targetMonthIndex + 1;
        }

        // Fetch all employees for the company (excluding owners)
        const users = await User.find({ company: companyId, role: 'employee' });

        if (!users || users.length === 0) {
            return res.status(404).json({
                message: "No users found in the company",
                success: false,
                occurredAt: new Date().toISOString()
            });
        }

        // Calculate days in the target month for daily wage calculation
        const daysInMonth = new Date(year, month, 0).getDate();

        // Fetch all approved unpaid leaves that overlap with the target month
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

        const unpaidLeaves = await Leave.find({
            company: companyId,
            status: 'approved',
            type: 'unpaid',
            $or: [
                { startDate: { $lte: monthEnd }, endDate: { $gte: monthStart } }
            ]
        });

        // Group unpaid leave days by user
        const getDayStart = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        const startOfM = getDayStart(monthStart);
        const endOfM = getDayStart(monthEnd);

        const leaveDeductionsByUser = {};
        for (const leave of unpaidLeaves) {
            const userIdStr = leave.user.toString();
            if (!leaveDeductionsByUser[userIdStr]) leaveDeductionsByUser[userIdStr] = 0;

            const lStart = getDayStart(leave.startDate);
            const lEnd = getDayStart(leave.endDate);

            const actualStart = Math.max(lStart, startOfM);
            const actualEnd = Math.min(lEnd, endOfM);

            if (actualStart <= actualEnd) {
                const days = Math.round((actualEnd - actualStart) / (1000 * 60 * 60 * 24)) + 1;
                leaveDeductionsByUser[userIdStr] += days;
            }
        }

        const payrolls = [];
        for (const user of users) {
            // Check if payroll already exists for this user for the given month and year
            const existingPayroll = await Payroll.findOne({
                user: user._id,
                company: companyId,
                month,
                year
            });

            if (existingPayroll) {
                continue; // Skip if already generated for this user
            }

            const grossSalary = user.salary || 0;
            const dailyWage = grossSalary / daysInMonth;
            const unpaidDays = leaveDeductionsByUser[user._id.toString()] || 0;
            const unpaidLeaveDeductions = Math.round(unpaidDays * dailyWage);

            const basicPay = Math.round(grossSalary * 0.5);
            const hra = Math.round(grossSalary * 0.3);
            const conveyance = Math.round(grossSalary * 0.1);
            const medical = Math.round(grossSalary * 0.1);
            const bonus = 0;
            const grossPay = basicPay + hra + conveyance + medical + bonus;

            const taxableIncome = grossPay - unpaidLeaveDeductions;
            const taxes = taxableIncome > 50000 ? Math.round(taxableIncome * 0.1) : 0;
            const netPay = taxableIncome - taxes;

            payrolls.push({
                user: user._id,
                company: companyId,
                month,
                year,
                basicPay,
                hra,
                conveyance,
                medical,
                bonus,
                unpaidLeaveDeductions,
                grossPay,
                taxes,
                netPay,
                status: 'generated'
            });
        }

        if (payrolls.length === 0) {
            return res.status(400).json({
                message: "Payroll already generated for all users for this period",
                success: false,
                occurredAt: new Date().toISOString()
            });
        }

        // Insert new payroll documents into the database
        await Payroll.insertMany(payrolls);

        return res.status(201).json({
            message: `Payroll generated successfully for ${payrolls.length} users`,
            success: true,
            data: payrolls
        });

    } catch (err) {
        logger.error(`Error in generateCompanyPayroll: ${err.message || err}`, { stack: err.stack });
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            occurredAt: new Date().toISOString()
        });
    }
};

/**
 * Generates and downloads tenure-based payroll overview history.
 * @route `GET /api/payroll/tenure/download`
 * @param {Object} req
 * @returns {Promise<void>} Streamed PDF document binary payload.
 */
exports.downloadTenurePayslip = async (req, res) => {
    try {
        const companyId = req.company._id;
        let userId = req.user._id;

        // If the owner specifies a targetUserId, allow them to download for that user
        if (req.user.role === 'owner' && req.query.targetUserId) {
            userId = req.query.targetUserId;
        }

        // Fetch user info
        const employee = await User.findOne({ _id: userId, company: companyId });
        if (!employee) {
            return res.status(404).json({ message: "Employee not found", success: false });
        }

        // Fetch all payroll records for this employee sorted chronologically
        const payrollHistory = await Payroll.find({ user: userId, company: companyId })
            .sort({ year: 1, month: 1 });

        if (!payrollHistory || payrollHistory.length === 0) {
            return res.status(404).json({ message: "No payroll records found for this employee's tenure", success: false });
        }

        // Calculate totals
        let totalGross = 0;
        let totalDeductions = 0;
        let totalTaxes = 0;
        let totalNet = 0;

        payrollHistory.forEach(p => {
            const hra = p.hra || 0;
            const conveyance = p.conveyance || 0;
            const medical = p.medical || 0;
            const bonus = p.bonus || 0;
            const unpaidLeaveDeductions = p.unpaidLeaveDeductions || 0;
            const grossPay = p.grossPay || (p.basicPay + hra + conveyance + medical + bonus);

            totalGross += grossPay;
            totalDeductions += unpaidLeaveDeductions;
            totalTaxes += p.taxes || 0;
            totalNet += p.netPay || 0;
        });

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const filename = `Tenure_Payslip_${employee.fullName.replace(/\s+/g, '_')}.pdf`;

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

        doc.pipe(res);

        // --- Header Section ---
        doc.fontSize(22).font('Helvetica-Bold').text('CONSOLIDATED TENURE PAYSLIP', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).font('Helvetica').fillColor('gray').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.fillColor('black');
        doc.moveDown(2);

        // --- Employee Info Section ---
        doc.fontSize(14).font('Helvetica-Bold').text('Employee Profile');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        doc.fontSize(11).font('Helvetica');
        doc.text(`Name: ${employee.fullName}`);
        doc.text(`Employee ID: ${employee.identity || 'N/A'}`);
        doc.text(`Email: ${employee.email}`);
        doc.text(`Position: ${employee.position || 'N/A'}`);
        doc.text(`Branch: ${employee.branch || 'N/A'}`);
        doc.moveDown(2);

        // --- Tenure Summary ---
        doc.fontSize(14).font('Helvetica-Bold').text('Tenure Earnings Summary');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        doc.fontSize(11).font('Helvetica-Bold');
        doc.text('Total Months Active: ', { continued: true }).font('Helvetica').text(`${payrollHistory.length}`);
        doc.font('Helvetica-Bold').text('Total Gross Earnings: ', { continued: true }).font('Helvetica').text(`Rs. ${totalGross.toFixed(2)}`);
        doc.font('Helvetica-Bold').text('Total Leave Deductions: ', { continued: true }).font('Helvetica').text(`Rs. ${totalDeductions.toFixed(2)}`);
        doc.font('Helvetica-Bold').text('Total Taxes Deducted: ', { continued: true }).font('Helvetica').text(`Rs. ${totalTaxes.toFixed(2)}`);
        doc.font('Helvetica-Bold').text('Total Net Pay Paid: ', { continued: true }).font('Helvetica').text(`Rs. ${totalNet.toFixed(2)}`);
        doc.moveDown(2.5);

        // --- Detailed Statement Table ---
        doc.fontSize(14).font('Helvetica-Bold').text('Monthly Breakdown');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        // Table Header
        doc.fontSize(10).font('Helvetica-Bold');
        const headerY = doc.y;
        doc.text('Period', 50, headerY);
        doc.text('Gross Pay', 130, headerY, { width: 80, align: 'right' });
        doc.text('Deductions', 220, headerY, { width: 80, align: 'right' });
        doc.text('Taxes', 310, headerY, { width: 70, align: 'right' });
        doc.text('Net Pay', 390, headerY, { width: 80, align: 'right' });
        doc.text('Status', 480, headerY, { width: 70, align: 'right' });
        doc.y = headerY + 15;
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('black').stroke();
        doc.y = doc.y + 10;

        doc.font('Helvetica');
        // Loop records
        for (const record of payrollHistory) {
            if (doc.y > 750) {
                doc.addPage();
                doc.fontSize(10).font('Helvetica-Bold');
                const pageHeaderY = doc.y;
                doc.text('Period', 50, pageHeaderY);
                doc.text('Gross Pay', 130, pageHeaderY, { width: 80, align: 'right' });
                doc.text('Deductions', 220, pageHeaderY, { width: 80, align: 'right' });
                doc.text('Taxes', 310, pageHeaderY, { width: 70, align: 'right' });
                doc.text('Net Pay', 390, pageHeaderY, { width: 80, align: 'right' });
                doc.text('Status', 480, pageHeaderY, { width: 70, align: 'right' });
                doc.y = pageHeaderY + 15;
                doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('black').stroke();
                doc.y = doc.y + 10;
                doc.font('Helvetica');
            }

            const recordHra = record.hra || 0;
            const recordConveyance = record.conveyance || 0;
            const recordMedical = record.medical || 0;
            const recordBonus = record.bonus || 0;
            const recordUnpaidDeductions = record.unpaidLeaveDeductions || 0;
            const recordGrossPay = record.grossPay || (record.basicPay + recordHra + recordConveyance + recordMedical + recordBonus);

            const rowY = doc.y;
            doc.text(`${record.month}/${record.year}`, 50, rowY);
            doc.text(`Rs. ${recordGrossPay.toFixed(2)}`, 130, rowY, { width: 80, align: 'right' });
            doc.text(`Rs. ${recordUnpaidDeductions.toFixed(2)}`, 220, rowY, { width: 80, align: 'right' });
            doc.text(`Rs. ${record.taxes.toFixed(2)}`, 310, rowY, { width: 70, align: 'right' });
            doc.text(`Rs. ${record.netPay.toFixed(2)}`, 390, rowY, { width: 80, align: 'right' });
            doc.text(`${record.status}`, 480, rowY, { width: 70, align: 'right' });
            doc.y = rowY + 18;
        }

        // --- Footer Section ---
        doc.moveDown(2);
        doc.fontSize(10).font('Helvetica-Oblique').fillColor('gray');
        doc.text('This is a computer-generated consolidated statement and requires no signature.', { align: 'center' });

        doc.end();

    } catch (err) {
        logger.error(`Error in downloadTenurePayslip: ${err.message || err}`, { stack: err.stack });
        if (!res.headersSent) {
            return res.status(500).json({
                message: "Internal server error generating consolidated PDF",
                success: false,
                occurredAt: new Date().toISOString()
            });
        }
    }
};
