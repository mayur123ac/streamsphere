const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Standard Vercel Environment Variable name
    const db = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!db) {
      console.error("❌ CRITICAL: No MONGODB_URI found in Vercel Environment Variables.");
      return; 
    }

    await mongoose.connect(db);
    // This message is what we will look for in the Vercel Logs
    console.log(`✅ DATABASE CONNECTED SUCCESSFULLY: ${mongoose.connection.host}`);
  } catch (err) {
    console.error("❌ DATABASE CONNECTION FAILED:", err.message);
  }
};

module.exports = connectDB;