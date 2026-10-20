const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { validateEnv } = require("./config/env");
const connectDB = require("./config/db");
const { createApp } = require("./app");
async function start() {
  const { port } = validateEnv();
  await connectDB();
  const app = createApp();
  const server = app.listen(port, () =>
    console.log("IcyTales backend listening on port " + port),
  );
  async function shutdown() {
    server.close(async () => {
      await require("mongoose").disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  }
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  return server;
}
function describeStartupError(error) {
  const message = String(error?.message || "");
  if (message.startsWith("Invalid server configuration:")) return message;
  if (error?.code === "ECONNREFUSED" && message.includes("querySrv")) {
    return "MongoDB DNS lookup failed. Check MONGODB_DNS_SERVERS and network DNS access.";
  }
  if (error?.name === "MongoServerSelectionError") {
    return "MongoDB is unreachable. Check MONGO_URI, Atlas network access, and database availability.";
  }
  if (error?.codeName === "DatabaseDifferCase" || error?.code === 13297) {
    return "MongoDB database-name case conflict. Use the exact existing database name in MONGO_URI.";
  }
  if (error?.codeName === "AuthenticationFailed" || error?.code === 18) {
    return "MongoDB authentication failed. Update the database username and password in MONGO_URI.";
  }
  if (error?.codeName === "IndexKeySpecsConflict" || error?.code === 86) {
    return "MongoDB index definition conflicts with an existing index. Compare model indexes with the database indexes.";
  }
  if (error?.name === "MongoServerError") {
    return `MongoDB initialization failed${error.code ? ` (code ${error.code})` : ""}.`;
  }
  return "Unexpected initialization error. Set DEBUG_STARTUP=1 for a local stack trace.";
}

if (require.main === module)
  start().catch((error) => {
    console.error("Backend startup failed: " + describeStartupError(error));
    if (process.env.DEBUG_STARTUP === "1" && process.env.NODE_ENV !== "production") console.error(error);
    process.exitCode = 1;
  });
module.exports = { start, describeStartupError };
