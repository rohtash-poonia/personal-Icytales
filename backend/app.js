const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const { rateLimit } = require("express-rate-limit");
const { getOrigins } = require("./config/env");
const { validateInput, httpError } = require("./utils/validation");
const { csrfProtection } = require("./middleware/csrfMiddleware");
const { protect, admin } = require("./middleware/authMiddleware");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("query parser", "simple");
  if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
  const origins = getOrigins();
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || origins.includes(origin)) return callback(null, true);
        callback(httpError(403, "Origin is not allowed"));
      },
      credentials: true,
      methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "X-CSRF-Token", "Idempotency-Key"],
    }),
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 500,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      message: { message: "Too many requests. Try again later." },
    }),
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: false, limit: "100kb" }));
  app.use(cookieParser(), validateInput, csrfProtection);
  app.use("/api/auth", require("./routes/auth"));
  app.use("/api/users", require("./routes/users"));
  app.use("/api/products", require("./routes/products"));
  app.use("/api/orders", require("./routes/orders"));
  app.use("/api/wishlist", require("./routes/wishlist"));
  app.use("/api/content", require("./routes/content"));
  const { getStats } = require("./controllers/orderController");
  app.get(["/api/stats", "/api/admin/stats"], protect, admin, getStats);
  app.get("/api/health", (req, res) => {
    const connected = mongoose.connection.readyState === 1;
    res
      .status(connected ? 200 : 503)
      .json({
        status: connected ? "ok" : "unavailable",
        database: connected ? "connected" : "disconnected",
      });
  });
  app.use(notFound, errorHandler);
  return app;
}
module.exports = { createApp };
