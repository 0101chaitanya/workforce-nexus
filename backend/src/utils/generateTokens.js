const jwt = require("jsonwebtoken")

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
