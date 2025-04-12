const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  medicationName: String,
  dosage: String,
  time: String, // format: "08:00"
  isCritical: Boolean,
  guidance: String
});

module.exports = mongoose.model('Medication', MedicationSchema);
