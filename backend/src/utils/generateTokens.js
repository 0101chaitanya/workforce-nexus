const jwt = require("jsonwebtoken")

/**
 * Generates a short-lived access JWT token (expiring in **15 minutes**) for a user session.
 * @param {Object} user - User record object.
 * @param {Object} company - Company record object.
 * @returns {string} Signed JWT access token.
 */
const generateAccessToken = (user, company) => {
    const payload = {
        user: {
            _id: user._id,
            email: user.email,
            role: user.role,
            fullName: user.fullName
        },
        company: {
            _id: company._id,
            companyName: company.companyName
        } 
    };
    return jwt.sign(payload, process.env.JWT_TOKEN, { expiresIn: "15m" })
}


/**
 * Generates a long-lived refresh JWT token (expiring in **7 days**) for session maintenance.
 * @param {Object} user - User record object.
 * @param {Object} company - Company record object.
 * @returns {string} Signed JWT refresh token.
 */
const generateRefreshToken = (user, company) => {
    const payload = {
        user: {
            _id: user._id,
            email: user.email,
            role: user.role,
            fullName: user.fullName
        },
        company:  {
            _id: company._id,
            companyName: company.companyName
        } 
    };
    return jwt.sign(payload, process.env.JWT_REFRESH_TOKEN, { expiresIn: "7d" })
}

module.exports = { generateAccessToken, generateRefreshToken }

