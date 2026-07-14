const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler Log]:', err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const key = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: '${err.keyValue[key]}'. Please use another value!`;
    err.statusCode = 400;
    err.status = 'fail';
    err.message = message;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    err.statusCode = 400;
    err.status = 'fail';
    err.message = message;
  }

  // Handle Mongoose cast errors (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}.`;
    err.statusCode = 400;
    err.status = 'fail';
    err.message = message;
  }

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    // Production output: send operational errors, hide programming details
    res.status(err.statusCode).json({
      status: err.status,
      message: err.isOperational ? err.message : 'Something went wrong!',
    });
  }
};

module.exports = errorHandler;
