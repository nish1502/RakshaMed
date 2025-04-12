const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  role: { type: String, enum: ['user', 'caregiver', 'admin'], default: 'user' }
});

module.exports = mongoose.model('User', UserSchema);
