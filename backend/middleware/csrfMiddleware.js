const crypto = require("node:crypto");
const { cookieOptions } = require("../config/env");
const { httpError } = require("../utils/validation");
const MAX_AGE = 2 * 60 * 60 * 1000;
function signature(value) { return crypto.createHmac("sha256", process.env.JWT_SECRET).update(value).digest("hex"); }
function safeEqual(a, b) {
  return typeof a === "string" && typeof b === "string" && a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
function issueCsrf(req, res) {
  const payload = Date.now().toString(36) + "." + crypto.randomBytes(32).toString("hex");
  const token = payload + "." + signature(payload);
  res.cookie("csrf_token", token, { ...cookieOptions(), maxAge: MAX_AGE });
  res.set("Cache-Control", "no-store").json({ csrfToken: token });
}
function csrfProtection(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const cookie = req.cookies?.csrf_token;
  const header = req.get("X-CSRF-Token");
  const parts = typeof cookie === "string" ? cookie.split(".") : [];
  const issuedAt = parts.length === 3 ? parseInt(parts[0], 36) : NaN;
  if (parts.length !== 3 || !safeEqual(cookie, header) || !Number.isFinite(issuedAt) || issuedAt > Date.now() || Date.now() - issuedAt > MAX_AGE ||
      !safeEqual(signature(parts[0] + "." + parts[1]), parts[2])) {
    return next(httpError(403, "Refresh the security token and try again", "CSRF_INVALID"));
  }
  next();
}
module.exports = { issueCsrf, csrfProtection };
