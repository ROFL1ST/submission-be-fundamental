const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { validate } = require('../middleware/validateMiddleware');
const { verifyToken } = require('../middleware/authMiddleware');
const { companySchema, updateCompanySchema } = require('../validators/companies');

// GET /companies
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM companies ORDER BY created_at DESC');
    return res.json({ status: 'success', message: 'Companies fetched', data: { companies: rows } });
  } catch (err) { next(err); }
});

// GET /companies/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM companies WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ status: 'failed', message: 'Company not found', data: null });
    return res.json({ status: 'success', message: 'Company fetched', data: rows[0] });
  } catch (err) { next(err); }
});

// POST /companies - PROTECTED
router.post('/', verifyToken, validate(companySchema), async (req, res, next) => {
  try {
    const { name, location, description } = req.body;
    const id = uuidv4();
    await pool.query(
      'INSERT INTO companies (id, name, location, description) VALUES ($1, $2, $3, $4)',
      [id, name, location, description || null]
    );
    return res.status(201).json({ status: 'success', message: 'Company created', data: { id } });
  } catch (err) { next(err); }
});

// PUT /companies/:id - PROTECTED
router.put('/:id', verifyToken, validate(updateCompanySchema), async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT id FROM companies WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ status: 'failed', message: 'Company not found', data: null });
    const { name, location, description } = req.body;
    await pool.query(
      `UPDATE companies SET
        name = COALESCE($1, name),
        location = COALESCE($2, location),
        description = COALESCE($3, description),
        updated_at = NOW()
      WHERE id = $4`,
      [name || null, location || null, description || null, req.params.id]
    );
    return res.json({ status: 'success', message: 'Company updated', data: null });
  } catch (err) { next(err); }
});

// DELETE /companies/:id - PROTECTED
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT id FROM companies WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ status: 'failed', message: 'Company not found', data: null });
    await pool.query('DELETE FROM companies WHERE id = $1', [req.params.id]);
    return res.json({ status: 'success', message: 'Company deleted', data: null });
  } catch (err) { next(err); }
});

module.exports = router;
