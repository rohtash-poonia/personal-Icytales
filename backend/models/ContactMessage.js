const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, maxlength: 80 },
  lastName: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
  phone: { type: String, trim: true, maxlength: 40 },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  status: { type: String, enum: ["new", "read", "replied"], default: "new" },
}, { timestamps: true });

contactMessageSchema.index({ createdAt: -1, _id: -1 });
contactMessageSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.models.ContactMessage || mongoose.model("ContactMessage", contactMessageSchema);
