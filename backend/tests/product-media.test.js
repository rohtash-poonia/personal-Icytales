const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeImageRecord,
  createProductMediaService,
} = require("../services/productMediaService");

test("legacy image strings normalize without changing their URL", () => {
  assert.deepEqual(normalizeImageRecord("/images/classicVanilla.png"), {
    url: "/images/classicVanilla.png",
    publicId: null,
    alt: "",
  });
});

test("structured Cloudinary images retain url publicId and bounded alt text", () => {
  assert.deepEqual(normalizeImageRecord({
    url: "https://res.cloudinary.com/demo/image/upload/sample.webp",
    publicId: "icytales/products/sample",
    alt: "Vanilla cone",
  }), {
    url: "https://res.cloudinary.com/demo/image/upload/sample.webp",
    publicId: "icytales/products/sample",
    alt: "Vanilla cone",
  });
  assert.throws(() => normalizeImageRecord({ url: "http://example.test/a.png" }), /HTTPS/);
});

test("failed batches roll back only assets uploaded by that batch", async () => {
  const destroyed = [];
  let calls = 0;
  const service = createProductMediaService({
    Product: { exists: async () => false },
    uploadImage: async () => {
      calls += 1;
      if (calls === 2) throw new Error("provider failed");
      return { secure_url: "https://cdn.test/new.png", public_id: "icytales/products/new" };
    },
    destroyImage: async (publicId) => destroyed.push(publicId),
  });
  await assert.rejects(service.uploadFiles([{ path: "one" }, { path: "two" }], ["First", "Second"]), /provider failed/);
  assert.deepEqual(destroyed, ["icytales/products/new"]);
});

test("uploads retain alt text for each selected file", async () => {
  const service = createProductMediaService({
    Product: { exists: async () => false },
    uploadImage: async (filePath) => ({ secure_url: `https://cdn.test/${filePath}.png`, public_id: `icytales/products/${filePath}` }),
    destroyImage: async () => {},
  });
  const uploaded = await service.uploadFiles([{ path: "vanilla" }, { path: "mint" }], ["Vanilla cone", "Mint bowl"]);
  assert.deepEqual(uploaded.map((image) => image.alt), ["Vanilla cone", "Mint bowl"]);
});

test("cleanup preserves shared assets and deletes unreferenced assets", async () => {
  const destroyed = [];
  const service = createProductMediaService({
    Product: { exists: async (query) => query.$or.some((condition) => condition["images.publicId"] === "icytales/products/shared") },
    uploadImage: async () => {},
    destroyImage: async (publicId) => destroyed.push(publicId),
  });
  const warnings = await service.cleanupUnreferenced([
    { url: "https://cdn.test/shared.png", publicId: "icytales/products/shared", alt: "" },
    { url: "https://cdn.test/old.png", publicId: "icytales/products/old", alt: "" },
  ], "507f1f77bcf86cd799439011");
  assert.deepEqual(destroyed, ["icytales/products/old"]);
  assert.deepEqual(warnings, []);
});

test("cleanup preserves an asset referenced by a legacy URL string", async () => {
  const destroyed = [];
  const service = createProductMediaService({
    Product: { exists: async (query) => query.$or.some((condition) => condition.images === "https://cdn.test/legacy-shared.png") },
    uploadImage: async () => {},
    destroyImage: async (publicId) => destroyed.push(publicId),
  });
  await service.cleanupUnreferenced([{
    url: "https://cdn.test/legacy-shared.png",
    publicId: "icytales/products/legacy-shared",
    alt: "",
  }]);
  assert.deepEqual(destroyed, []);
});

test("cleanup reports provider failures without deleting database data", async () => {
  const service = createProductMediaService({
    Product: { exists: async () => false },
    uploadImage: async () => {},
    destroyImage: async () => { throw new Error("provider unavailable"); },
  });
  const warnings = await service.cleanupUnreferenced([
    { url: "https://cdn.test/old.png", publicId: "icytales/products/old", alt: "" },
  ]);
  assert.deepEqual(warnings, ["One image could not be removed from storage."]);
});

test("legacy migration is idempotent and preserves image URLs", () => {
  const { migrateProductImages } = require("../scripts/migrateProductImages");
  const first = migrateProductImages(["/images/vanilla.png", {url:"https://cdn.test/mint.png",publicId:"icytales/products/mint",alt:"Mint"}]);
  assert.deepEqual(first, [
    {url:"/images/vanilla.png",publicId:null,alt:""},
    {url:"https://cdn.test/mint.png",publicId:"icytales/products/mint",alt:"Mint"},
  ]);
  assert.deepEqual(migrateProductImages(first), first);
});

test("cleanup preserves assets when reference lookup fails after a product save", async () => {
  const destroyed = [];
  const service = createProductMediaService({
    Product: { exists: async () => { throw new Error('database unavailable'); } },
    uploadImage: async () => {},
    destroyImage: async id => destroyed.push(id),
  });
  const warnings = await service.cleanupUnreferenced([{url:'https://cdn.test/shared.png', publicId:'shared'}]);
  assert.deepEqual(destroyed, []);
  assert.equal(warnings.length, 1);
});

test('cleanup includes the saved product when its retained image loses publicId metadata', async () => {
  const destroyed = [];
  const service = createProductMediaService({
    Product: {exists: async query => !query._id && query.$or.some(condition => condition.images === 'https://cdn.test/retained.png')},
    uploadImage: async () => {}, destroyImage: async id => destroyed.push(id),
  });
  await service.cleanupUnreferenced([{url:'https://cdn.test/retained.png', publicId:'retained'}], 'saved-product');
  assert.deepEqual(destroyed, []);
});
