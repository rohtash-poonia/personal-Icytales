const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const { httpError } = require("../utils/validation");
async function authenticate(req) {
  const token = req.cookies?.token;
  if (!token) return null;
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"], issuer: "icytales", audience: "icytales-web" });
  } catch { return null; }
  if (!/^[a-f\d]{24}$/i.test(String(decoded.id)) || !Number.isInteger(decoded.sv)) return null;
  const user = await User.findById(decoded.id).select("+sessionVersion");
  if (!user || user.isBlocked || decoded.sv !== (user.sessionVersion || 0)) return null;
  return user;
}
const protect = asyncHandler(async (req, res, next) => {
  req.user = await authenticate(req);
  if (!req.user) throw httpError(401, "Authentication required");
  next();
});
const optionalProtect = asyncHandler(async (req, res, next) => { req.user = await authenticate(req); next(); });
function admin(req, res, next) {
  if (req.user?.role !== "admin") return next(httpError(403, "Admin access required"));
  next();
}
module.exports = { protect, optionalProtect, admin };
