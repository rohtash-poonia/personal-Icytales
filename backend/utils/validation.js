const mongoose = require("mongoose");

function httpError(statusCode, message, code) {
  return Object.assign(new Error(message), { statusCode, ...(code ? { code } : {}) });
}
function allowFields(value, allowed) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw httpError(400, "A JSON object is required");
  const unexpected = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unexpected.length) throw httpError(400, "Unsupported fields: " + unexpected.join(", "));
  return value;
}
function text(value, label, { min = 1, max = 200 } = {}) {
  if (typeof value !== "string" || value.trim().length < min || value.trim().length > max) {
    throw httpError(400, label + " must contain " + min + "–" + max + " characters");
  }
  return value.trim();
}
function email(value) {
  const normalized = text(value, "Email", { max: 254 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw httpError(400, "A valid email is required");
  return normalized;
}
function password(value) {
  if (typeof value !== "string" || value.length < 8 || Buffer.byteLength(value, "utf8") > 72) {
    throw httpError(400, "Password must contain at least 8 characters and at most 72 UTF-8 bytes");
  }
  return value;
}
function number(value, label, { min = 0, max = 1000000, integer = false } = {}) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) {
    throw httpError(400, label + " is invalid");
  }
  return value;
}
function objectId(value, label = "Identifier") {
  if (typeof value !== "string" || !/^[a-f\d]{24}$/i.test(value) || !mongoose.isValidObjectId(value)) {
    throw httpError(400, label + " is invalid");
  }
  return value;
}
function pagination(query, defaultLimit = 25) {
  function parse(value, fallback, max) {
    if (value === undefined) return fallback;
    if (typeof value !== "string" || !/^[1-9]\d*$/.test(value) || Number(value) > max) {
      throw httpError(400, "Invalid pagination");
    }
    return Number(value);
  }
  const page = parse(query.page, 1, 1000000);
  const limit = parse(query.limit, defaultLimit, 100);
  return { page, limit, skip: (page - 1) * limit };
}
function envelope(items, total, page, limit, extras = {}) {
  return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) }, ...extras };
}
function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function rejectOperators(value) {
  if (Array.isArray(value)) return value.forEach(rejectOperators);
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (key.startsWith("$") || key.includes(".") || ["__proto__", "constructor", "prototype"].includes(key)) {
      throw httpError(400, "Unsupported input key");
    }
    rejectOperators(child);
  }
}
function validateInput(req, res, next) {
  try { rejectOperators(req.body); rejectOperators(req.query); next(); } catch (error) { next(error); }
}
module.exports = { httpError, allowFields, text, email, password, number, objectId, pagination, envelope, escapeRegex, validateInput };
