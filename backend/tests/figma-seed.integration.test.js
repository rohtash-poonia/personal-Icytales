const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const {startDatabase, stopDatabase} = require('./helpers/mongo');
const Product = require('../models/Product');
const {candidates, operations} = require('../scripts/seedFigmaProducts');
before(startDatabase);
after(stopDatabase);
test('repeated demo seed leaves existing product data and timestamps untouched', async () => {
  await Product.init();
  const existing = await Product.create({...candidates[0], title:'Existing merchant product', price:19.99, stock:7});
  const before = await Product.findById(existing._id).lean();
  await Product.bulkWrite(operations());
  const again = await Product.bulkWrite(operations());
  assert.equal(again.upsertedCount, 0);
  assert.equal(await Product.countDocuments(), candidates.length);
  assert.deepEqual(await Product.findById(existing._id).lean(), before);
});
