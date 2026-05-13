const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken } = require('../middleware/authMiddleware');

// GET /profile - PROTECTED
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ status: 'failed', message: 'User not found', data: null });
    return res.json({ status: 'success', message: 'Profile fetched', data: rows[0] });
  } catch (err) { next(err); }
});

// GET /profile/applications - PROTECTED
router.get('/applications', verifyToken, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM applications WHERE userid = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    return res.json({ status: 'success', message: 'Applications fetched', data: { applications: rows } });
  } catch (err) { next(err); }
});

// GET /profile/bookmarks - PROTECTED
router.get('/bookmarks', verifyToken, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM bookmarks WHERE userid = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    return res.json({ status: 'success', message: 'Bookmarks fetched', data: { bookmarks: rows } });
  } catch (err) { next(err); }
});

module.exports = router;
