const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Check both potential environment variable names
    const db = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/netflixAuth";

    await mongoose.connect(db); // Simplified for modern Mongoose versions
    
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    // Do not use process.exit(1) in a Serverless environment like Vercel 
    // as it can prevent the logs from showing the full error.
  }
};

module.exports = connectDB;