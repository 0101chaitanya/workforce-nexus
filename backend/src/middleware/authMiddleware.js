const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

/**
 * Wrapper to catch **async route handler exceptions** and route them to Express error handlers or standard logger.
 * @param {Function} fn - Async express middleware/controller function.
 * @returns {Function} Express middleware wrapper.
 */
const catchAsync = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (err) {
        logger.error(`Error in catchAsync: ${err.message || err}`, { stack: err.stack });

        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Invalid or expired token", success: false, occurredAt: new Date().toISOString() });
        }

        return res.status(500).json({ message: "Internal server error", success: false, occurredAt: new Date().toISOString() });
    }
};

/**
 * Verifies authorization bearer **JWT token** in headers and injects user/company payload contexts.
 * @type {Function} Express middleware.
 */
const protect = catchAsync(async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided', occurredAt: new Date().toISOString() });
    }

    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    req.user = decoded.user;
    req.company = decoded.company;
    next();
});

/**
 * Checks if the authenticated user possesses the correct access permissions/roles (e.g., `owner`, `employee`).
 * @param {...string} roles - Permitted user permission roles.
 * @returns {Function} Express middleware.
 */
const isAuthorized = (...roles) => (req, res, next) => {
    const allowedRoles = roles.length > 0 ? roles : ['owner'];

    if (allowedRoles.includes(req.user.role)) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Insufficient permissions',
            occurredAt: new Date().toISOString()
        });
    }
};

module.exports = { catchAsync, protect, isAuthorized };

