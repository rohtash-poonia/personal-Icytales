const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    amount: { type: Number, required: true, min: 0 },
    amountCents: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isSafeInteger,
    },
    currency: { type: String, required: true, match: /^[A-Z]{3}$/ },
    method: { type: String, required: true, enum: ["cod", "card", "upi"] },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    transactionId: String,
    paidAt: Date,
    providerVerifiedAt: Date,
    collectedAt: Date,
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rawResponse: { type: Object, select: false },
  },
  { timestamps: true },
);
paymentSchema.index({ status: 1, createdAt: -1 });
module.exports =
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
