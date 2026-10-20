const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const {
  allowFields,
  text,
  objectId,
  pagination,
  envelope,
  escapeRegex,
  httpError,
} = require("../utils/validation");
const getUsers = asyncHandler(async (req, res) => {
  allowFields(req.query, ["page", "limit", "search", "isBlocked"]);
  const { page, limit, skip } = pagination(req.query);
  const filter = {};
  if (req.query.search !== undefined) {
    const pattern = new RegExp(
      escapeRegex(text(req.query.search, "search", { max: 100 })),
      "i",
    );
    filter.$or = [{ name: pattern }, { email: pattern }];
  }
  if (req.query.isBlocked !== undefined) {
    if (!["true", "false"].includes(req.query.isBlocked))
      throw httpError(400, "isBlocked must be true or false");
    filter.isBlocked = req.query.isBlocked === "true";
  }
  const [items, total] = await Promise.all([
    User.find(filter)
      .select("name email role isBlocked createdAt lastLoginAt")
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);
  res.json(envelope(items, total, page, limit));
});
const deleteUser = asyncHandler(async (req, res) => {
  objectId(req.params.id, "User identifier");
  const user = await User.findById(req.params.id).select("role");
  if (!user) throw httpError(404, "User not found");
  if (user.role === "admin" || String(req.user._id) === user.id)
    throw httpError(403, "Administrator accounts cannot be deleted");
  await User.deleteOne({ _id: user._id, role: { $ne: "admin" } });
  res.json({ message: "User deleted" });
});
const blockUser = asyncHandler(async (req, res) => {
  objectId(req.params.id, "User identifier");
  allowFields(req.body, ["isBlocked"]);
  if (typeof req.body.isBlocked !== "boolean")
    throw httpError(400, "isBlocked must be a boolean");
  const user = await User.findById(req.params.id).select("role");
  if (!user) throw httpError(404, "User not found");
  if (user.role === "admin" || String(req.user._id) === user.id)
    throw httpError(403, "Administrator accounts cannot be blocked");
  const updated = await User.findOneAndUpdate(
    { _id: user._id, role: { $ne: "admin" } },
    { $set: { isBlocked: req.body.isBlocked }, $inc: { sessionVersion: 1 } },
    { new: true },
  ).select("name email role isBlocked");
  if (!updated) throw httpError(409, "User changed; refresh and try again");
  res.json({
    message: req.body.isBlocked ? "User blocked" : "User unblocked",
    user: updated,
  });
});
module.exports = { getUsers, deleteUser, blockUser };
