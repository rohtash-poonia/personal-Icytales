const { test, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const cookieParser = require("cookie-parser");
const request = require("supertest");
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-only-isolated-signing-secret-123456789";
const { startDatabase, resetDatabase, stopDatabase } = require("./helpers/mongo");
const User = require("../models/User");
const Product = require("../models/Product");
const { errorHandler } = require("../middleware/errorMiddleware");
function createTestApp() {
  const app = express();
  app.use(express.json(), cookieParser());
  app.use("/api/auth", require("../routes/auth"));
  app.use("/api/users", require("../routes/users"));
  app.use("/api/products", require("../routes/products"));
  app.use(errorHandler);
  return app;
}
let app;
before(async () => { await startDatabase(); app = createTestApp(); });
beforeEach(resetDatabase);
after(stopDatabase);
async function csrf(agent) { return (await agent.get("/api/auth/csrf")).body.csrfToken || ""; }
async function mutation(agent, method, path, body) {
  const token = await csrf(agent);
  const req = agent[method](path);
  if (token) req.set("X-CSRF-Token", token);
  return req.send(body);
}
async function loginAdmin() {
  const admin = await User.create({ name: "Admin", email: "admin@example.com", password: "Admin-Password-589", role: "admin" });
  const agent = request.agent(app);
  const response = await mutation(agent, "post", "/api/auth/login", { email: admin.email, password: "Admin-Password-589" });
  assert.equal(response.status, 200);
  return { agent, admin };
}
const baseProduct = { title: "Vanilla", slug: "vanilla", description: "Fresh vanilla ice cream", price: 5, category: "Classic", stock: 10 };

test("public catalog cannot request drafts or read a draft by identifier", async () => {
  const draft = await Product.create({ ...baseProduct, status: "draft" });
  assert.equal((await request(app).get("/api/products?all=true")).status, 403);
  assert.equal((await request(app).get("/api/products/" + draft.id)).status, 404);
});

test("catalog uses paginated envelopes, safe literal search and price filters", async () => {
  await Product.create([
    { ...baseProduct, price: 5 },
    { ...baseProduct, slug: "mint", title: "Mint", price: 9 },
    { ...baseProduct, slug: "hidden", status: "draft" },
  ]);
  const response = await request(app).get("/api/products?limit=1&minPrice=6&sort=price-desc");
  assert.equal(response.status, 200);
  assert.equal(response.body.items.length, 1);
  assert.equal(response.body.items[0].slug, "mint");
  assert.deepEqual(response.body.pagination, { page: 1, limit: 1, total: 1, pages: 1 });
  const literal = await request(app).get("/api/products?search=%5B");
  assert.equal(literal.status, 200);
  assert.equal(literal.body.items.length, 0);
  assert.equal((await request(app).get("/api/products?category[$ne]=x")).status, 400);
});

test("slug details exist and malformed identifiers produce client errors", async () => {
  await Product.create(baseProduct);
  const response = await request(app).get("/api/products/slug/vanilla");
  assert.equal(response.status, 200);
  assert.equal(response.body.title, "Vanilla");
  assert.equal((await request(app).get("/api/products/not-an-id")).status, 400);
});

test("admin product writes reject unsupported fields and invalid enums", async () => {
  const { agent } = await loginAdmin();
  assert.equal((await mutation(agent, "post", "/api/products", { ...baseProduct, owner: "attacker" })).status, 400);
  assert.equal((await mutation(agent, "post", "/api/products", { ...baseProduct, status: "inactive" })).status, 400);
  assert.equal((await mutation(agent, "post", "/api/products", { ...baseProduct, price: -1 })).status, 400);
  assert.equal((await mutation(agent, "post", "/api/products", { ...baseProduct, price: 0 })).status, 400);
  assert.equal((await mutation(agent, "post", "/api/products", { ...baseProduct, price: 0.01 })).status, 201);
});

test("admin cannot block another administrator and can delete a normal customer", async () => {
  const { agent } = await loginAdmin();
  const otherAdmin = await User.create({ name: "Other Admin", email: "other@example.com", password: "Other-Password-589", role: "admin" });
  assert.equal((await mutation(agent, "put", "/api/users/" + otherAdmin.id + "/block", { isBlocked: true })).status, 403);
  const customer = await User.create({ name: "Customer", email: "customer@example.com", password: "Customer-Password-589" });
  assert.equal((await mutation(agent, "delete", "/api/users/" + customer.id, {})).status, 200);
  assert.equal(await User.findById(customer.id), null);
});

test("blocking revokes customer sessions and users list excludes secrets", async () => {
  const { agent } = await loginAdmin();
  const customer = await User.create({ name: "Customer", email: "customer@example.com", password: "Customer-Password-589" });
  const customerAgent = request.agent(app);
  assert.equal((await mutation(customerAgent, "post", "/api/auth/login", { email: customer.email, password: "Customer-Password-589" })).status, 200);
  assert.equal((await mutation(agent, "patch", "/api/users/" + customer.id + "/block", { isBlocked: true })).status, 200);
  assert.equal((await customerAgent.get("/api/auth/me")).status, 401);
  const list = await agent.get("/api/users?limit=1");
  assert.equal(list.status, 200);
  assert.equal(list.body.pagination.total, 2);
  assert.equal(list.body.items.length, 1);
  assert.equal(list.body.items[0].password, undefined);
  assert.equal(list.body.items[0].sessionVersion, undefined);
});

test("uploads reject mismatched file signatures without a provider call", async () => {
  const { agent } = await loginAdmin();
  const token = await csrf(agent);
  let upload = agent.post("/api/products/upload");
  if (token) upload.set("X-CSRF-Token", token);
  const response = await upload.attach("image", Buffer.from("not an image"), { filename: "fake.png", contentType: "image/png" });
  assert.equal(response.status, 400);
});

test("admin product multipart writes preserve structured images and flavor", async () => {
  const { agent } = await loginAdmin();
  const token = await csrf(agent);
  let create = agent.post("/api/products");
  if (token) create = create.set("X-CSRF-Token", token);
  const response = await create.field("product", JSON.stringify({
    ...baseProduct,
    flavor: "Madagascar Vanilla",
    images: [{ url: "/images/classicVanilla.png", publicId: null, alt: "Vanilla cone" }],
  }));
  assert.equal(response.status, 201);
  assert.equal(response.body.flavor, "Madagascar Vanilla");
  assert.deepEqual(response.body.images, [{ url: "/images/classicVanilla.png", publicId: null, alt: "Vanilla cone" }]);
});

test("bulk product uploads reject mismatched file signatures before Cloudinary", async () => {
  const { agent } = await loginAdmin();
  const token = await csrf(agent);
  let create = agent.post("/api/products");
  if (token) create = create.set("X-CSRF-Token", token);
  const response = await create
    .field("product", JSON.stringify(baseProduct))
    .attach("images", Buffer.from("not an image"), { filename: "fake.png", contentType: "image/png" });
  assert.equal(response.status, 400);
  assert.equal(await Product.countDocuments(), 0);
});

