const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-salon');
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    // Keep application alive in case user hasn't started mongo yet, allowing clear logging
    console.warn('[Database Warning] MongoDB connection failed. Please ensure MongoDB is running or update MONGODB_URI in .env');
  }
};

module.exports = connectDB;
