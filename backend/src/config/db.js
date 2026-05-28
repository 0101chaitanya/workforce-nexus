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
            
            // Drop legacy unique name_1 index if it exists (async, no need to wait for startup)
            mongoose.connection.db.collection('companies').dropIndex('name_1')
                .then(() => logger.info('Dropped legacy name_1 index from companies collection'))
                .catch((indexError) => {
                    if (indexError.code !== 27 && indexError.codeName !== 'IndexNotFound') {
                        logger.warn(`Could not drop legacy name_1 index: ${indexError.message}`);
                    }
                });

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
