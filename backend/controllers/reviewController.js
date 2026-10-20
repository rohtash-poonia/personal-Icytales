const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const Review = require("../models/Review");
const Order = require("../models/Order");
const { allowFields, objectId, number, text, pagination, envelope, httpError } = require("../utils/validation");

const purchase = (user, product) => ({ user, "items.product": product, orderStatus: "completed", paymentStatus: "paid" });
async function activeProduct(id) {
  objectId(id);
  if (!await Product.exists({ _id: id, status: "active" })) throw httpError(404, "Product is unavailable");
}
exports.listReviews = asyncHandler(async (req, res) => {
  await activeProduct(req.params.id);
  const product = new mongoose.Types.ObjectId(req.params.id);
  const { page, limit, skip } = pagination(req.query, 10);
  const [items, counts, mine, eligible] = await Promise.all([
    Review.find({ product }).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).populate("user", "name").lean(),
    Review.aggregate([{ $match: { product } }, { $group: { _id: "$rating", count: { $sum: 1 } } }]),
    req.user ? Review.findOne({ product, user: req.user._id }).lean() : null,
    req.user ? Order.exists(purchase(req.user._id, product)) : null,
  ]);
  const distribution = Object.fromEntries([1, 2, 3, 4, 5].map(value => [value, 0]));
  for (const row of counts) distribution[row._id] = row.count;
  const count = counts.reduce((sum, row) => sum + row.count, 0);
  const rating = count ? counts.reduce((sum, row) => sum + row._id * row.count, 0) / count : 0;
  res.set("Cache-Control", "no-store").json(envelope(items.map(item => ({ _id: item._id, name: item.user?.name || "Customer", rating: item.rating, text: item.text, createdAt: item.createdAt })), count, page, limit, { rating, reviewCount: count, distribution, mine: mine ? { _id: mine._id, rating: mine.rating, text: mine.text } : null, eligible: Boolean(eligible) }));
});

exports.writeReview = action => asyncHandler(async (req, res) => {
  const id = objectId(req.params.id);
  allowFields(req.body || {}, action === "delete" ? [] : ["rating", "text"]);
  const data = action === "delete" ? null : { rating: number(req.body.rating, "Rating", { min: 1, max: 5, integer: true }), text: text(req.body.text, "Review", { max: 2000 }) };
  let summary;
  await mongoose.connection.transaction(async session => {
    // All review writers lock the same product before aggregating, preventing stale totals.
    const product = await Product.findOneAndUpdate({ _id: id, ...(action === "delete" ? {} : { status: "active" }) }, { $inc: { reviewVersion: 1 } }, { session, new: true });
    if (!product) throw httpError(404, "Product is unavailable");
    const filter = { product: product._id, user: req.user._id };
    if (action !== "delete" && !await Order.exists(purchase(req.user._id, product._id)).session(session)) throw httpError(403, "A completed, paid order is required to review this product");
    if (action === "create") {
      if (await Review.exists(filter).session(session)) throw httpError(409, "You have already reviewed this product");
      await Review.create([{ ...filter, ...data }], { session });
    } else if (action === "update") {
      if (!await Review.findOneAndUpdate(filter, data, { session, runValidators: true })) throw httpError(404, "Your review was not found");
    } else if (!(await Review.deleteOne(filter, { session })).deletedCount) throw httpError(404, "Your review was not found");
    const [totals] = await Review.aggregate([{ $match: { product: product._id } }, { $group: { _id: null, rating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } }]).session(session);
    summary = { rating: totals?.rating || 0, reviewCount: totals?.reviewCount || 0 };
    await Product.updateOne({ _id: id }, { $set: summary }, { session });
  });
  res.status(action === "create" ? 201 : 200).json(summary);
});
