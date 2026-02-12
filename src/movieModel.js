// movieModel.js
const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    genre: String,
    image: String,
    link: String,
    description: String,
    addedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Movie", movieSchema);