const mongoose = require("mongoose");

const integer = { validator: Number.isSafeInteger, message: "Value must be an integer" };
const money = { type: Number, required: true, min: 0 };
const cents = { type: Number, required: true, min: 0, validate: integer };
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1, max: 100, validate: integer },
  price: money,
  priceCents: cents,
  image: String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: [orderItemSchema], required: true, validate: { validator: (items) => items.length > 0 && items.length <= 50, message: "Order must have between 1 and 50 items" } },
  shippingAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: String,
  },
  paymentMethod: { type: String, required: true, enum: ["cod", "card", "upi"] },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  orderStatus: { type: String, enum: ["pending", "processing", "completed", "cancelled"], default: "pending" },
  currency: { type: String, required: true, match: /^[A-Z]{3}$/ },
  itemsPrice: money,
  shippingPrice: money,
  totalPrice: money,
  itemsPriceCents: cents,
  shippingPriceCents: cents,
  totalPriceCents: cents,
  idempotencyKey: { type: String, maxlength: 128 },
  requestFingerprint: String,
  stockCommittedAt: Date,
  stockRestoredAt: Date,
  collectedAt: Date,
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  archivedAt: Date,
  archivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

orderSchema.index({ user: 1, idempotencyKey: 1 }, { unique: true, partialFilterExpression: { idempotencyKey: { $type: "string" } } });
orderSchema.index({ user: 1, createdAt: -1, _id: -1 });
orderSchema.index({ createdAt: -1, _id: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ user: 1, "items.product": 1, orderStatus: 1, paymentStatus: 1 });
module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
