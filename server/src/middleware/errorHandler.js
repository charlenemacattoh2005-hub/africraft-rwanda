/**
 * errorHandler.js
 *
 * Global Express error handler.
 *
 * IMPORTANT CORS NOTE:
 * The cors() middleware runs in app.use() BEFORE routes, so the
 * Access-Control-Allow-Origin header is already set on the response
 * object by the time any error reaches this handler.
 *
 * This handler must NOT call res.setHeader() to clear or override
 * the ACAO header. It simply sets the status code and sends JSON.
 *
 * If it did override CORS headers, error responses (401, 500, etc.)
 * would arrive at the browser without ACAO, which the browser reports
 * as a CORS error even though the real problem is auth or server logic.
 */
export function errorHandler(err, req, res, next) {
  // Log the full error server-side for debugging
  console.error('[error]', {
    method:  req.method,
    path:    req.path,
    status:  err.statusCode || err.status || 500,
    message: err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });

  const statusCode = err.statusCode || err.status || 500;

  // Map common error types to helpful messages
  let message = err.message || 'Internal server error';

  if (statusCode === 401) message = err.message || 'Unauthorized';
  if (statusCode === 403) message = err.message || 'Forbidden';
  if (statusCode === 404) message = err.message || 'Not found';
  if (statusCode === 422) message = err.message || 'Unprocessable entity';
  if (statusCode >= 500 && !err.message) message = 'Internal server error';

  // Validation errors from express-validator
  if (err.errors && Array.isArray(err.errors)) {
    return res.status(422).json({
      message: 'Validation failed',
      errors:  err.errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      message: `A record with this ${field} already exists`,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(422).json({ message: errors.join(', ') });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired — please log in again' });
  }

  res.status(statusCode).json({ message });
}
