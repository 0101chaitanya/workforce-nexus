const jwt = require("jsonwebtoken");

const catchAsync = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (err) {
        console.error(`Error: ${err.message || err}`);
        
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Invalid or expired token", success: false });
        }

        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

const protect = catchAsync(async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    req.user = decoded.user;
    req.company = decoded.company;
    next();
});

const isAuthorized = (...roles) => (req, res, next) => {
    const allowedRoles = roles.length > 0 ? roles : ['owner'];
    
    if (allowedRoles.includes(req.user.role)) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Insufficient permissions',
        });
    }
};

module.exports = { catchAsync, protect, isAuthorized };
