const mongoose = require("mongoose");
const Company = require("../models/Company");
const { catchAsync } = require("../middleware/authMiddleware");

exports.getPublicCompanyInfo = catchAsync(async (req, res) => {
    const { id } = req.params;

    /* if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid company ID format", success: false });
    } */

    const company = await Company.findById(id)
        .select("companyName logo address")
        .populate("owner", "fullName");

    if (!company) {
        return res.status(404).json({ message: "Company not found", success: false, occurredAt: new Date().toISOString() });
    }

    return res.status(200).json({
        success: true,
        message: "Public company details fetched successfully",
        data: company
    });
});

exports.getProtectedCompanyInfo = catchAsync(async (req, res) => {
    const companyId = req.company._id;

    const company = await Company.findById(companyId).populate("owner", "fullName email phone role");

    if (!company) {
        return res.status(404).json({ message: "Company not found", success: false, occurredAt: new Date().toISOString() });
    }

    return res.status(200).json({
        success: true,
        message: "Protected company details fetched successfully",
        data: company
    });
});
