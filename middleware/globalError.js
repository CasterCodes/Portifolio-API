import AppError from "../utils/appError.js";

const productionError = (error, res) => {
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    console.log("ERROR:", error);

    return res.status(500).json({
      status: "fail",
      message: "Something went wrong",
      error: error,
      name: error.name,
    });
  }
};

const developmentError = (error, res) => {
  return res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    error: error,
    stack: error.stack,
    name: error.name,
  });
};

const handleCastError = (error) =>
  new AppError(`Invalid ${error.path} -> ${error.value}`, 400);
const handleDuplicateValue = (error) =>
  new AppError(
    `Duplicate field value: ${
      error.errmsg.match(/(["'])(\\?.)*?\1/)[0]
    }! Please use another value!`,
    400
  );
const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};
const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

const globalError = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;

  error.status = error.status || "error";

  if (process.env.NODE_ENV === "production") {
    if (error.name === "CastError") error = handleCastError(error);

    if (error.code === 11000) error = handleDuplicateValue(error);

    if (error.name === "ValidationError") error = handleValidationError(error);

    if (error.name === "JsonWebTokenError") error = handleJWTError();

    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    productionError(error, res);
  } else if (process.env.NODE_ENV === "development") {
    developmentError(error, res);
  }
};

export default globalError;
