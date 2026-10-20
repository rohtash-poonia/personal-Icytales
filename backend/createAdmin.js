const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const User = require("./models/User");
const { validateEnv } = require("./config/env");
const { text, email, password } = require("./utils/validation");
async function createAdmin() {
  validateEnv();
  const data = {
    name: text(process.env.ADMIN_NAME || "Administrator", "Admin name", { max: 100 }),
    email: email(process.env.ADMIN_EMAIL), password: password(process.env.ADMIN_PASSWORD),
  };
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  try {
    const existing = await User.findOne({ email: data.email });
    if (existing) throw new Error("Account already exists; no existing user was changed");
    await User.create({ ...data, role: "admin" });
    console.log("Administrator account created");
  } finally { await mongoose.disconnect(); }
}
if (require.main === module) createAdmin().catch(() => {
  console.error("Admin creation failed. Check environment configuration and use an email that does not already exist.");
  process.exitCode = 1;
});
module.exports = { createAdmin };
