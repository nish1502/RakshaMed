// routes/callLogs.js
const express = require('express');
const router = express.Router();
const CallLog = require('../models/CallLog');

// Save a call log
router.post('/log', async (req, res) => {
  try {
    const { roomName, participant } = req.body;
    const log = new CallLog({ roomName, participant });
    await log.save();
    res.json({ message: 'Call log saved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving call log' });
  }
});

// Get all call logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await CallLog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching logs' });
  }
});

module.exports = router;
