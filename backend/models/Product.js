const mongoose = require("mongoose");

const cents = (value) => Number.isFinite(value) && value >= 0.01 && value <= 1000000 && Math.abs(value * 100 - Math.round(value * 100)) < 0.000001;
const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 180 },
  description: { type: String, required: true, maxlength: 10000 },
  price: { type: Number, required: true, validate: { validator: cents, message: "Price must be positive with at most two decimal places" } },
  category: { type: String, required: true, trim: true, maxlength: 100 },
  flavor: { type: String, trim: true, maxlength: 100, default: "" },
  tags: [{ type: String }],
  // Mixed preserves legacy string entries until the explicit migration runs.
  images: { type: [mongoose.Schema.Types.Mixed], default: [] },
  stock: { type: Number, default: 0, min: 0, max: 1000000, validate: { validator: Number.isInteger, message: "Stock must be an integer" } },
  status: { type: String, enum: ["active", "draft", "archived"], default: "active" },
  featured: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0, min: 0 },
  reviewVersion: { type: Number, default: 0, select: false },
}, { timestamps: true });

productSchema.index({ category: 1, status: 1, createdAt: -1 });
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ status: 1, price: 1 });
module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);
