const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const cookieParser = require("cookie-parser");
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-only-isolated-signing-secret-123456789";
const { protect, admin } = require("../middleware/authMiddleware");
const { errorHandler } = require("../middleware/errorMiddleware");

test("admin routes reject missing credentials even outside production", async () => {
  const app = express();
  app.use(cookieParser());
  app.get("/private", protect, admin, (req, res) => res.json({ private: true }));
  app.use(errorHandler);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.on("listening", resolve));
  try {
    const response = await fetch("http://127.0.0.1:" + server.address().port + "/private");
    assert.equal(response.status, 401);
    assert.equal((await response.json()).private, undefined);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
