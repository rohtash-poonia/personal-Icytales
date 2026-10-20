process.env.NODE_ENV = "test";
process.env.ORDER_SHIPPING_PRICE = "20";

const assert = require("node:assert/strict");
const { before, after, beforeEach, test } = require("node:test");
const express = require("express");
const request = require("supertest");
const mongoose = require("mongoose");
const { startDatabase, stopDatabase, resetDatabase } = require("./helpers/mongo");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const controller = require("../controllers/orderController");
const { normalizeOrderInput, moneyToCents } = require("../services/orderService");

const owner = new mongoose.Types.ObjectId();
const stranger = new mongoose.Types.ObjectId();
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.user = { _id: new mongoose.Types.ObjectId(req.get("X-Test-User") || owner.toString()), role: req.get("X-Test-Role") || "user" };
  next();
});
app.post("/orders", controller.createOrder);
app.post("/orders/quote", controller.quoteOrder);
app.post("/orders/:id/collect-cash", controller.collectCash);
app.get("/orders", controller.getOrders);
app.get("/orders/user/:userId", controller.getOrdersByUser);
app.get("/orders/:id", controller.getOrderById);
app.put("/orders/:id/status", controller.updateOrderStatus);
app.delete("/orders/:id", controller.deleteOrder);
app.get("/stats", controller.getStats);
app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({ message: error.message });
});

const address = { fullName: "Test Buyer", address: "123 Test Road", city: "Pune", postalCode: "411001", country: "India" };
const body = (product, overrides = {}) => ({ items: [{ product: product._id.toString(), quantity: 2, price: 0.01 }], shippingAddress: address, paymentMethod: "cod", itemsPrice: -999, shippingPrice: -5, totalPrice: -1000, ...overrides });
const create = (payload, key = "order-test-key-0001") => request(app).post("/orders").set("Idempotency-Key", key).send(payload);
const product = (fields = {}) => Product.create({ title: "Vanilla", slug: "vanilla", description: "Test product", price: 12.35, stock: 10, category: "ice-cream", ...fields });

before(async () => {
  await startDatabase();
  await Promise.all([Product.init(), Order.init(), Payment.init()]);
});
beforeEach(async () => { await resetDatabase(); });
after(async () => { await stopDatabase(); });

test("order validation rejects invalid quantities, unknown products, missing shipping and unavailable payment", () => {
  const id = new mongoose.Types.ObjectId().toString();
  const valid = { items: [{ product: id, quantity: 1 }], shippingAddress: address, paymentMethod: "cod" };
  assert.equal(moneyToCents(12.35), 1235);
  assert.throws(() => moneyToCents(0.001), /decimal|price/i);
  for (const quantity of [0, -1, 1.5, 101, "2", NaN]) {
    assert.throws(() => normalizeOrderInput({ ...valid, items: [{ product: id, quantity }] }, "valid-key-123"), /quantity/i);
  }
  assert.throws(() => normalizeOrderInput({ ...valid, items: [{ product: "static-1", quantity: 1 }] }, "valid-key-123"), /product/i);
  assert.throws(() => normalizeOrderInput({ ...valid, shippingAddress: { fullName: "Only Name" } }, "valid-key-123"), /shipping/i);
  assert.throws(() => normalizeOrderInput({ ...valid, paymentMethod: "card" }, "valid-key-123"), /available|supported/i);
  assert.throws(() => normalizeOrderInput(valid, ""), /Idempotency-Key/i);
});

test("checkout ignores forged prices and totals, reserves inventory and creates matching pending payment", async () => {
  const p = await product({ images: [{ url: "https://cdn.test/vanilla.png", publicId: "icytales/products/vanilla", alt: "Vanilla" }] });
  const result = await create(body(p));
  assert.equal(result.status, 201, JSON.stringify(result.body));
  assert.equal(result.body.itemsPrice, 24.7);
  assert.equal(result.body.shippingPrice, 20);
  assert.equal(result.body.totalPrice, 44.7);
  assert.equal(result.body.totalPriceCents, 4470);
  assert.equal(result.body.paymentStatus, "pending");
  assert.equal(result.body.items[0].image, "https://cdn.test/vanilla.png");
  assert.equal((await Product.findById(p._id)).stock, 8);
  const payment = await Payment.findOne({ order: result.body._id });
  assert.equal(payment.status, "pending");
  assert.equal(payment.amountCents, 4470);
});

test("idempotency replays one order and one decrement; changed payload conflicts", async () => {
  const p = await product();
  const [a, b] = await Promise.all([create(body(p)), create(body(p))]);
  assert.deepEqual([a.status, b.status].sort(), [200, 201]);
  assert.equal(a.body._id, b.body._id);
  assert.equal(await Order.countDocuments(), 1);
  assert.equal(await Payment.countDocuments(), 1);
  assert.equal((await Product.findById(p._id)).stock, 8);
  const changed = body(p, { items: [{ product: p._id.toString(), quantity: 3 }] });
  assert.equal((await create(changed)).status, 409);
});

