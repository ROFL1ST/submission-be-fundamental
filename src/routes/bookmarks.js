const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken } = require('../middleware/authMiddleware');

// GET /bookmarks - all bookmarks for logged-in user
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM bookmarks WHERE userid = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    return res.json({ status: 'success', message: 'Bookmarks fetched', data: { bookmarks: rows } });
  } catch (err) { next(err); }
});

module.exports = router;
