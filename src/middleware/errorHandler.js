// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(status).json({ status: 'failed', message, data: null });
}

module.exports = errorHandler;
