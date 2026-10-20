const { after, before, beforeEach, test } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-only-isolated-signing-secret-123456789";
process.env.CLIENT_ORIGINS = "http://localhost:3000";

const {
  startDatabase,
  resetDatabase,
  stopDatabase,
} = require("./helpers/mongo");
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

function sessionClient(initialCookie = "") {
  let sessionCookie = initialCookie;
  function cookies(extra) {
    return [sessionCookie, extra].filter(Boolean).join("; ");
  }
  return {
    get sessionCookie() {
      return sessionCookie;
    },
    async get(path) {
      const call = request(server).get(path);
      if (sessionCookie) call.set("Cookie", sessionCookie);
      return call;
    },
    async mutate(method, path, body, headers = {}) {
      const csrfCall = request(server).get("/api/auth/csrf");
      if (sessionCookie) csrfCall.set("Cookie", sessionCookie);
      const csrf = await csrfCall;
      const csrfCookie = csrf.headers["set-cookie"][0].split(";")[0];
      const call = request(server)
        [method](path)
        .set("Cookie", cookies(csrfCookie))
        .set("X-CSRF-Token", csrf.body.csrfToken);
      for (const [name, value] of Object.entries(headers))
        call.set(name, value);
      const response = await call.send(body);
      const issued = response.headers["set-cookie"]?.find((value) =>
        value.startsWith("token="),
      );
      if (issued) sessionCookie = issued.split(";")[0];
      return response;
    },
  };
}

const registration = {
  name: "Test Customer",
  email: "test@example.com",
  password: "Safe-Password-784",
};

test('admin login rejects valid customer credentials without issuing a session', async () => {
  await User.create(registration);
  const client = sessionClient();
  const result = await client.mutate('post', '/api/auth/admin/login', {email:registration.email,password:registration.password});
  assert.equal(result.status, 403);
  assert.equal(result.headers['set-cookie']?.some(value=>value.startsWith('token=')) || false, false);
  const admin = await User.create({...registration,email:'administrator@example.com',role:'admin'});
  const login = await client.mutate('post','/api/auth/admin/login',{email:admin.email,password:registration.password});
  assert.equal(login.status,200);
  assert.equal(login.body.role,'admin');
});

test('profile updates only authenticated permitted fields and verifies changed email', async () => {
  const client = sessionClient();
  await client.mutate('post','/api/auth/register',registration);
  const other = await User.create({...registration,email:'other@example.com'});
  assert.equal((await sessionClient().mutate('patch','/api/auth/me',{name:'Intruder'})).status,401);
  for (const forbidden of [{role:'admin'},{id:other.id},{isBlocked:false},{password:'New-Password-123'}]) {
    assert.equal((await client.mutate('patch','/api/auth/me',forbidden)).status,400);
  }
  assert.equal((await client.mutate('patch','/api/auth/me',{email:'updated@example.com'})).status,400);
  assert.equal((await client.mutate('patch','/api/auth/me',{email:'updated@example.com',currentPassword:'Wrong-Password'})).status,401);
  const result = await client.mutate('patch','/api/auth/me',{name:'Updated Customer',email:'updated@example.com',currentPassword:registration.password});
  assert.equal(result.status,200);
  assert.equal(result.body.name,'Updated Customer');
  assert.equal(result.body.email,'updated@example.com');
  assert.equal(result.body.password,undefined);
  assert.equal((await User.findById(other.id)).name, registration.name);
});

test("registered credentials work on repeated login without exposing tokens or hashes", async () => {
  const client = sessionClient();
  const registered = await client.mutate(
    "post",
    "/api/auth/register",
    registration,
  );
  assert.equal(registered.status, 201);
  assert.equal(registered.body.token, undefined);
  assert.equal(registered.body.password, undefined);
  for (let i = 0; i < 2; i++) {
    const loggedIn = await client.mutate("post", "/api/auth/login", {
      email: registration.email.toUpperCase(),
      password: registration.password,
    });
    assert.equal(loggedIn.status, 200);
    assert.equal(loggedIn.body.role, "user");
    assert.equal(loggedIn.body.token, undefined);
  }
  const user = await User.findOne({ email: registration.email }).select(
    "+password",
  );
  assert.equal(await user.matchPassword(registration.password), true);
});

test("cookie sessions reject forged CSRF on account mutations", async () => {
  const response = await request(server)
    .post("/api/auth/register")
    .send(registration);
  assert.equal(response.status, 403);
  assert.equal(response.body.code, "CSRF_INVALID");
  assert.equal(await User.countDocuments(), 0);
});

test("normalized duplicate email and malformed credential operators are rejected", async () => {
  const client = sessionClient();
  assert.equal(
    (await client.mutate("post", "/api/auth/register", registration)).status,
    201,
  );
  assert.equal(
    (
      await client.mutate("post", "/api/auth/register", {
        ...registration,
        email: " TEST@EXAMPLE.COM ",
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await client.mutate("post", "/api/auth/login", {
        email: { $ne: null },
        password: registration.password,
      })
    ).status,
    400,
  );
});

test("registration rejects administrator and session-field injection", async () => {
  const client = sessionClient();
  const response = await client.mutate("post", "/api/auth/register", {
    ...registration,
    role: "admin",
    sessionVersion: 10,
  });
  assert.equal(response.status, 400);
  assert.equal(await User.countDocuments(), 0);
});

test("logout revokes copied session cookies and auth/me restores sanitized user", async () => {
  const client = sessionClient();
  const registered = await client.mutate(
    "post",
    "/api/auth/register",
    registration,
  );
  assert.equal(registered.status, 201);
  const oldCookie = client.sessionCookie;
  const restored = await client.get("/api/auth/me");
  assert.equal(restored.status, 200);
  assert.equal(restored.body.email, registration.email);
  assert.equal(restored.body.password, undefined);
  assert.equal(
    (await client.mutate("post", "/api/auth/logout", {})).status,
    200,
  );
  assert.equal(
    (await request(server).get("/api/auth/me").set("Cookie", oldCookie)).status,
    401,
  );
});

test("hardcoded development administrator credentials do not authenticate", async () => {
  const client = sessionClient();
  const response = await client.mutate("post", "/api/auth/login", {
    email: "poonia22704@gmail.com",
    password: "poonia22704",
  });
  assert.equal(response.status, 401);
});

test("disallowed origins fail before a mutation reaches the database", async () => {
  const client = sessionClient();
  const response = await client.mutate(
    "post",
    "/api/auth/register",
    registration,
    { Origin: "https://attacker.invalid" },
  );
  assert.equal(response.status, 403);
  assert.equal(await User.countDocuments(), 0);
});
