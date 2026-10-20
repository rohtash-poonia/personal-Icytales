// Source: Figma nRb7bleKQ7vNhdh5GY408Z, frames 1:2, 1:475, 1:805.
// Names, prices, images and the first eight descriptions are verified. Remaining
// descriptions repeat the product name. Categories, flavors,
// active status and stock 25 are demo assumptions; rating 0 avoids fake reviews.
const path = require('node:path');
const fs = require('node:fs');
const candidates = [
  ['Chocolate Brownie Sundae', 5.49, 'Sundaes', 'Chocolate', 'Rich chocolate ice cream with chunks of brownie.', '4831f'],
  ['Strawberry Shortcake', 5.29, 'Sundaes', 'Strawberry', 'Strawberry ice cream layered with shortcake.', '8baa0'],
  ['Mint Chocolate Chip Cone', 3.99, 'Cones', 'Mint', 'Refreshing mint ice cream with chocolate chips.', 'c8aaa'],
  ['Classic Vanilla Ice Cream', 4.99, 'Cones', 'Vanilla', 'Creamy vanilla ice cream topped with cherry.', 'b874d'],
  ['Chocolate Chip Cookie Cone', 4.49, 'Cones', 'Cookie dough', 'Chocolate chip cookie dough ice cream in a cone.', '1cc89'],
  ['Rocky Road Sundae', 5.69, 'Sundaes', 'Rocky road', 'Marshmallow and nutty rocky road ice cream.', '7b9ad'],
  ['Peach Melba Sundae', 5.39, 'Sundaes', 'Peach', 'Peach ice cream topped with raspberry sauce.', '5a3b8'],
  ['Strawberry Sundae', 5.99, 'Sundaes', 'Strawberry', 'Strawberry ice cream with fresh strawberries.', 'efb6e'],
  ['Coconut Milk Chocolate Chip', 5.99, 'Vegan', 'Coconut chocolate chip', 'Coconut Milk Chocolate Chip', 'ae3af'],
  ['Almond Joy Sundae', 6.49, 'Vegan', 'Almond', 'Almond Joy Sundae', 'de89b'],
  ['Berry Sorbet', 4.89, 'Vegan', 'Berry', 'Berry Sorbet', '48389'],
  ['Chocolate Fudge', 5.99, 'Vegan', 'Chocolate', 'Chocolate Fudge', '62343'],
  ['Dairy Free Classic', 6.49, 'Vegan', '', 'Dairy Free Classic', '9b0cc'],
  ['Dairy Free Almond', 4.89, 'Vegan', 'Almond', 'Dairy Free Almond', '158e8'],
  ['Classic Pistachio Gelato', 6.29, 'Gelato', 'Pistachio', 'Classic Pistachio Gelato', 'e7a22'],
  ['Strawberry Balsamic Gelato', 6.49, 'Gelato', 'Strawberry balsamic', 'Strawberry Balsamic Gelato', '407d1'],
  ['Chocolate Hazelnut Gelato', 6.79, 'Gelato', 'Chocolate hazelnut', 'Chocolate Hazelnut Gelato', 'bb0d6'],
  ['Tiramisu Gelato', 6.59, 'Gelato', 'Tiramisu', 'Tiramisu Gelato', '0b3e2'],
].map(([title, price, category, flavor, description, image], index) => ({
  title, price, category, flavor, description,
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  images: [{url: `/images/figma/original/${image}.png`, publicId: '', alt: title}],
  tags: ['figma-demo', `figma-home-${index < 8 ? 1 : index < 14 ? 2 : 3}`], stock: 25, status: 'active',
  featured: index < 4, rating: 0,
}));
function operations() {
  const now = new Date();
  return candidates.map(candidate => ({ updateOne: {
    filter: {slug: candidate.slug}, update: {$setOnInsert: {...candidate, createdAt: now, updatedAt: now}}, upsert: true, timestamps: false,
  }}));
}
function assertDevelopmentTarget(env) {
  if (env.NODE_ENV !== 'development' || !/^[a-zA-Z0-9_-]+$/.test(env.FIGMA_DEMO_DATABASE || '')) {
    throw new Error('Set NODE_ENV=development and FIGMA_DEMO_DATABASE to an explicitly approved development database.');
  }
  if (/prod|live/i.test(env.FIGMA_DEMO_DATABASE)) throw new Error('Production targets are not allowed.');
  return env.FIGMA_DEMO_DATABASE;
}
async function main(args = process.argv.slice(2)) {
  if (args.some(arg => !['--apply', '--dry-run'].includes(arg)) || args.length > 1) throw new Error('Usage: seedFigmaProducts.js [--dry-run | --apply]');
  for (const p of candidates) if (!fs.existsSync(path.resolve(__dirname, '../../Icylates/public', '.' + p.images[0].url))) throw new Error('Missing original image for ' + p.slug);
  if (!args.includes('--apply')) {
    console.log(JSON.stringify({dryRun: true, currency: 'USD', products: candidates}, null, 2));
    return;
  }
  require('dotenv').config({path: path.resolve(__dirname, '../.env'), quiet: true});
  const dbName = assertDevelopmentTarget(process.env);
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required.');
  if (process.env.STORE_CURRENCY && process.env.STORE_CURRENCY !== 'USD') throw new Error('Verified Figma prices require USD.');
  const mongoose = require('mongoose');
  const Product = require('../models/Product');
  require('../config/db').configureMongoDns(process.env.MONGO_URI);
  try {
    await mongoose.connect(process.env.MONGO_URI, {dbName, serverSelectionTimeoutMS: 10000});
    await Product.init();
    for (const candidate of candidates) await new Product(candidate).validate();
    const result = await Product.bulkWrite(operations(), {ordered: true});
    console.log(JSON.stringify({database: dbName, inserted: result.upsertedCount, existingUntouched: candidates.length - result.upsertedCount}));
  } finally { await mongoose.disconnect(); }
}
if (require.main === module) main().catch(() => { console.error('Figma seed failed. Check the development target, currency, assets and database connection. No existing products are updated; rerunning safely resumes partial inserts.'); process.exitCode = 1; });
module.exports = {candidates, operations, assertDevelopmentTarget, main};
