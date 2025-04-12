// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  timezone: String,
  mood: String,
  symptoms: String
});

module.exports = mongoose.model('User', userSchema);
