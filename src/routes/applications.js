const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { validate } = require('../middleware/validateMiddleware');
const { verifyToken } = require('../middleware/authMiddleware');
const { applicationSchema, updateApplicationSchema } = require('../validators/applications');

// GET /applications/user/:userId -- BEFORE /:id
router.get('/user/:userId', verifyToken, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM applications WHERE userid = $1 ORDER BY created_at DESC', [req.params.userId]);
    return res.json({ status: 'success', message: 'Applications fetched', data: { applications: rows } });
  } catch (err) { next(err); }
});

// GET /applications/job/:jobId -- BEFORE /:id
router.get('/job/:jobId', verifyToken, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM applications WHERE jobid = $1 ORDER BY created_at DESC', [req.params.jobId]);
    return res.json({ status: 'success', message: 'Applications fetched', data: { applications: rows } });
  } catch (err) { next(err); }
});

// POST /applications - PROTECTED
router.post('/', verifyToken, validate(applicationSchema), async (req, res, next) => {
  try {
    const { userid, jobid, status } = req.body;
    const id = uuidv4();
    await pool.query(
      'INSERT INTO applications (id, userid, jobid, status) VALUES ($1, $2, $3, $4)',
      [id, userid, jobid, status || 'pending']
    );
    return res.status(201).json({ status: 'success', message: 'Application created', data: { id } });
  } catch (err) { next(err); }
});

// GET /applications - PROTECTED
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM applications ORDER BY created_at DESC');
    return res.json({ status: 'success', message: 'Applications fetched', data: { applications: rows } });
  } catch (err) { next(err); }
});

// GET /applications/:id - PROTECTED
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM applications WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ status: 'failed', message: 'Application not found', data: null });
    return res.json({ status: 'success', message: 'Application fetched', data: rows[0] });
  } catch (err) { next(err); }
});

// PUT /applications/:id - PROTECTED
router.put('/:id', verifyToken, validate(updateApplicationSchema), async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT id FROM applications WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ status: 'failed', message: 'Application not found', data: null });
    await pool.query('UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2', [req.body.status, req.params.id]);
    return res.json({ status: 'success', message: 'Application updated', data: null });
  } catch (err) { next(err); }
});

// DELETE /applications/:id - PROTECTED
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT id FROM applications WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ status: 'failed', message: 'Application not found', data: null });
    await pool.query('DELETE FROM applications WHERE id = $1', [req.params.id]);
    return res.json({ status: 'success', message: 'Application deleted', data: null });
  } catch (err) { next(err); }
});

module.exports = router;
