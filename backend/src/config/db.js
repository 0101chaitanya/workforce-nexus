const mongoose = require('mongoose');
const logger = require("../utils/logger");

const migrateExistingUsers = async () => {
    try {
        const User = require('../models/User');
        const usersToMigrate = await User.find({
            $or: [
                { identity: { $exists: false } },
                { identity: null }
            ]
        });

        if (usersToMigrate.length > 0) {
            logger.info(`Migrating ${usersToMigrate.length} users to generate identity codes...`);
            for (const user of usersToMigrate) {
                await user.save();
            }
            logger.info('Migration of user identity codes completed successfully.');
        }
    } catch (err) {
        logger.error(`Error migrating user identities: ${err.message}`, { stack: err.stack });
    }
};

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        logger.info('MongoDB connected');
        return conn;
    } catch (error) {
        logger.error(`MongoDB connection error: ${error.message}`, { stack: error.stack });
        // process.exit(1);
    }
};

module.exports = connectDB;
