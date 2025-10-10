// server/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const analyticsRoutes = require('./routes/analytics');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.set('trust proxy', true); // trust X-Forwarded-* headers when behind proxies

// Root route - handles the 404 you're seeing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Axis Compass API',
    status: 'healthy',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      analytics: '/api/analytics'
    }
  });
});

// API routes
app.use('/api/analytics', analyticsRoutes);
app.get('/api/health', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV }));

async function start() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not set');
    
    // Remove deprecated options - they're not needed anymore
    await mongoose.connect(uri);
    console.log('MongoDB connected');
    
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  } catch (err) {
    console.error('Startup error', err);
    process.exit(1);
  }
}

start();