test("competing checkouts cannot oversell", async () => {
  const p = await product({ stock: 1 });
  const payload = body(p, { items: [{ product: p._id.toString(), quantity: 1 }] });
  const results = await Promise.all([create(payload, "compete-key-0001"), create(payload, "compete-key-0002")]);
  assert.deepEqual(results.map(r => r.status).sort(), [201, 409]);
  assert.equal((await Product.findById(p._id)).stock, 0);
  assert.equal(await Order.countDocuments(), 1);
  assert.equal(await Payment.countDocuments(), 1);
});

test("an unavailable line rolls back every stock decrement and accounting write", async () => {
  const p = await product();
  const empty = await product({ slug: "sold-out", stock: 0 });
  const payload = body(p, { items: [{ product: p._id.toString(), quantity: 1 }, { product: empty._id.toString(), quantity: 1 }] });
  const result = await create(payload);
  assert.equal(result.status, 409);
  assert.equal((await Product.findById(p._id)).stock, 10);
  assert.equal(await Order.countDocuments(), 0);
  assert.equal(await Payment.countDocuments(), 0);
});

test("draft products and unsupported online payment cannot create orders", async () => {
  const p = await product({ status: "draft" });
  assert.equal((await create(body(p))).status, 409);
  assert.equal((await create(body(p, { paymentMethod: "upi" }))).status, 422);
  assert.equal(await Payment.countDocuments(), 0);
});

test("controller enforces ownership independently of route middleware", async () => {
  const p = await product();
  const created = await create(body(p));
  const id = created.body._id;
  assert.equal((await request(app).get("/orders/" + id).set("X-Test-User", stranger.toString())).status, 403);
  assert.equal((await request(app).get("/orders/user/" + owner).set("X-Test-User", stranger.toString())).status, 403);
  assert.equal((await request(app).put("/orders/" + id + "/status").send({ orderStatus: "cancelled" })).status, 403);
  assert.equal((await request(app).delete("/orders/" + id)).status, 403);
});

test("cancellation restores stock exactly once and keeps payment and order state aligned", async () => {
  const p = await product();
  const created = await create(body(p));
  const url = "/orders/" + created.body._id + "/status";
  for (let i = 0; i < 2; i += 1) {
    const result = await request(app).put(url).set("X-Test-Role", "admin").send({ orderStatus: "cancelled" });
    assert.equal(result.status, 200, JSON.stringify(result.body));
    assert.equal(result.body.paymentStatus, "failed");
  }
  assert.equal((await Product.findById(p._id)).stock, 10);
  assert.equal((await Payment.findOne({ order: created.body._id })).status, "failed");
  assert.equal((await request(app).put(url).set("X-Test-Role", "admin").send({ orderStatus: "processing" })).status, 409);
  assert.equal((await request(app).put(url).set("X-Test-Role", "admin").send({ paymentStatus: "paid" })).status, 422);
});

test("paid/completed orders are retained; cancelled unpaid orders can only be archived", async () => {
  const p = await product();
  const created = await create(body(p));
  const url = "/orders/" + created.body._id;
  assert.equal((await request(app).delete(url).set("X-Test-Role", "admin")).status, 409);
  await request(app).put(url + "/status").set("X-Test-Role", "admin").send({ orderStatus: "cancelled" });
  assert.equal((await request(app).delete(url).set("X-Test-Role", "admin")).status, 200);
  const archived = await Order.findById(created.body._id);
  assert.ok(archived.archivedAt);
  assert.equal(await Payment.countDocuments(), 1);
});

test("order lists use bounded pagination and stats do not call unverified payments collected revenue", async () => {
  const p = await product();
  const created = await create(body(p));
  const list = await request(app).get("/orders?page=1&limit=500");
  assert.equal(list.status, 200);
  assert.equal(list.body.pagination.limit, 100);
  assert.equal(list.body.pagination.total, 1);
  assert.equal(list.body.items.length, 1);
  const other = await request(app).get("/orders").set("X-Test-User", stranger.toString());
  assert.equal(other.body.pagination.total, 0);
  await Order.updateOne({ _id: created.body._id }, { $set: { paymentStatus: "paid" } });
  await Payment.updateOne({ order: created.body._id }, { $set: { status: "completed" } });
  const stats = await request(app).get("/stats").set("X-Test-Role", "admin");
  assert.equal(stats.status, 200);
  assert.equal(stats.body.revenue.collected, 0);
  assert.equal(stats.body.monthly.length, 12);
});



test("quotes use current server prices and shipping without reserving stock", async () => {
  const p = await product();
  const result = await request(app).post("/orders/quote").send({ items: [{ product: p._id.toString(), quantity: 2, price: 0 }] });
  assert.equal(result.status, 200, JSON.stringify(result.body));
  assert.equal(result.body.totalPriceCents, 4470);
  assert.equal(result.body.currency, "USD");
  assert.equal((await Product.findById(p._id)).stock, 10);
  assert.equal(await Order.countDocuments(), 0);
});

