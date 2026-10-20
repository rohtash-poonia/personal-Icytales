// Optional import of the 13 original demo catalog entries. No .env is loaded.
// Default/--dry-run never connects to MongoDB. --apply inserts missing slugs only.
const fs = require("node:fs");
const path = require("node:path");
const candidates = [
  [1, "Chocolate Brownie Sundae", 5.49, "Sundaes", "Rich chocolate ice cream with chunks of brownie.", "chocolateBrownie.png"],
  [2, "Strawberry Shortcake", 5.49, "Sundaes", "Strawberry ice cream layered with shortcake.", "strawberry.png"],
  [3, "Mint Chocolate Chip Cone", 5.49, "Ice Cream Cakes", "Refreshing mint ice cream with chocolate chips.", "mint.png"],
  [4, "Classic Vanilla Ice Cream", 5.49, "Ice Cream Cakes", "Creamy vanilla ice cream topped with cherry.", "vanilla.png"],
  [5, "Mint Chocolate Chip Cone", 6.49, "Popsicles", "Refreshing mint ice cream with chocolate chips.", "mint.png"],
  [6, "Mint Chocolate Chip Cone", 4.49, "Popsicles", "Refreshing mint ice cream with chocolate chips.", "mint.png"],
  [7, "Strawberry Shortcake", 5.49, "Milkshakes", "Strawberry ice cream layered with shortcake.", "strawberry.png"],
  [8, "Strawberry Shortcake", 5.49, "Milkshakes", "Strawberry ice cream layered with shortcake.", "strawberry.png"],
  [9, "Strawberry Sundae", 5.99, "Sundaes", "Strawberry ice cream with fresh strawberries.", "strawberrySudane.png"],
  [10, "Chocolate Chip Cookie Cone", 4.49, "Cones", "Chocolate chip cookie dough ice cream in a cone.", "chocolateCone.png"],
  [11, "Rocky Road Sundae", 5.69, "Sundaes", "Marshmallow and nutty rocky road ice cream.", "rockyRoadSundae.png"],
  [12, "Peach Melba Sundae", 5.39, "Sundaes", "Peach ice cream topped with raspberry sauce.", "peachMelbaSundae.png"],
  [13, "Chocolate Chip Cookie Cone", 4.49, "Cones", "Chocolate chip cookie dough ice cream in a cone.", "chocolateCone.png"],
].map(([id, title, price, category, description, image]) => ({
  title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + id,
  price, category, description,
  images: fs.existsSync(path.resolve(__dirname, "../../Icylates/public/images", image)) ? ["/images/" + image] : [],
  tags: ["legacy-demo-" + id], status: "draft", stock: 0, rating: 0, featured: false,
}));

async function main(args = process.argv.slice(2)) {
  if (args.some((arg) => !["--dry-run", "--apply"].includes(arg)) || (args.includes("--dry-run") && args.includes("--apply"))) throw new Error("Usage: node scripts/seedProducts.js [--dry-run | --apply]");
  if (!args.includes("--apply")) {
    console.log(JSON.stringify({ dryRun: true, connectsToDatabase: false, currency: "USD", count: candidates.length, note: "Only --apply inserts missing draft products with stock 0. Existing products are never overwritten. Review prices, categories, images and real inventory before activating.", products: candidates }, null, 2));
    return;
  }
  if (!process.env.MONGO_URI) throw new Error("Set MONGO_URI explicitly before --apply; this script does not read .env");
  if (process.env.STORE_CURRENCY && process.env.STORE_CURRENCY !== "USD") throw new Error("Original demo prices are USD; review them before importing into a different currency");
  const mongoose = require("mongoose");
  const Product = require("../models/Product");
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    await Product.init();
    for (const candidate of candidates) await new Product(candidate).validate();
    const result = await Product.bulkWrite(candidates.map((candidate) => ({ updateOne: { filter: { slug: candidate.slug }, update: { $setOnInsert: candidate }, upsert: true } })), { ordered: false });
    console.log(JSON.stringify({ inserted: result.upsertedCount, existingUntouched: candidates.length - result.upsertedCount }));
  } finally { await mongoose.disconnect(); }
}
if (require.main === module) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
module.exports = { candidates, main };
