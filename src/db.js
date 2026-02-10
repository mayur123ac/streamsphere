const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Force the use of the Vercel variable
    const db = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!db) {
      throw new Error("❌ No MongoDB URI found in Environment Variables!");
    }

    await mongoose.connect(db);
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    // In Vercel, don't exit the process, just log the error
  }
};

module.exports = connectDB;