const { before, after, beforeEach, test } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const jwt = require("jsonwebtoken");
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "isolated-wishlist-reviews-test-secret-12345";
process.env.CLIENT_ORIGINS = "http://localhost:3000";
const { startDatabase, resetDatabase, stopDatabase } = require("./helpers/mongo");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Review = require("../models/Review");
const { createApp } = require("../app");
let server, owner, other, product;
before(async () => {
  await startDatabase();
  await Review.init();
  server = createApp().listen(0, "127.0.0.1");
});
beforeEach(async () => {
  await resetDatabase();
  [owner, other] = await User.create([{ name: "Owner", email: "owner@test.com", password: "Password-123" }, { name: "Other", email: "other@test.com", password: "Password-123" }]);
  product = await Product.create({ title: "Vanilla", slug: "vanilla", description: "Creamy", price: 5, category: "Classic", stock: 10 });
});
after(async () => { if (server) await new Promise(resolve => server.close(resolve)); await stopDatabase(); });
const cookie = user => "token=" + jwt.sign({ id: String(user._id), sv: 0 }, process.env.JWT_SECRET, { issuer: "icytales", audience: "icytales-web", expiresIn: "1h" });
async function call(user, method, path, body = {}) {
  const auth = user ? cookie(user) : "";
  if (method === "get") return request(server).get(path).set("Cookie", auth);
  const csrf = await request(server).get("/api/auth/csrf").set("Cookie", auth);
  return request(server)[method](path).set("Cookie", [auth, csrf.headers["set-cookie"][0].split(";")[0]].filter(Boolean).join("; ")).set("X-CSRF-Token", csrf.body.csrfToken).send(body);
}
async function purchased(user, status = "completed") {
  // Use the real schema, including monetary snapshots required by checkout.
  return Order.create({ user: user._id, items: [{ product: product._id, name: product.title, quantity: 1, price: 5, priceCents: 500 }], shippingAddress: { fullName: user.name, address: "1 Test St", city: "Test", postalCode: "12345", country: "US" }, paymentMethod: "cod", paymentStatus: "paid", orderStatus: status, currency: "USD", itemsPrice: 5, shippingPrice: 0, totalPrice: 5, itemsPriceCents: 500, shippingPriceCents: 0, totalPriceCents: 500 });
}
test("wishlist requires auth, prevents duplicates and isolates users", async () => {
  const path = `/api/wishlist/${product._id}`;
  assert.equal((await call(null, "get", "/api/wishlist")).status, 401);
  assert.equal((await call(owner, "put", path, { user: other._id })).status, 400);
  for (const response of await Promise.all([call(owner, "put", path), call(owner, "put", path)])) assert.equal(response.status, 200);
  assert.equal((await call(owner, "get", "/api/wishlist")).body.items.length, 1);
  assert.equal((await call(other, "get", "/api/wishlist")).body.items.length, 0);
  await call(other, "delete", path);
  assert.equal((await call(owner, "get", "/api/wishlist")).body.items.length, 1);
  await call(owner, "delete", path);
  assert.equal((await call(owner, "get", "/api/wishlist")).body.items.length, 0);
});
test("wishlist rejects unavailable products and safely omits deleted references", async () => {
  const path = `/api/wishlist/${product._id}`;
  await call(owner, "put", path);
  await Product.deleteOne({ _id: product._id });
  assert.equal((await call(owner, "get", "/api/wishlist")).body.items.length, 0);
  assert.equal((await call(owner, "put", path)).status, 404);
  assert.equal((await call(owner, "delete", path)).status, 200);
  assert.equal((await call(owner, "put", "/api/wishlist/not-an-id")).status, 400);
});
test("reviews enforce completed purchases, valid ratings and ownership", async () => {
  const path = `/api/products/${product._id}/reviews`;
  assert.equal((await call(null, "post", path, { rating: 5, text: "Nice" })).status, 401);
  assert.equal((await call(owner, "post", path, { rating: 5, text: "Nice" })).status, 403);
  const order = await purchased(owner, "processing");
  assert.equal((await call(owner, "post", path, { rating: 5, text: "Nice" })).status, 403);
  order.orderStatus = "completed"; await order.save();
  for (const rating of [0, 6, 2.5, "5"]) assert.equal((await call(owner, "post", path, { rating, text: "Nice" })).status, 400);
  assert.equal((await call(owner, "post", path, { rating: 5, text: "Nice", user: other._id })).status, 400);
  assert.equal((await call(owner, "post", path, { rating: 5, text: "Nice" })).status, 201);
  assert.equal((await call(owner, "post", path, { rating: 4, text: "Again" })).status, 409);
  await purchased(other);
  assert.equal((await call(other, "patch", path + "/me", { rating: 1, text: "Hijack" })).status, 404);
  assert.equal((await call(other, "delete", path + "/me")).status, 404);
  assert.equal((await call(owner, "get", path)).body.mine.rating, 5);
});
test("unavailable wishlist entries do not permanently consume the saved-item limit", async () => {
  const mongoose = require("mongoose");
  const missing = Array.from({ length: 100 }, () => new mongoose.Types.ObjectId());
  await User.updateOne({ _id: owner._id }, { $set: { wishlist: missing } });
  const response = await call(owner, "put", `/api/wishlist/${product._id}`);
  assert.equal(response.status, 200);
  assert.equal(response.body.removedUnavailable, 100);
  const saved = await User.findById(owner._id).select("+wishlist");
  assert.deepEqual(saved.wishlist.map(String), [String(product._id)]);
});
test("review add, concurrent writes, edits and deletes keep product aggregates correct", async () => {
  await purchased(owner); await purchased(other);
  const path = `/api/products/${product._id}/reviews`;
  const responses = await Promise.all([call(owner, "post", path, { rating: 5, text: "Great" }), call(other, "post", path, { rating: 3, text: "Good" })]);
  assert.deepEqual(responses.map(value => value.status), [201, 201]);
  let record = await Product.findById(product._id);
  assert.equal(record.rating, 4); assert.equal(record.reviewCount, 2);
  assert.equal((await call(owner, "patch", path + "/me", { rating: 1, text: "Updated" })).status, 200);
  let summary = (await call(null, "get", path)).body;
  assert.equal(summary.rating, 2); assert.equal(summary.reviewCount, 2); assert.equal(summary.distribution[1], 1);
  assert.equal((await call(other, "delete", path + "/me")).status, 200);
  record = await Product.findById(product._id); assert.equal(record.rating, 1); assert.equal(record.reviewCount, 1);
  await call(owner, "delete", path + "/me");
  record = await Product.findById(product._id); assert.equal(record.rating, 0); assert.equal(record.reviewCount, 0);
});
