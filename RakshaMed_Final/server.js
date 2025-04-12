// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Serve static frontend files (like timezone.html, video-call.html)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/RakshaMedDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// ✅ Routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// ✅ Call Logs Routes
const callLogs = require('./routes/callLogs');
app.use('/api/call', callLogs);

// ✅ Default route
app.get('/', (req, res) => {
  res.send('🚀 RakshaMed Backend is running!');
});

// ✅ Server port
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running at http://localhost:${PORT}`);
});
