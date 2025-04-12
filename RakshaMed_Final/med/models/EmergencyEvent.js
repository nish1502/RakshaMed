const mongoose = require('mongoose');

const EmergencyEventSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  medicationId: mongoose.Schema.Types.ObjectId,
  missedTime: Date,
  status: { type: String, enum: ['unresolved', 'resolved'], default: 'unresolved' },
  message: String
});

module.exports = mongoose.model('EmergencyEvent', EmergencyEventSchema);
