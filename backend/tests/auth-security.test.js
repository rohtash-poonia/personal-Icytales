const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const cookieParser = require("cookie-parser");
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-only-isolated-signing-secret-123456789";
const { protect, admin } = require("../middleware/authMiddleware");
const { errorHandler } = require("../middleware/errorMiddleware");
const { cookieOptions, getOrigins } = require("../config/env");

test("cross-site production cookies are secure and allow Vercel plus exact previews", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalSameSite = process.env.COOKIE_SAME_SITE;
  try {
    process.env.NODE_ENV = "production";
    delete process.env.COOKIE_SAME_SITE;
    const cookies = cookieOptions();
    assert.equal(cookies.secure, true);
    assert.equal(cookies.sameSite, "none");
    assert.equal("domain" in cookies, false);

    const origins = getOrigins({
      NODE_ENV: "production",
      CLIENT_ORIGINS: "https://preview.example.vercel.app",
    });
    assert.deepEqual(origins, [
      "https://preview.example.vercel.app",
      "https://personal-icytales.vercel.app",
    ]);
  } finally {
    process.env.NODE_ENV = originalNodeEnv;
    if (originalSameSite === undefined) delete process.env.COOKIE_SAME_SITE;
    else process.env.COOKIE_SAME_SITE = originalSameSite;
  }
});

test("admin routes reject missing credentials even outside production", async () => {
  const app = express();
  app.use(cookieParser());
  app.get("/private", protect, admin, (req, res) =>
    res.json({ private: true }),
  );
  app.use(errorHandler);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.on("listening", resolve));
  try {
    const response = await fetch(
      "http://127.0.0.1:" + server.address().port + "/private",
    );
    assert.equal(response.status, 401);
    assert.equal((await response.json()).private, undefined);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
