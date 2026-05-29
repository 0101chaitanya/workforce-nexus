const mongoose = require('mongoose');
const logger = require("../utils/logger");

// Global cache for serverless environments (Vercel)
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Establishes a connection to the MongoDB database using the MONGODB_URI environment variable.
 * Implements connection caching for Serverless environments.
 * 
 * @returns {Promise<mongoose.Connection>} Resolves with the mongoose connection object.
 */
const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
            logger.info('MongoDB connected successfully');

            return mongoose;
        }).catch((error) => {
            logger.error(`MongoDB connection error: ${error.message}`, { stack: error.stack });
            cached.promise = null;
            throw error;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
};

module.exports = connectDB;
