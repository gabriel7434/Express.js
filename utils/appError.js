class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // operational error

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
// class we use when we need to show an error to a user
// works only in production mode, not in development mode
