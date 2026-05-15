const Company = require("../models/Company");
const User = require("../models/User");

const secureDetailsSender = async (companyId, userId) => {
    const company = await Company.findById(companyId)
        .populate('owner', '-password -__v -otp -otpExpiry -joinDate -createdAt -updatedAt -refreshToken')

    const user = await User.findById(userId).populate("company");

    return {
        company: {
        }, user: {
        }
    };
}
module.exports = secureDetailsSender;
