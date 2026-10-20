const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
}, { timestamps: true });
schema.index({ product: 1, user: 1 }, { unique: true });
schema.index({ product: 1, createdAt: -1, _id: -1 });
module.exports = mongoose.models.Review || mongoose.model("Review", schema);
