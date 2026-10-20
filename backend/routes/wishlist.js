const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const { protect } = require("../middleware/authMiddleware");
const { allowFields, objectId, httpError } = require("../utils/validation");
const User = require("../models/User");
const Product = require("../models/Product");
router.use(protect, (req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
router.get("/", asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+wishlist");
  if (!user) throw httpError(401, "Authentication required");
  const items = await Product.find({ _id: { $in: user.wishlist }, status: "active" }).sort({ title: 1 }).lean();
  res.json({ items });
}));
router.put("/:id", asyncHandler(async (req, res) => {
  const id = objectId(req.params.id);
  allowFields(req.body, []);
  if (!await Product.exists({ _id: id, status: "active" })) throw httpError(404, "Product is unavailable");
  const owner = await User.findById(req.user._id).select("+wishlist");
  if (!owner) throw httpError(401, "Authentication required");
  const available = await Product.find({ _id: { $in: owner.wishlist }, status: "active" }).select("_id").lean();
  const availableIds = new Set(available.map(item => String(item._id)));
  const stale = owner.wishlist.filter(value => !availableIds.has(String(value)));
  // Pull only this snapshot's unavailable entries; preserve concurrent additions.
  if (stale.length) await User.updateOne({ _id: req.user._id }, { $pull: { wishlist: { $in: stale } } });
  const result = await User.updateOne({ _id: req.user._id, $or: [{ wishlist: id }, { "wishlist.99": { $exists: false } }] }, { $addToSet: { wishlist: id } });
  if (!result.matchedCount) throw httpError(409, "Your wishlist can contain up to 100 products");
  res.json({ saved: true, productId: id, removedUnavailable: stale.length });
}));
router.delete("/:id", asyncHandler(async (req, res) => {
  const id = objectId(req.params.id);
  allowFields(req.body || {}, []);
  await User.updateOne({ _id: req.user._id }, { $pull: { wishlist: id } });
  res.json({ saved: false, productId: id });
}));
module.exports = router;
