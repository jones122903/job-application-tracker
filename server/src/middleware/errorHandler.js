export function notFound(req, res) {
  res.status(404).json({ message: 'Route not found.' });
}

// Express identifies error middleware by its four parameters.
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body contains invalid JSON.' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large.' });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation failed.',
      errors: Object.values(error.errors).map(item => item.message),
    });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid field value.' });
  }
  // Avoid sending internal errors or database connection details to clients.
  console.error('Request failed:', error.name);
  res.status(500).json({ message: 'An unexpected server error occurred.' });
}
