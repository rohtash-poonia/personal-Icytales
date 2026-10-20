const { httpError } = require("../utils/validation");
function notFound(req, res, next) { next(httpError(404, "API endpoint not found")); }
function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  let status = error.statusCode || error.status || (res.statusCode >= 400 ? res.statusCode : 500);
  let message = error.message;
  let code = error.code;
  if (error.name === "ValidationError" || error.name === "CastError" || error.type === "entity.parse.failed") {
    status = 400; message = "Invalid request data";
  }
  if (error.code === 11000) { status = 409; message = "A record with this value already exists"; code = "DUPLICATE_RECORD"; }
  if (error.name === "MulterError") { status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400; message = error.code === "LIMIT_FILE_SIZE" ? "Image must be at most 5 MB" : "Invalid image upload"; }
  if (!Number.isInteger(status) || status < 400 || status > 599) status = 500;
  if (status >= 500) message = status === 503 ? "Service temporarily unavailable" : "An unexpected server error occurred";
  res.status(status).json({ message, ...(typeof code === "string" ? { code } : {}) });
}
module.exports = { notFound, errorHandler };
