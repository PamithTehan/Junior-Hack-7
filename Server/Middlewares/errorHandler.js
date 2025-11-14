// Error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error('Error Handler:', err);
  console.error('Error name:', err.name);
  console.error('Error code:', err.code);
  console.error('Error message:', err.message);
  if (err.errors) {
    console.error('Error details:', err.errors);
  }
  if (err.stack) {
    console.error('Error stack:', err.stack);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // Default to 500 server error
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || err.message || 'Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err.message,
      errorName: err.name,
      errorCode: err.code,
    }),
  });
};

module.exports = errorHandler;

