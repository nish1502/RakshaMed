// models/CallLog.js
const mongoose = require('mongoose');

const CallLogSchema = new mongoose.Schema({
  roomName: String,
  participant: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CallLog', CallLogSchema);
