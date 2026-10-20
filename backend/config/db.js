const mongoose = require("mongoose");
const dns = require("node:dns");

function configureMongoDns(uri, configuredServers = process.env.MONGODB_DNS_SERVERS) {
  if (!uri?.startsWith("mongodb+srv://") || !configuredServers) return;

  const servers = configuredServers
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);
  if (servers.length) dns.setServers(servers);
}

async function connectDB(uri = process.env.MONGO_URI) {
  configureMongoDns(uri);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, autoIndex: true, maxPoolSize: 20 });
  const models = [require("../models/User"), require("../models/Product"), require("../models/Order"), require("../models/Payment"), require("../models/ContactMessage"), require("../models/NewsletterSubscription")];
  await Promise.all(models.map((model) => model.init()));
  await require("../models/Review").init();
  return mongoose.connection;
}
module.exports = connectDB;
module.exports.configureMongoDns = configureMongoDns;

