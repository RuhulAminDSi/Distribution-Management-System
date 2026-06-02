import { ApiError } from '../utils/ApiError.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Handle JSON parsing errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid JSON' 
    });
  }

  // Handle database errors (PostgreSQL codes)
  if (err.code === '23505') {
    const detail = err.detail || '';
    let message = 'Duplicate entry';
    if (detail.includes('email')) message = 'Email already exists';
    else if (detail.includes('phone')) message = 'Phone number already exists';
    else if (detail.includes('username')) message = 'Username already exists';
    return res.status(400).json({ 
      success: false,
      message
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({ 
      success: false,
      message: 'Referenced record not found' 
    });
  }

  // Handle ApiError (operational errors)
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Handle unexpected errors
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const notFound = (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
};
