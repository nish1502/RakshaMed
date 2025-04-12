// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Update timezone
router.post('/update-timezone', async (req, res) => {
  const { email, timezone } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, timezone });
    } else {
      user.timezone = timezone;
    }
    await user.save();
    res.json({ success: true, message: 'Timezone updated', user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error', error: err });
  }
});

module.exports = router;
