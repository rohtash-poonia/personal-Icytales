const { after, before, beforeEach, test } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-only-isolated-signing-secret-123456789";
process.env.CLIENT_ORIGINS = "http://localhost:3000";

const { startDatabase, resetDatabase, stopDatabase } = require("./helpers/mongo");
const ContactMessage = require("../models/ContactMessage");
const NewsletterSubscription = require("../models/NewsletterSubscription");
const User = require("../models/User");
const { createApp } = require("../app");

let server;
before(async () => {
  await startDatabase();
  await new Promise((resolve, reject) => {
    server = createApp().listen(0, "127.0.0.1", resolve);
    server.once("error", reject);
  });
});
beforeEach(resetDatabase);
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await stopDatabase();
});

async function csrf(agent) {
  const response = await agent.get("/api/auth/csrf");
  return {
    token: response.body.csrfToken,
    cookie: response.headers["set-cookie"][0].split(";")[0],
  };
}
async function post(agent, path, body) {
  const security = await csrf(agent);
  return agent.post(path).set("Cookie", security.cookie).set("X-CSRF-Token", security.token).send(body);
}

test("contact form validates and persists a truthful message receipt", async () => {
  const agent = request.agent(server);
  const response = await post(agent, "/api/content/contact", {
    firstName: "Asha", lastName: "Rao", email: "ASHA@example.com",
    phone: "+91 98765 43210", message: "Please share delivery availability for my area.",
  });
  assert.equal(response.status, 201);
  assert.match(response.body.id, /^[a-f\d]{24}$/);
  const saved = await ContactMessage.findById(response.body.id).lean();
  assert.equal(saved.email, "asha@example.com");
  assert.equal(saved.status, "new");
  assert.equal(response.body.saved, undefined);
});

test("contact form rejects extra fields and does not persist invalid input", async () => {
  const agent = request.agent(server);
  const response = await post(agent, "/api/content/contact", {
    firstName: "A", lastName: "B", email: "bad", message: "short", role: "admin",
  });
  assert.equal(response.status, 400);
  assert.equal(await ContactMessage.countDocuments(), 0);
});

test("newsletter subscription requires consent and is idempotent by normalized email", async () => {
  const agent = request.agent(server);
  assert.equal((await post(agent, "/api/content/newsletter", { email: "news@example.com", consent: false })).status, 400);
  const first = await post(agent, "/api/content/newsletter", { email: " News@Example.com ", consent: true });
  const replay = await post(agent, "/api/content/newsletter", { email: "news@example.com", consent: true });
  assert.equal(first.status, 201);
  assert.equal(replay.status, 200);
  assert.equal(await NewsletterSubscription.countDocuments(), 1);
});

test("only administrators can list contact messages through a bounded envelope", async () => {
  await ContactMessage.create({ firstName: "Asha", lastName: "Rao", email: "asha@example.com", message: "A message long enough to store." });
  const guest = request.agent(server);
  assert.equal((await guest.get("/api/content/messages")).status, 401);

  const adminAgent = request.agent(server);
  const registration = await post(adminAgent, "/api/auth/register", { name: "Admin User", email: "admin@example.com", password: "Safe-Password-784" });
  await User.updateOne({ _id: registration.body.id }, { $set: { role: "admin" } });
  const sessionCookie = registration.headers["set-cookie"].find((value) => value.startsWith("token=")).split(";")[0];
  const listed = await adminAgent.get("/api/content/messages?limit=1").set("Cookie", sessionCookie);
  assert.equal(listed.status, 200);
  assert.equal(listed.body.items.length, 1);
  assert.deepEqual(listed.body.pagination, { page: 1, limit: 1, total: 1, pages: 1 });
});


