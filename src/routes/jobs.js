const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { validate } = require('../middleware/validateMiddleware');
const { verifyToken } = require('../middleware/authMiddleware');
const { jobSchema, updateJobSchema } = require('../validators/jobs');

// GET /jobs - with optional ?title and ?company-name query params
router.get('/', async (req, res, next) => {
  try {
    const { title, 'company-name': companyName } = req.query;
    let query = `
      SELECT j.*, c.name AS companyname
      FROM jobs j
      LEFT JOIN companies c ON j.companyid = c.id
      WHERE 1=1
    `;
    const params = [];
    if (title) {
      params.push(`%${title}%`);
      query += ` AND j.title ILIKE $${params.length}`;
    }
    if (companyName) {
      params.push(`%${companyName}%`);
      query += ` AND c.name ILIKE $${params.length}`;
    }
    query += ' ORDER BY j.created_at DESC';
    const { rows } = await pool.query(query, params);
    return res.json({ status: 'success', message: 'Jobs fetched', data: { jobs: rows } });
  } catch (err) { next(err); }
});

// GET /jobs/company/:companyId  -- must be BEFORE /jobs/:id
router.get('/company/:companyId', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT j.*, c.name AS companyname FROM jobs j LEFT JOIN companies c ON j.companyid = c.id WHERE j.companyid = $1 ORDER BY j.created_at DESC`,
      [req.params.companyId]
    );
    return res.json({ status: 'success', message: 'Jobs fetched', data: { jobs: rows } });
  } catch (err) { next(err); }
});

// GET /jobs/category/:categoryId  -- must be BEFORE /jobs/:id
router.get('/category/:categoryId', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT j.*, c.name AS companyname FROM jobs j LEFT JOIN companies c ON j.companyid = c.id WHERE j.categoryid = $1 ORDER BY j.created_at DESC`,
      [req.params.categoryId]
    );
    return res.json({ status: 'success', message: 'Jobs fetched', data: { jobs: rows } });
  } catch (err) { next(err); }
});

// GET /jobs/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT j.*, c.name AS companyname FROM jobs j LEFT JOIN companies c ON j.companyid = c.id WHERE j.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ status: 'failed', message: 'Job not found', data: null });
    return res.json({ status: 'success', message: 'Job fetched', data: rows[0] });
  } catch (err) { next(err); }
});

// POST /jobs - PROTECTED
router.post('/', verifyToken, validate(jobSchema), async (req, res, next) => {
  try {
    const { companyid, categoryid, title, description, jobtype, experiencelevel, locationtype, locationcity, salarymin, salarymax, issalaryvisible, status } = req.body;
    const id = uuidv4();
    await pool.query(
      `INSERT INTO jobs (id, companyid, categoryid, title, description, jobtype, experiencelevel, locationtype, locationcity, salarymin, salarymax, issalaryvisible, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [id, companyid, categoryid, title, description || null, jobtype || null, experiencelevel || null, locationtype || null, locationcity || null, salarymin || null, salarymax || null, issalaryvisible !== undefined ? issalaryvisible : true, status || 'open']
    );
    return res.status(201).json({ status: 'success', message: 'Job created', data: { id } });
  } catch (err) { next(err); }
});

// PUT /jobs/:id - PROTECTED
router.put('/:id', verifyToken, validate(updateJobSchema), async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT id FROM jobs WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ status: 'failed', message: 'Job not found', data: null });
    const fields = req.body;
    const keys = Object.keys(fields);
    const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = keys.map((k) => fields[k]);
    values.push(req.params.id);
    await pool.query(`UPDATE jobs SET ${setClauses}, updated_at = NOW() WHERE id = $${values.length}`, values);
    return res.json({ status: 'success', message: 'Job updated', data: null });
  } catch (err) { next(err); }
});

// DELETE /jobs/:id - PROTECTED
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT id FROM jobs WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ status: 'failed', message: 'Job not found', data: null });
    await pool.query('DELETE FROM jobs WHERE id = $1', [req.params.id]);
    return res.json({ status: 'success', message: 'Job deleted', data: null });
  } catch (err) { next(err); }
});

// POST /jobs/:jobId/bookmark - PROTECTED
router.post('/:jobId/bookmark', verifyToken, async (req, res, next) => {
  try {
    const { v4: uuidv4bm } = require('uuid');
    const id = uuidv4bm();
    await pool.query(
      'INSERT INTO bookmarks (id, userid, jobid) VALUES ($1, $2, $3)',
      [id, req.user.id, req.params.jobId]
    );
    return res.status(201).json({ status: 'success', message: 'Bookmark created', data: { id } });
  } catch (err) { next(err); }
});

// GET /jobs/:jobId/bookmark/:id - PROTECTED
router.get('/:jobId/bookmark/:id', verifyToken, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM bookmarks WHERE id = $1 AND jobid = $2',
      [req.params.id, req.params.jobId]
    );
    if (!rows.length) return res.status(404).json({ status: 'failed', message: 'Bookmark not found', data: null });
    return res.json({ status: 'success', message: 'Bookmark fetched', data: rows[0] });
  } catch (err) { next(err); }
});

// DELETE /jobs/:jobId/bookmark - PROTECTED (delete by userid + jobid)
router.delete('/:jobId/bookmark', verifyToken, async (req, res, next) => {
  try {
    await pool.query(
      'DELETE FROM bookmarks WHERE userid = $1 AND jobid = $2',
      [req.user.id, req.params.jobId]
    );
    return res.json({ status: 'success', message: 'Bookmark deleted', data: null });
  } catch (err) { next(err); }
});

module.exports = router;
