const crypto = require("node:crypto");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Payment = require("../models/Payment");

function fail(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}
function moneyToCents(value) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1000000 ||
    Math.abs(value * 100 - Math.round(value * 100)) > 0.000001
  ) {
    throw fail(422, "Invalid price: use at most two decimal places");
  }
  return Math.round(value * 100);
}
function objectId(value, label = "ID") {
  if (typeof value !== "string" || !/^[a-f0-9]{24}$/i.test(value))
    throw fail(400, "Invalid " + label);
  return value.toLowerCase();
}
function actorId(actor) {
  if (!actor || !actor._id) throw fail(401, "Authentication required");
  return objectId(String(actor._id), "user ID");
}
function requireAdmin(actor) {
  actorId(actor);
  if (actor.role !== "admin") throw fail(403, "Admin access required");
}
function storeCurrency() {
  const currency = process.env.STORE_CURRENCY || "USD";
  if (!/^[A-Z]{3}$/.test(currency))
    throw fail(
      503,
      "STORE_CURRENCY must be a three-letter uppercase currency code",
    );
  try {
    new Intl.NumberFormat("en", { style: "currency", currency });
  } catch {
    throw fail(503, "Invalid STORE_CURRENCY configuration");
  }
  return currency;
}
function shippingCents() {
  const configured = process.env.ORDER_SHIPPING_PRICE;
  if (configured !== undefined && !/^\d+(\.\d{1,2})?$/.test(configured))
    throw fail(
      503,
      "ORDER_SHIPPING_PRICE must be a nonnegative amount with at most two decimal places",
    );
  try {
    return moneyToCents(configured === undefined ? 20 : Number(configured));
  } catch {
    throw fail(503, "Invalid ORDER_SHIPPING_PRICE configuration");
  }
}
function normalizeOrderInput(body, key) {
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw fail(400, "Order body is required");
  if (
    typeof key !== "string" ||
    !/^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/.test(key)
  )
    throw fail(
      400,
      "Idempotency-Key header must contain 8 to 128 letters, digits, dots, underscores, colons or hyphens",
    );
  if (body.paymentMethod !== "cod")
    throw fail(
      422,
      "Only cash on delivery is currently available; online payment is not supported",
    );
  if (
    !Array.isArray(body.items) ||
    body.items.length < 1 ||
    body.items.length > 50
  )
    throw fail(400, "Order must contain 1 to 50 items");
  const seen = new Set();
  const items = body.items
    .map((item) => {
      if (!item || typeof item !== "object")
        throw fail(400, "Invalid product item");
      const product = objectId(item.product, "product ID");
      if (seen.has(product))
        throw fail(400, "Duplicate product; combine quantities into one item");
      seen.add(product);
      if (
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 100
      )
        throw fail(400, "Item quantity must be an integer between 1 and 100");
      return { product, quantity: item.quantity };
    })
    .sort((a, b) => a.product.localeCompare(b.product));
  if (
    !body.shippingAddress ||
    typeof body.shippingAddress !== "object" ||
    Array.isArray(body.shippingAddress)
  )
    throw fail(400, "Shipping address is required");
  const shippingAddress = {};
  for (const [field, max] of Object.entries({
    fullName: 120,
    address: 250,
    city: 100,
    postalCode: 24,
    country: 100,
  })) {
    const value = body.shippingAddress[field];
    if (
      typeof value !== "string" ||
      !value.trim() ||
      value.trim().length > max ||
      /[\u0000-\u001f\u007f]/.test(value)
    )
      throw fail(
        400,
        "Shipping " + field + " is required and must be valid text",
      );
    shippingAddress[field] = value.trim();
  }
  if (
    body.shippingAddress.phone !== undefined &&
    body.shippingAddress.phone !== ""
  ) {
    const phone = body.shippingAddress.phone;
    if (
      typeof phone !== "string" ||
      phone.length > 40 ||
      !/^[+\d()\s.-]+$/.test(phone)
    )
      throw fail(400, "Invalid shipping phone");
    shippingAddress.phone = phone.trim();
  }
  const value = { items, shippingAddress, paymentMethod: "cod" };
  return {
    ...value,
    idempotencyKey: key,
    requestFingerprint: crypto
      .createHash("sha256")
      .update(JSON.stringify(value))
      .digest("hex"),
  };
}
function replay(order, fingerprint) {
  if (order.requestFingerprint !== fingerprint)
    throw fail(409, "Idempotency-Key was already used for a different order");
  return { order, replayed: true };
}
function transactionError(error) {
  if (
    error.code === 20 ||
    error.code === 303 ||
    /Transaction numbers are only allowed|does not support retryable writes|replica set.*transaction/i.test(
      error.message,
    )
  ) {
    return fail(
      503,
      "Checkout requires MongoDB transactions. Configure MongoDB Atlas or a replica set before accepting orders.",
    );
  }
  return error;
}
async function transact(operation) {
  if (mongoose.connection.readyState !== 1)
    throw fail(503, "Database is unavailable");
  try {
    let result;
    await mongoose.connection.transaction(async (session) => {
      result = await operation(session);
    });
    return result;
  } catch (error) {
    throw transactionError(error);
  }
}
async function createOrder(actor, body, key) {
  const user = actorId(actor);
  const input = normalizeOrderInput(body, key);
  const existing = await Order.findOne({ user, idempotencyKey: key }).lean();
  if (existing) return replay(existing, input.requestFingerprint);
  const currency = storeCurrency();
  const delivery = shippingCents();
  try {
    return await transact(async (session) => {
      const prior = await Order.findOne({ user, idempotencyKey: key })
        .session(session)
        .lean();
      if (prior) return replay(prior, input.requestFingerprint);
      const items = [];
      let subtotal = 0;
      for (const requested of input.items) {
        const product = await Product.findOneAndUpdate(
          {
            _id: requested.product,
            status: "active",
            stock: { $gte: requested.quantity },
          },
          { $inc: { stock: -requested.quantity } },
          { new: true, session },
        ).lean();
        if (!product)
          throw fail(
            409,
            "A product is unavailable or has insufficient stock; refresh your cart",
          );
        const unitPrice = moneyToCents(product.price);
        if (!Number.isSafeInteger(product.stock) || product.stock < 0)
          throw fail(409, "A product has invalid inventory; contact the store");
        if (unitPrice < 1)
          throw fail(409, "A product has an invalid price; contact the store");
        subtotal += unitPrice * requested.quantity;
        if (!Number.isSafeInteger(subtotal))
          throw fail(422, "Order total is too large");
        items.push({
          product: product._id,
          name: product.title,
          quantity: requested.quantity,
          price: unitPrice / 100,
          priceCents: unitPrice,
          image: typeof product.images?.[0] === "string" ? product.images[0] : product.images?.[0]?.url || "",
        });
      }
      const total = subtotal + delivery;
      const [order] = await Order.create(
        [
          {
            user,
            items,
            shippingAddress: input.shippingAddress,
            paymentMethod: "cod",
            paymentStatus: "pending",
            orderStatus: "pending",
            currency,
            itemsPrice: subtotal / 100,
            shippingPrice: delivery / 100,
            totalPrice: total / 100,
            itemsPriceCents: subtotal,
            shippingPriceCents: delivery,
            totalPriceCents: total,
            idempotencyKey: key,
            requestFingerprint: input.requestFingerprint,
            stockCommittedAt: new Date(),
          },
        ],
        { session },
      );
      await Payment.create(
        [
          {
            order: order._id,
            amount: total / 100,
            amountCents: total,
            currency,
            method: "cod",
            status: "pending",
          },
        ],
        { session },
      );
      return { order: order.toObject(), replayed: false };
    });
  } catch (error) {
    if (error.code === 11000) {
      const prior = await Order.findOne({ user, idempotencyKey: key }).lean();
      if (prior) return replay(prior, input.requestFingerprint);
    }
    throw error;
  }
}
async function quoteOrder(actor, body = {}) {
  actorId(actor);
  const input = normalizeOrderInput(
    {
      ...body,
      paymentMethod: body.paymentMethod || "cod",
      shippingAddress: {
        fullName: "Quote",
        address: "Quote",
        city: "Quote",
        postalCode: "Quote",
        country: "Quote",
      },
    },
    "quote-validation",
  );
  const products = await Product.find({
    _id: { $in: input.items.map((item) => item.product) },
    status: "active",
  }).lean();
  const byId = new Map(
    products.map((product) => [String(product._id), product]),
  );
  let subtotal = 0;
  const items = input.items.map((item) => {
    const product = byId.get(item.product);
    if (
      !product ||
      !Number.isSafeInteger(product.stock) ||
      product.stock < item.quantity
    )
      throw fail(
        409,
        "A product is unavailable or has insufficient stock; refresh your cart",
      );
    const priceCents = moneyToCents(product.price);
    if (priceCents < 1)
      throw fail(409, "A product has an invalid price; contact the store");
    subtotal += priceCents * item.quantity;
    return {
      product: product._id,
      name: product.title,
      quantity: item.quantity,
      price: priceCents / 100,
      priceCents,
    };
  });
  const shipping = shippingCents();
  return {
    items,
    currency: storeCurrency(),
    itemsPrice: subtotal / 100,
    shippingPrice: shipping / 100,
    totalPrice: (subtotal + shipping) / 100,
    itemsPriceCents: subtotal,
    shippingPriceCents: shipping,
    totalPriceCents: subtotal + shipping,
  };
}
function pagination(query = {}) {
  const number = (value, fallback) =>
    value === undefined
      ? fallback
      : /^\d+$/.test(String(value)) && Number.isSafeInteger(Number(value))
        ? Number(value)
        : NaN;
  const page = number(query.page, 1);
  const limit = Math.min(number(query.limit, 25), 100);
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    !Number.isSafeInteger((page - 1) * limit)
  )
    throw fail(400, "Invalid pagination");
  return { page, limit };
}
async function listOrders(actor, query, requestedUser) {
  const id = actorId(actor);
  const filter = { archivedAt: { $exists: false } };
  if (requestedUser !== undefined) {
    const user = objectId(requestedUser, "user ID");
    if (actor.role !== "admin" && user !== id) throw fail(403, "Access denied");
    filter.user = user;
  } else if (actor.role !== "admin") filter.user = id;
  const { page, limit } = pagination(query);
  const [items, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);
  return {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}
async function getOrder(actor, id) {
  const owner = actorId(actor);
  const order = await Order.findById(objectId(id, "order ID")).lean();
  if (!order) throw fail(404, "Order not found");
  const user = order.user?._id || order.user;
  if (actor.role !== "admin" && String(user) !== owner)
    throw fail(403, "Access denied");
  return Order.populate(order, { path: "user", select: "name email" });
}
async function updateStatus(actor, id, body = {}) {
  requireAdmin(actor);
  objectId(id, "order ID");
  const status = body.orderStatus;
  if (
    status !== undefined &&
    !["pending", "processing", "completed", "cancelled"].includes(status)
  )
    throw fail(400, "Invalid order status");
  return transact(async (session) => {
    const order = await Order.findById(id).session(session).lean();
    if (!order) throw fail(404, "Order not found");
    if (order.archivedAt) throw fail(409, "Archived orders cannot be changed");
    if (
      body.paymentStatus !== undefined &&
      body.paymentStatus !== order.paymentStatus
    )
      throw fail(
        422,
        "Payment status requires verified payment or the explicit cash collection action",
      );
    const nextStatus = status || order.orderStatus;
    const transitions = {
      pending: ["pending", "processing", "cancelled"],
      processing: ["processing", "completed", "cancelled"],
      completed: ["completed"],
      cancelled: ["cancelled"],
    };
    if (!transitions[order.orderStatus]?.includes(nextStatus))
      throw fail(409, "This order status transition is not allowed");
    const set = { orderStatus: nextStatus };
    if (nextStatus === "cancelled") {
      if (order.paymentStatus === "paid")
        throw fail(
          409,
          "A paid order requires a verified refund before cancellation",
        );
      set.paymentStatus = "failed";
      if (order.stockCommittedAt && !order.stockRestoredAt) {
        for (const item of order.items) {
          if (
            !mongoose.isObjectIdOrHexString(item.product) ||
            !Number.isSafeInteger(item.quantity) ||
            item.quantity < 1
          )
            throw fail(
              409,
              "Inventory history needs manual review before cancelling this legacy order",
            );
          const changed = await Product.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity } },
            { session },
          );
          if (!changed.matchedCount)
            throw fail(
              409,
              "A reserved product is missing; inventory needs manual review",
            );
        }
        set.stockRestoredAt = new Date();
      }
      await Payment.updateMany(
        { order: order._id, status: { $ne: "completed" } },
        { $set: { status: "failed" } },
        { session },
      );
    }
    await Order.updateOne({ _id: id }, { $set: set }, { session });
    return { ...order, ...set };
  });
}
async function collectCash(actor, id, body = {}) {
  requireAdmin(actor);
  objectId(id, "order ID");
  if (body.confirmed !== true)
    throw fail(400, "Confirm that cash has actually been received");
  return transact(async (session) => {
    const order = await Order.findById(id).session(session).lean();
    if (!order) throw fail(404, "Order not found");
    if (
      order.archivedAt ||
      order.paymentMethod !== "cod" ||
      !["processing", "completed"].includes(order.orderStatus)
    )
      throw fail(
        409,
        "Cash can only be collected for processing or completed COD orders",
      );
    if (order.paymentStatus === "paid" && order.collectedAt) return order;
    if (order.paymentStatus !== "pending")
      throw fail(409, "This payment requires manual review");
    const payment = await Payment.findOne({ order: order._id })
      .session(session)
      .lean();
    if (
      !payment ||
      payment.method !== "cod" ||
      payment.status !== "pending" ||
      payment.amountCents !== order.totalPriceCents ||
      !Number.isSafeInteger(order.totalPriceCents) ||
      payment.currency !== order.currency
    )
      throw fail(409, "Order and payment accounting need manual review");
    const collectedAt = new Date();
    const collectedBy = actor._id;
    await Payment.updateOne(
      { _id: payment._id, status: "pending" },
      {
        $set: {
          status: "completed",
          paidAt: collectedAt,
          collectedAt,
          collectedBy,
        },
      },
      { session },
    );
    await Order.updateOne(
      { _id: order._id },
      { $set: { paymentStatus: "paid", collectedAt, collectedBy } },
      { session },
    );
    return { ...order, paymentStatus: "paid", collectedAt, collectedBy };
  });
}
async function archiveOrder(actor, id) {
  requireAdmin(actor);
  objectId(id, "order ID");
  return transact(async (session) => {
    const order = await Order.findById(id).session(session).lean();
    if (!order) throw fail(404, "Order not found");
    if (order.orderStatus !== "cancelled" || order.paymentStatus === "paid")
      throw fail(
        409,
        "Only cancelled unpaid orders can be archived; accounting records are retained",
      );
    if (!order.archivedAt)
      await Order.updateOne(
        { _id: id },
        { $set: { archivedAt: new Date(), archivedBy: actor._id } },
        { session },
      );
    return {
      message: "Order archived; payment and inventory history retained",
    };
  });
}
module.exports = {
  fail,
  moneyToCents,
  normalizeOrderInput,
  storeCurrency,
  requireAdmin,
  createOrder,
  quoteOrder,
  listOrders,
  getOrder,
  updateStatus,
  collectCash,
  archiveOrder,
  pagination,
};
