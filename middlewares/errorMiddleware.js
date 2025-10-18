const ApiError = require("../utils/ApiError");

const handleJWTInvalidSignature = () =>
  new ApiError("Invalid token, Please login again", 401);

const handleJWTExpired = () => new ApiError("expire token", 401);

const sendErrorForDev = (err, res) =>
  res.status(err.statusCode).json({
    statusCode: err.statusCode,
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });

const sendErrorForProd = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") sendErrorForDev(err, res);
  else {
    if (err.name === "JsonWebTokenError") handleJWTInvalidSignature();
    if (err.name === "TokenExpiredError") handleJWTExpired();
    sendErrorForProd(err, res);
  }
};

module.exports = globalErrorHandler;
