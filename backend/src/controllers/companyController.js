
const Company = require("../models/Company");
const { catchAsync } = require("../middleware/authMiddleware");

/**
 * Retrieves public information about a company (e.g., `logo`, `companyName`, `address`, owner name) for registration/auth references.
 * @route `GET /api/company/public/:id`
 * @param {Object} req
 * @param {Object} req.params
 * @param {string} req.params.id - Company ID.
 * @returns {Promise<Object>} JSON response containing company name, logo, address, and owner.
 */
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

/**
 * Retrieves full details of the authenticated user's associated company.
 * @route `GET /api/company/details`
 * @param {Object} req
 * @param {Object} req.company - Associated company details.
 * @returns {Promise<Object>} JSON response containing full company details.
 */
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

/**
 * Updates company profile details, including physical coordinates and boundary constraints (**Owner only**).
 * @route `PUT /api/company/update`
 * @param {Object} req
 * @param {Object} req.company - Associated company details.
 * @param {Object} req.body
 * @param {string} [req.body.companyName] - Company name.
 * @param {string} [req.body.address] - Company address.
 * @param {string} [req.body.phone] - Company phone number.
 * @param {number} [req.body.latitude] - Office coordinate latitude.
 * @param {number} [req.body.longitude] - Office coordinate longitude.
 * @param {number} [req.body.proximityRadius] - Physical boundary check radius in meters.
 * @returns {Promise<Object>} JSON response containing updated company details.
 */
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

