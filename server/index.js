// server/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

// ====== Middleware ======
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.set('trust proxy', true); // trust X-Forwarded-* headers when behind proxies

// ====== API Routes ======
app.use('/api/analytics', analyticsRoutes);
app.get('/api/health', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV }));

// ====== Serve Frontend (if applicable) ======
const __dirnameDir = path.resolve();

// If you're also deploying a frontend (e.g. React build folder inside "client")
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirnameDir, 'client', 'build')));

  // Catch-all: send back React index.html for any unknown route
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirnameDir, 'client', 'build', 'index.html'));
  });
} else {
  // Development fallback route
  app.get('/', (req, res) => {
    res.send('Orenda API is running...');
  });
}

// ====== Connect to MongoDB and Start Server ======
async function start() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not set');

    await mongoose.connect(uri);
    console.log('MongoDB connected');

    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  } catch (err) {
    console.error('Startup error', err);
    process.exit(1);
  }
}

start();