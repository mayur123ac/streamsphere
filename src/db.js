// db.js
const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const connectDB = async () => {
  try {
    const db = process.env.MONGO_URI;

    if (!db) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

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