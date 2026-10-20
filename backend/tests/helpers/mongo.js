const mongoose = require("mongoose");
const fs = require("node:fs");
const installedBinary = "C:/Program Files/MongoDB/Server/8.3/bin/mongod.exe";
const { MongoMemoryReplSet } = require("mongodb-memory-server");
let replica;
let isolatedUri;
async function startDatabase() {
  replica = await MongoMemoryReplSet.create({
    instanceOpts: [{ launchTimeout: 30000 }],
    binary: fs.existsSync(installedBinary) ? { systemBinary: installedBinary, version: "8.3.7", checkMD5: false } : undefined,
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });
  isolatedUri = replica.getUri();
  await mongoose.connect(isolatedUri);
  return isolatedUri;
}
async function resetDatabase() {
  if (!isolatedUri || !/^mongodb:\/\/(127\.0\.0\.1|localhost):/.test(isolatedUri)) {
    throw new Error("Refusing to reset a database that is not an isolated local test instance");
  }
  for (const collection of Object.values(mongoose.connection.collections)) {
    await collection.deleteMany({});
  }
}
async function stopDatabase() {
  await mongoose.disconnect();
  if (replica) await replica.stop();
}
module.exports = { startDatabase, resetDatabase, stopDatabase };

