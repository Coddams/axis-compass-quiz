// server/routes/analytics.js
const express = require('express');
const router = express.Router();
const UserAnalytics = require('../models/Analytics');
const rateLimit = require('express-rate-limit');

const adminApiKey = process.env.API_KEY_ADMIN || 'CHANGE_ME';

// basic rate limiter for all analytics endpoints
const limiter = rateLimit({ windowMs: 30 * 1000, max: 60 });
router.use(limiter);

// Upsert session
router.post('/session', async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.sessionId) return res.status(400).json({ error: 'sessionId required' });

    // server-sourced fields
    payload.ipAddress = req.ip || (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
    payload.userAgent = req.get('User-Agent') || payload.userAgent || 'unknown';
    payload.referrer = payload.referrer || req.get('Referer') || undefined;

    const doc = await UserAnalytics.findOneAndUpdate(
      { sessionId: payload.sessionId },
      { $set: payload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Update session partially
router.put('/session/:sessionId', async (req, res) => {
  try {
    const update = req.body || {};
    update.ipAddress = req.ip || update.ipAddress;
    update.userAgent = req.get('User-Agent') || update.userAgent;
    const doc = await UserAnalytics.findOneAndUpdate(
      { sessionId: req.params.sessionId },
      { $set: update },
      { new: true }
    );
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Admin-only endpoints below: require API key
function requireAdmin(req, res, next) {
  const key = req.get('x-api-key') || req.query.api_key;
  if (!key || key !== adminApiKey) return res.status(401).json({ error: 'unauthorized' });
  next();
}

// Fetch sessions (supports simple filters)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const q = {};
    if (req.query.completed) q.completed = req.query.completed === 'true';
    const docs = await UserAnalytics.find(q).sort({ createdAt: -1 }).limit(1000);
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Export CSV (admin)
router.post('/export', requireAdmin, async (req, res) => {
  try {
    const docs = await UserAnalytics.find({}).lean();
    const fields = ['sessionId','id','userName','startTime','endTime','completed','timeSpent'];
    const { Parser } = require('json2csv');
    const parser = new Parser({ fields });
    const csv = parser.parse(docs);
    res.header('Content-Type', 'text/csv');
    res.attachment('analytics-export.csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
