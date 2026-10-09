// 404 for unknown routes
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
};

// Global error handler (last safety net). Never leaks stack traces or secrets.
const errorHandler = (err, req, res, next) => {
  // Malformed JSON body -> 400
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: ['Request body contains invalid JSON']
    });
  }
  // Mongoose validation / cast errors -> 400
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors).map((e) => e.message)
    });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ObjectId format' });
  }

  console.error('Unhandled server error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
};

module.exports = { notFound, errorHandler };
