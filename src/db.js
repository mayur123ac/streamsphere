const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Priority 1: Cloud Database (Render)
    // Priority 2: Local Database (Your Laptop)
    const db = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/netflixAuth";

    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;