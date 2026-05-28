const winston = require('winston');
const path = require('path');

const { combine, timestamp, printf, colorize, errors } = winston.format;

/**
 * Custom log formatting function for print output styling.
 * @param {Object} info - Log details.
 * @param {string} info.level - Log level (e.g., `info`, `error`).
 * @param {string} info.message - Log text message.
 * @param {string} info.timestamp - Timestamp.
 * @param {string} [info.stack] - Error stack trace context.
 * @returns {string} Formatted log entry.
 */
const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
});

/**
 * Winston Logger configuration orchestrating output log streams (`combined logs`, `error files`, `console`).
 * @type {winston.Logger}
 */
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }), // capture stack trace
        logFormat
    ),
    transports: [
        // In serverless environments like Vercel, the file system is read-only (except /tmp).
        // File transports will crash the app in production, so we only enable them in development.
        ...(process.env.NODE_ENV !== 'production' ? [
            new winston.transports.File({ 
                filename: path.join('logs', 'error.log'), 
                level: 'error' 
            }),
            new winston.transports.File({ 
                filename: path.join('logs', 'combined.log') 
            })
        ] : []),

        // Always log to the console. In Vercel, this automatically routes logs to the Vercel Dashboard.
        new winston.transports.Console({
            format: combine(
                ...(process.env.NODE_ENV !== 'production' ? [colorize()] : []), // Colorize only in dev
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                logFormat
            ),
        })
    ],
});

module.exports = logger;

