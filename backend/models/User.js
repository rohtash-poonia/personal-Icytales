const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isBlocked: { type: Boolean, default: false },
  sessionVersion: { type: Number, default: 0, select: false, min: 0 },
  lastLoginAt: { type: Date },
  wishlist: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], default: [], select: false },
}, { timestamps: true, toJSON: { transform(doc, ret) { delete ret.password; delete ret.sessionVersion; return ret; } } });
userSchema.methods.matchPassword = function (enteredPassword) { return bcrypt.compare(enteredPassword, this.password); };
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  if (typeof this.password !== "string" || this.password.length < 8 || Buffer.byteLength(this.password, "utf8") > 72) {
    throw new Error("Password must contain at least 8 characters and at most 72 UTF-8 bytes");
  }
  this.password = await bcrypt.hash(this.password, 12);
});
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
