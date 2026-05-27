const mongoose = require('mongoose');
const logger = require("../utils/logger");

/**
 * Establishes a connection to the MongoDB database using the MONGODB_URI environment variable.
 * Additionally, it drops the legacy unique `name_1` index if it exists in the companies collection.
 * 
 * @returns {Promise<mongoose.Connection>} Resolves with the mongoose connection object.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        logger.info('MongoDB connected');

        // Drop legacy unique name_1 index if it exists
        try {
            await mongoose.connection.db.collection('companies').dropIndex('name_1');
            logger.info('Dropped legacy name_1 index from companies collection');
        } catch (indexError) {
            if (indexError.code !== 27 && indexError.codeName !== 'IndexNotFound') {
                logger.warn(`Could not drop legacy name_1 index: ${indexError.message}`);
            }
        }

        return conn;
    } catch (error) {
        logger.error(`MongoDB connection error: ${error.message}`, { stack: error.stack });
        // process.exit(1);
    }
};

module.exports = connectDB;
