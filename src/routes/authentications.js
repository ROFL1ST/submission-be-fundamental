const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { validate } = require('../middleware/validateMiddleware');
const { verifyToken } = require('../middleware/authMiddleware');
const { loginSchema, refreshSchema } = require('../validators/authentications');

// POST /authentications - Login
router.post('/', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!rows.length) {
      return res.status(401).json({ status: 'failed', message: 'Invalid email or password', data: null });
    }
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ status: 'failed', message: 'Invalid email or password', data: null });
    }
    const accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '3h' });
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_KEY);
    await pool.query('INSERT INTO authentications (token) VALUES ($1)', [refreshToken]);
    return res.json({ status: 'success', message: 'Login successful', data: { accessToken, refreshToken } });
  } catch (err) {
    next(err);
  }
});

// PUT /authentications - Refresh token
router.put('/', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ status: 'failed', message: 'Refresh token is required', data: null });
    }
    const { rows } = await pool.query('SELECT token FROM authentications WHERE token = $1', [refreshToken]);
    if (!rows.length) {
      return res.status(401).json({ status: 'failed', message: 'Refresh token not found', data: null });
    }
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
    } catch {
      return res.status(401).json({ status: 'failed', message: 'Invalid refresh token', data: null });
    }
    const accessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '3h' });
    return res.json({ status: 'success', message: 'Access token refreshed', data: { accessToken } });
  } catch (err) {
    next(err);
  }
});

// DELETE /authentications - Logout (PROTECTED)
router.delete('/', verifyToken, async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ status: 'failed', message: 'Refresh token is required', data: null });
    }
    await pool.query('DELETE FROM authentications WHERE token = $1', [refreshToken]);
    return res.json({ status: 'success', message: 'Logged out successfully', data: null });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
