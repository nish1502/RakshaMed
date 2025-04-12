const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/user/update-timezone
router.post('/update-timezone', async (req, res) => {
    const { email, timezone } = req.body;

    try {
        const user = await User.findOneAndUpdate(
            { email },
            { timezone },
            { new: true, upsert: true }
        );

        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;

