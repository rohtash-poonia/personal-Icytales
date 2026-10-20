const path = require("node:path");
const mongoose = require("mongoose");
const { normalizeImageList } = require("../services/productMediaService");

function migrateProductImages(images) {
  return normalizeImageList(Array.isArray(images) ? images : []);
}

async function main() {
  require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
  const apply = process.argv.includes("--apply");
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
  const { configureMongoDns } = require("../config/db");
  configureMongoDns(process.env.MONGO_URI);
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000, autoIndex: false });
  const collection = mongoose.connection.collection("products");
  const cursor = collection.find({}, { projection: { images: 1 } });
  const operations = [];
  let scanned = 0;
  let changed = 0;
  for await (const product of cursor) {
    scanned += 1;
    const images = migrateProductImages(product.images);
    if (JSON.stringify(images) === JSON.stringify(product.images || [])) continue;
    changed += 1;
    operations.push({ updateOne: { filter: { _id: product._id }, update: { $set: { images } } } });
    if (apply && operations.length === 100) {
      await collection.bulkWrite(operations, { ordered: false });
      operations.length = 0;
    }
  }
  if (apply && operations.length) await collection.bulkWrite(operations, { ordered: false });
  console.log(`${apply ? "Migrated" : "Would migrate"} ${changed} of ${scanned} products.`);
  if (!apply) console.log("Dry run only. Re-run with --apply to write changes.");
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Product image migration failed: " + (error?.message || "Unknown error"));
    process.exitCode = 1;
  }).finally(() => mongoose.disconnect());
}

module.exports = { migrateProductImages };
