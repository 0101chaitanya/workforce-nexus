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

exports.updateCompanyInfo = catchAsync(async (req, res) => {
    const companyId = req.company._id;
    const { companyName, address, phone, latitude, longitude, proximityRadius } = req.body;

    const company = await Company.findById(companyId);

    if (!company) {
        return res.status(404).json({ message: "Company not found", success: false, occurredAt: new Date().toISOString() });
    }

    if (companyName !== undefined) company.companyName = companyName;
    if (address !== undefined) company.address = address;
    if (phone !== undefined) company.phone = phone;
    if (latitude !== undefined) company.latitude = latitude;
    if (longitude !== undefined) company.longitude = longitude;
    if (proximityRadius !== undefined) company.proximityRadius = proximityRadius;

    await company.save();

    const updatedCompany = await Company.findById(companyId).populate("owner", "fullName email phone role");

    return res.status(200).json({
        success: true,
        message: "Company details updated successfully",
        data: updatedCompany
    });
});
