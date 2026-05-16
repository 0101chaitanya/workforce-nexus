const winston = require('winston');
const path = require('path');

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom format for logs
const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
});

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }), // capture stack trace
        logFormat
    ),
    transports: [
        // 1. Write all logs with level 'error' and below to 'error.log'
        new winston.transports.File({ 
            filename: path.join('logs', 'error.log'), 
            level: 'error' 
        }),
        // 2. Write all logs with level 'info' and below to 'combined.log'
        new winston.transports.File({ 
            filename: path.join('logs', 'combined.log') 
        }),
    ],
});

// If we're not in production, also log to the console with colors
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: combine(
            colorize(),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            logFormat
        ),
    }));
}

module.exports = logger;
