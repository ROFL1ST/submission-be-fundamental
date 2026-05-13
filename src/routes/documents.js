const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const pool = require('../config/database');
const { verifyToken } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// GET /documents - PUBLIC
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM documents ORDER BY created_at DESC');
    return res.json({ status: 'success', message: 'Documents fetched', data: { documents: rows } });
  } catch (err) { next(err); }
});

// GET /documents/:id - PUBLIC
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM documents WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ status: 'failed', message: 'Document not found', data: null });
    return res.json({ status: 'success', message: 'Document fetched', data: rows[0] });
  } catch (err) { next(err); }
});

// POST /documents - PROTECTED, multipart/form-data field: 'document'
router.post('/', verifyToken, upload.single('document'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ status: 'failed', message: 'No file uploaded', data: null });
    const id = uuidv4();
    await pool.query(
      'INSERT INTO documents (id, userid, filename, originalname, mimetype, size) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, req.user.id, req.file.filename, req.file.originalname, req.file.mimetype, req.file.size]
    );
    return res.status(201).json({ status: 'success', message: 'Document uploaded', data: { id } });
  } catch (err) { next(err); }
});

// DELETE /documents/:id - PROTECTED
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT id FROM documents WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ status: 'failed', message: 'Document not found', data: null });
    await pool.query('DELETE FROM documents WHERE id = $1', [req.params.id]);
    return res.json({ status: 'success', message: 'Document deleted', data: null });
  } catch (err) { next(err); }
});

module.exports = router;
