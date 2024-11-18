const customError = require("../utils/customError");

const devErrors = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stackTrace: err.stack,
    error: err,
  });
};

const prodErrors = (res, err) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong, please try again later!",
    });
  }
};

const castErrorHandler = (err) => {
  const msg = `Invalid value for ${err.path} : ${err.value}!`;
  return new customError(msg, 400);
};

const duplicateErrorHandler = (err) => {
  const msg = `There is already a movie with name ${err.keyValue.name}.Please use another name!`;
  return new customError(msg, 400);
};
const validationErrorHandler = (err) => {
  const errors = Object.values(err.errors).map((val) => val.message);
  const errorMessages = errors.join(". ");
  const msg = `Invalid input data: ${errorMessages}`;
  return new customError(msg, 400);
};
const tokenExpiredErrorHandler = (err) => {
  const msg = `JWT has expired. Please log in again!`;
  return new customError(msg, 401);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    devErrors(res, err);
  } else if (process.env.NODE_ENV === "production") {
    if (err.name === "CastError") {
      err = castErrorHandler(err);
    }
    if (err.code === 11000) {
      err = duplicateErrorHandler(err);
    }
    if (err.name === "ValidationError") {
      err = validationErrorHandler(err);
    }
    if (err.name === "TokenExpiredError") {
      err = tokenExpiredErrorHandler(err);
    }

    prodErrors(res, err);
  }
};
