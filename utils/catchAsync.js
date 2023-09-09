module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

// catchAsync module(function) removes the need for try-catch block
