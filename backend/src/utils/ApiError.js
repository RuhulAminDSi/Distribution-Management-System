/**
 * Standardized API Error class
 * Provides consistent error responses across all controllers
 * 
 * Usage:
 *   throw new ApiError(400, 'Invalid input');
 *   throw new ApiError(404, 'User not found');
 *   throw new ApiError(500, 'Database error');
 */
export class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // Optional: array of validation errors
    this.isOperational = true; // Mark as operational error (not unexpected crash)
  }
}

/**
 * Error handler middleware for Express
 * Should be placed at the END of all routes/middleware
 * 
 * Usage in server.js:
 *   app.use((err, req, res, next) => {
 *     handleError(err, res);
 *   });
 */
export const handleError = (err, res) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // Handle ApiError (operational errors)
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
      ...(isDevelopment && { stack: err.stack })
    });
  }

  // Handle unexpected errors
  console.error('Unexpected error:', err);
  res.status(500).json({
    success: false,
    message: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
};

/**
 * Wrap async route handlers to catch errors automatically
 * 
 * Usage:
 *   router.get('/user/:id', asyncHandler(async (req, res) => {
 *     const user = await User.findById(req.params.id);
 *     if (!user) throw new ApiError(404, 'User not found');
 *     res.json(user);
 *   }));
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
