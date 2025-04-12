const mongoose = require('mongoose');

const ConfirmedDoseSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  medicationId: mongoose.Schema.Types.ObjectId,
  scheduledTime: Date,
  confirmed: Boolean,
  confirmedAt: Date
});

module.exports = mongoose.model('ConfirmedDose', ConfirmedDoseSchema);
