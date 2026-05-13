const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'failed', message: 'Missing or invalid Authorization header', data: null });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ status: 'failed', message: 'Invalid or expired access token', data: null });
  }
}

module.exports = { verifyToken };
