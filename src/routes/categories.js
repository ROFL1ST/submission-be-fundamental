const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { validate } = require('../middleware/validateMiddleware');
const { verifyToken } = require('../middleware/authMiddleware');
const { categorySchema, updateCategorySchema } = require('../validators/categories');

// GET /categories
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY created_at DESC');
    return res.json({ status: 'success', message: 'Categories fetched', data: { categories: rows } });
  } catch (err) { next(err); }
});

// GET /categories/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ status: 'failed', message: 'Category not found', data: null });
    return res.json({ status: 'success', message: 'Category fetched', data: rows[0] });
  } catch (err) { next(err); }
});

// POST /categories - PROTECTED
router.post('/', verifyToken, validate(categorySchema), async (req, res, next) => {
  try {
    const { name } = req.body;
    const id = uuidv4();
    await pool.query('INSERT INTO categories (id, name) VALUES ($1, $2)', [id, name]);
    return res.status(201).json({ status: 'success', message: 'Category created', data: { id } });
  } catch (err) { next(err); }
});

// PUT /categories/:id - PROTECTED
router.put('/:id', verifyToken, validate(updateCategorySchema), async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT id FROM categories WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ status: 'failed', message: 'Category not found', data: null });
    await pool.query('UPDATE categories SET name = $1, updated_at = NOW() WHERE id = $2', [req.body.name, req.params.id]);
    return res.json({ status: 'success', message: 'Category updated', data: null });
  } catch (err) { next(err); }
});

// DELETE /categories/:id - PROTECTED
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT id FROM categories WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ status: 'failed', message: 'Category not found', data: null });
    await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    return res.json({ status: 'success', message: 'Category deleted', data: null });
  } catch (err) { next(err); }
});

module.exports = router;
