export function notFoundApi(_req, res) {
  res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  if (status >= 500) console.error('[bingo-api]', err.message);
  res.status(status).json({
    error: status === 500 ? 'Something went wrong on the server' : err.message,
    code: err.code || 'SERVER_ERROR',
  });
}
