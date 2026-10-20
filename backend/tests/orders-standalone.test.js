process.env.NODE_ENV = "test";
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const { createOrder } = require("../services/orderService");

test("standalone MongoDB fails checkout with actionable 503 without any partial writes", async () => {
  const installedBinary = "C:/Program Files/MongoDB/Server/8.3/bin/mongod.exe";
  let database;
  try {
    database = await MongoMemoryServer.create({ binary: fs.existsSync(installedBinary) ? { systemBinary: installedBinary, version: "8.3.7", checkMD5: false } : undefined });
    const uri = database.getUri();
    assert.match(uri, /^mongodb:\/\/127\.0\.0\.1:/);
    await mongoose.connect(uri);
    await Promise.all([Product.init(), Order.init(), Payment.init()]);
    const product = await Product.create({ title: "Test", slug: "test", description: "Isolated", category: "Test", price: 5, stock: 1 });
    await assert.rejects(createOrder({ _id: new mongoose.Types.ObjectId(), role: "user" }, {
      items: [{ product: product._id.toString(), quantity: 1 }], paymentMethod: "cod",
      shippingAddress: { fullName: "Tester", address: "Test", city: "Test", postalCode: "12345", country: "Test" },
    }, "standalone-test-key"), (error) => error.statusCode === 503 && /replica set/i.test(error.message));
    assert.equal((await Product.findById(product._id)).stock, 1);
    assert.equal(await Order.countDocuments(), 0);
    assert.equal(await Payment.countDocuments(), 0);
  } finally {
    await mongoose.disconnect();
    if (database) await database.stop();
  }
});
