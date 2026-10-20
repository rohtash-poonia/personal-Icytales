const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { candidates, operations, assertDevelopmentTarget } = require('../scripts/seedFigmaProducts');

test('Figma catalog has unique identities, verified prices and existing structured images', () => {
  assert.equal(candidates.length, 18);
  assert.equal(new Set(candidates.map(p => p.slug)).size, 18);
  assert.equal(candidates.find(p => p.title === 'Strawberry Shortcake').price, 5.29);
  for (const p of candidates) {
    assert.ok(fs.existsSync(path.resolve(__dirname, '../../Icylates/public', '.' + p.images[0].url)));
    assert.equal(p.images[0].publicId, '');
    assert.ok(p.images[0].alt);
  }
});
test('seed only inserts and explicitly rejects production or unspecified targets', () => {
  for (const op of operations()) {
    assert.deepEqual(Object.keys(op.updateOne.update), ['$setOnInsert']);
    assert.equal(op.updateOne.filter.slug, op.updateOne.update.$setOnInsert.slug);
  }
  assert.throws(() => assertDevelopmentTarget({NODE_ENV:'production', FIGMA_DEMO_DATABASE:'demo'}));
  assert.throws(() => assertDevelopmentTarget({NODE_ENV:'development'}));
  assert.equal(assertDevelopmentTarget({NODE_ENV:'development', FIGMA_DEMO_DATABASE:'icytales_dev'}), 'icytales_dev');
});
