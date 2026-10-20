const { startDatabase, stopDatabase } = require("./helpers/mongo");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "isolated-e2e-signing-secret-1234567890";
process.env.CLIENT_ORIGINS = "http://127.0.0.1:3100";
process.env.STORE_CURRENCY = "USD";
process.env.ORDER_SHIPPING_PRICE = "20.00";

async function main() {
  await startDatabase();
  const User = require("../models/User");
  const Product = require("../models/Product");
  const { operations } = require('../scripts/seedFigmaProducts');
  await Product.bulkWrite(operations());
  await User.create({ name: "Browser Admin", email: "admin@e2e.test", password: "Admin-Password-589", role: "admin" });
  await Product.create({
    title: "Vanilla Journey", slug: "vanilla-journey", description: "A catalog product for the isolated browser journey.",
    price: 5, category: "Classic", images: ["/images/classicVanilla.png"], stock: 10, status: "active",
  });
  const app = require("../app").createApp();
  const port = Number(process.env.PORT || 5099);
  const listener = app.listen(port, "127.0.0.1", () => console.log(`E2E backend ready on ${port}`));
  async function close() {
    await new Promise((resolve) => listener.close(resolve));
    await stopDatabase();
    process.exit(0);
  }
  process.once("SIGINT", close);
  process.once("SIGTERM", close);
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
