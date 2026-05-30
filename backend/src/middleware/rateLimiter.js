const rateLimit = require('express-rate-limit');
const MongoStore = require('rate-limit-mongo');
const dotenv = require('dotenv');

dotenv.config();

// Default configurations
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const globalLimiter = rateLimit({
    store: new MongoStore({
        uri: process.env.MONGODB_URI,
        collectionName: 'rate-limits-global',
        expireTimeMs: WINDOW_MS,
        errorHandler: console.error.bind(null, 'rate-limit-mongo')
    }),
    windowMs: WINDOW_MS,
    max: 100, // Limit each IP to 100 requests per `window`
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const authLimiter = rateLimit({
    store: new MongoStore({
        uri: process.env.MONGODB_URI,
        collectionName: 'rate-limits-auth',
        expireTimeMs: WINDOW_MS,
        errorHandler: console.error.bind(null, 'rate-limit-mongo')
    }),
    windowMs: WINDOW_MS,
    max: 5, // Limit each IP to 5 requests per window for auth routes
    message: { success: false, message: 'Too many authentication attempts from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { globalLimiter, authLimiter };
