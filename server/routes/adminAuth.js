const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// For reading cookies
const cookieParser = require('cookie-parser');
router.use(cookieParser());

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'password123';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

// POST /admin/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '2h' });

    res.cookie('admin_token', token, {
      httpOnly: true,     // cannot be accessed via JS
      secure: false,      // set to true when using HTTPS
      sameSite: 'strict', // prevent CSRF
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    return res.json({ success: true });
  }

  return res.status(401).json({ error: 'Invalid credo' });
});

// 🆕 GET /admin/check-auth - NEW ENDPOINT
router.get('/check-auth', (req, res) => {
  const token = req.cookies?.admin_token;

  if (!token) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(401).json({ error: 'unauthorized' });
    }
    return res.json({ success: true, authorized: true });
  } catch {
    return res.status(401).json({ error: 'unauthorized' });
  }
});

// POST /admin/logout
router.post('/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.json({ success: true });
});

module.exports = router;