test("COD cash collection requires an explicit admin confirmation and keeps accounting consistent", async () => {
  const p = await product();
  const created = await create(body(p));
  const url = "/orders/" + created.body._id;
  assert.equal((await request(app).post(url + "/collect-cash").send({ confirmed: true })).status, 403);
  assert.equal((await request(app).post(url + "/collect-cash").set("X-Test-Role", "admin").send({ confirmed: true })).status, 409);
  await request(app).put(url + "/status").set("X-Test-Role", "admin").send({ orderStatus: "processing" });
  assert.equal((await request(app).post(url + "/collect-cash").set("X-Test-Role", "admin").send({})).status, 400);
  for (let i = 0; i < 2; i += 1) {
    const result = await request(app).post(url + "/collect-cash").set("X-Test-Role", "admin").send({ confirmed: true });
    assert.equal(result.status, 200, JSON.stringify(result.body));
    assert.equal(result.body.paymentStatus, "paid");
    assert.ok(result.body.collectedAt);
    assert.equal(result.body.collectedBy, owner.toString());
  }
  const payment = await Payment.findOne({ order: created.body._id });
  assert.equal(payment.status, "completed");
  assert.ok(payment.collectedAt);
  assert.equal(payment.collectedBy.toString(), owner.toString());
  assert.equal((await request(app).put(url + "/status").set("X-Test-Role", "admin").send({ orderStatus: "cancelled" })).status, 409);
  const stats = await request(app).get("/stats").set("X-Test-Role", "admin");
  assert.equal(stats.body.revenue.collected, 44.7);
  assert.equal(stats.body.revenue.pending, 0);
});

test("legacy string product references remain readable without being rewritten or inventing a stock restoration", async () => {
  const id = new mongoose.Types.ObjectId();
  await Order.collection.insertOne({ _id: id, user: owner, items: [{ product: "static-product-1", name: "Legacy", quantity: 1, price: 5 }], shippingAddress: address, paymentMethod: "cod", paymentStatus: "pending", orderStatus: "pending", itemsPrice: 5, shippingPrice: 20, totalPrice: 25, createdAt: new Date(), updatedAt: new Date() });
  const read = await request(app).get("/orders/" + id);
  assert.equal(read.status, 200);
  assert.equal(read.body.items[0].product, "static-product-1");
  const cancelled = await request(app).put("/orders/" + id + "/status").set("X-Test-Role", "admin").send({ orderStatus: "cancelled" });
  assert.equal(cancelled.status, 200);
  assert.equal(cancelled.body.items[0].product, "static-product-1");
  assert.equal(cancelled.body.stockRestoredAt, undefined);
  assert.equal(await Product.countDocuments(), 0);
});


test("payment creation failure rolls back the inserted order and every reserved stock unit", async () => {
  const p = await product();
  const originalCreate = Payment.create;
  Payment.create = async () => { throw new Error("Simulated accounting write failure"); };
  try {
    const result = await create(body(p));
    assert.equal(result.status, 500);
    assert.equal((await Product.findById(p._id)).stock, 10);
    assert.equal(await Order.countDocuments(), 0);
    assert.equal(await Payment.countDocuments(), 0);
  } finally { Payment.create = originalCreate; }
});

test("concurrent cancellation retries restore inventory only once", async () => {
  const p = await product();
  const created = await create(body(p));
  const url = "/orders/" + created.body._id + "/status";
  const results = await Promise.all(Array.from({ length: 3 }, () => request(app).put(url).set("X-Test-Role", "admin").send({ orderStatus: "cancelled" })));
  assert.deepEqual(results.map((result) => result.status), [200, 200, 200]);
  assert.equal((await Product.findById(p._id)).stock, 10);
  assert.ok((await Order.findById(created.body._id)).stockRestoredAt);
});

test("idempotency keys are scoped to the authenticated account", async () => {
  const p = await product();
  const first = await create(body(p));
  const second = await request(app).post("/orders").set("X-Test-User", stranger.toString()).set("Idempotency-Key", "order-test-key-0001").send(body(p));
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  assert.notEqual(first.body._id, second.body._id);
  assert.equal((await Product.findById(p._id)).stock, 6);
});

test("completing COD alone leaves payment pending until explicitly collected", async () => {
  const p = await product();
  const created = await create(body(p));
  const url = "/orders/" + created.body._id;
  await request(app).put(url + "/status").set("X-Test-Role", "admin").send({ orderStatus: "processing" });
  const completed = await request(app).put(url + "/status").set("X-Test-Role", "admin").send({ orderStatus: "completed" });
  assert.equal(completed.status, 200);
  assert.equal(completed.body.paymentStatus, "pending");
  assert.equal((await Payment.findOne({ order: created.body._id })).status, "pending");
  assert.equal((await request(app).delete(url).set("X-Test-Role", "admin")).status, 409);
});
