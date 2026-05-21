const mongoose = require('mongoose');
const logger = require("../utils/logger");

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
