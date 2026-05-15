const jwt = require("jsonwebtoken");


const protect = async (req, res, next) => {

    try {
        const token =
            req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_TOKEN);
        req.user = decoded.user;
        req.company = decoded.company;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
}
const isAuthorized = () => (req, res, next) => {
    if (req.user.role === 'owner') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Insufficient permissions',
        });
    }



};

module.exports = { protect, isAuthorized };
