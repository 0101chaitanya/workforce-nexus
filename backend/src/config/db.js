const mongoose = require('mongoose');
 const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
       // await conn.connection.db.dropDatabase();

      console.log('MongoDB connected');
     return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // process.exit(1);
  }
};
module.exports = connectDB;
