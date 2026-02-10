const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Forgot Password fields
  resetOTP: { type: String },
  otpExpires: { type: Date },

  // Your MyList
  myList: [{
    title: String,
    image: String,
    link: String,
    genre: String,
    description: String
  }],

  // 👇 ADD THIS NEW SECTION 👇
  recentlyPlayed: [{
    title: String,
    image: String,
    link: String,
    genre: String,
    description: String,
    datePlayed: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model("User", userSchema);