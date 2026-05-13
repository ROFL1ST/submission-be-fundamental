const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { validate } = require('../middleware/validateMiddleware');
const { registerSchema } = require('../validators/users');

// POST /users - Register
router.post('/', validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    await pool.query(
      'INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)',
      [id, name, email, hashedPassword, role]
    );
    return res.status(201).json({ status: 'success', message: 'User registered successfully', data: { id } });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ status: 'failed', message: 'Email already registered', data: null });
    }
    next(err);
  }
});

// GET /users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ status: 'failed', message: 'User not found', data: null });
    }
    return res.json({ status: 'success', message: 'User fetched', data: rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
