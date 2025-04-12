const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');

const User = require('./models/User');
const Medication = require('./models/Medication');
const ConfirmedDose = require('./models/ConfirmedDose'); // use this if you renamed DoseStatus
const EmergencyEvent = require('./models/EmergencyEvent');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'front')));

// Route to serve the emergency alerts page
app.get('/emergency', (req, res) => {
    res.sendFile(path.join(__dirname, 'front', 'emergency-alerts.html'));
});

// MongoDB Connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/rakshameddb');
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Default Route
app.get('/', (req, res) => {
  res.redirect('/emergency-alerts.html');
});

// Your existing route
app.get('/api/seed', async (req, res) => {
  const sample = new EmergencyEvent({
    medicationName: 'Paracetamol',
    userName: 'John Doe',
    missedTime: new Date(),
    status: 'Missed',
  });
  await sample.save();
  res.send('Seeded!');
});

// Confirm Dose API
app.post('/api/confirm-dose', async (req, res) => {
  const { userId, medicationId, scheduledTime } = req.body;
  try {
    await ConfirmedDose.create({
      userId,
      medicationId,
      scheduledTime: new Date(scheduledTime),
      confirmed: true,
      confirmedAt: new Date(),
    });
    res.send({ success: true, message: 'Dose confirmed.' });
  } catch (err) {
    res.status(500).send({ success: false, error: err.message });
  }
});

// Emergency Alert GET
app.get('/api/emergencies', async (req, res) => {
  try {
    const emergencies = await EmergencyEvent.find()
      .populate('userId')
      .populate('medicationId');

    const response = emergencies.map(ev => ({
      _id: ev._id,
      medicationName: ev.medicationId?.medicationName || 'Unknown',
      userName: ev.userId?.name || 'Unknown',
      missedTime: ev.missedTime,
      status: ev.status,
    }));

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch emergencies.' });
  }
});

// Emergency Alert POST (Resolve)
app.post('/api/emergencies/:id/resolve', async (req, res) => {
  try {
    await EmergencyEvent.findByIdAndUpdate(req.params.id, { status: 'resolved' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve emergency.' });
  }
});

// Emergency Cron Job - every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  const now = new Date();
  const pastTime = new Date(now.getTime() - 15 * 60 * 1000); // 15 min window

  const medications = await Medication.find({ isCritical: true });

  for (const med of medications) {
    const scheduledToday = new Date();
    const [hour, minute] = med.time.split(':');
    scheduledToday.setHours(hour, minute, 0, 0);

    if (scheduledToday <= now && scheduledToday >= pastTime) {
      const doseExists = await ConfirmedDose.findOne({
        userId: med.userId,
        medicationId: med._id,
        scheduledTime: scheduledToday,
      });

      if (!doseExists) {
        await EmergencyEvent.create({
          userId: med.userId,
          medicationId: med._id,
          missedTime: scheduledToday,
          status: 'unresolved',
          message: 'Critical dose missed',
        });
        console.log(`🚨 Emergency created for user ${med.userId}`);
      }
    }
  }
});

// Test data endpoint
app.post('/api/test-data', async (req, res) => {
  try {
    // Create test user
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      role: 'user'
    });

    // Create test medication
    const medication = await Medication.create({
      userId: user._id,
      medicationName: 'Insulin',
      dosage: '10mg',
      time: '08:00',
      isCritical: true,
      guidance: 'Take with food'
    });

    // Create test emergency
    const emergency = await EmergencyEvent.create({
      userId: user._id,
      medicationId: medication._id,
      missedTime: new Date(),
      status: 'unresolved',
      message: 'Critical insulin dose missed'
    });

    res.json({ 
      message: 'Test data created successfully',
      user,
      medication,
      emergency
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test connection endpoint
app.get('/api/status', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const status = {
      server: 'running',
      database: dbState === 1 ? 'connected' : 'disconnected',
      collections: {
        users: await User.countDocuments(),
        medications: await Medication.countDocuments(),
        emergencies: await EmergencyEvent.countDocuments()
      }
    };
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
