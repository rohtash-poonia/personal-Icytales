const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Product = require("../models/Product");
const User = require("../models/User");
const service = require("../services/orderService");

const createOrder = asyncHandler(async (req, res) => {
  const result = await service.createOrder(req.user, req.body, req.get("Idempotency-Key"));
  res.status(result.replayed ? 200 : 201).json(result.order);
});
const quoteOrder = asyncHandler(async (req, res) => res.json(await service.quoteOrder(req.user, req.body)));
const getOrders = asyncHandler(async (req, res) => res.json(await service.listOrders(req.user, req.query)));
const getOrdersByUser = asyncHandler(async (req, res) => res.json(await service.listOrders(req.user, req.query, req.params.userId)));
const getOrderById = asyncHandler(async (req, res) => res.json(await service.getOrder(req.user, req.params.id)));
const updateOrderStatus = asyncHandler(async (req, res) => res.json(await service.updateStatus(req.user, req.params.id, req.body)));
const collectCash = asyncHandler(async (req, res) => res.json(await service.collectCash(req.user, req.params.id, req.body)));
const deleteOrder = asyncHandler(async (req, res) => res.json(await service.archiveOrder(req.user, req.params.id)));
const getStats = asyncHandler(async (req, res) => {
  service.requireAdmin(req.user);
  if (mongoose.connection.readyState !== 1) throw service.fail(503, "Database is unavailable");
  const currency = service.storeCurrency();
  const now = new Date();
  const since = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  const collected = { status: "completed", currency, $or: [{ collectedAt: { $type: "date" }, collectedBy: { $type: "objectId" }, method: "cod" }, { providerVerifiedAt: { $type: "date" } }] };
  const active = { archivedAt: { $exists: false } };
  const [products, users, orders, pendingOrders, received, pending, monthlyOrders, monthlyPayments] = await Promise.all([
    Product.countDocuments({ status: { $ne: "archived" } }),
    User.countDocuments({}),
    Order.countDocuments(active),
    Order.countDocuments({ ...active, orderStatus: "pending" }),
    Payment.aggregate([{ $match: collected }, { $group: { _id: null, cents: { $sum: "$amountCents" } } }]),
    Order.aggregate([{ $match: { ...active, currency, paymentStatus: "pending", orderStatus: { $ne: "cancelled" } } }, { $group: { _id: null, cents: { $sum: "$totalPriceCents" } } }]),
    Order.aggregate([{ $match: { ...active, createdAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt", timezone: "UTC" } }, orders: { $sum: 1 } } }]),
    Payment.aggregate([{ $match: { ...collected, paidAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$paidAt", timezone: "UTC" } }, cents: { $sum: "$amountCents" } } }]),
  ]);
  const orderMap = new Map(monthlyOrders.map((item) => [item._id, item.orders]));
  const paymentMap = new Map(monthlyPayments.map((item) => [item._id, item.cents / 100]));
  const monthly = Array.from({ length: 12 }, (_, index) => {
    const month = new Date(Date.UTC(since.getUTCFullYear(), since.getUTCMonth() + index, 1)).toISOString().slice(0, 7);
    return { month, orders: orderMap.get(month) || 0, revenue: paymentMap.get(month) || 0 };
  });
  res.json({ counts: { products, users, orders, pendingOrders }, revenue: { collected: (received[0]?.cents || 0) / 100, pending: (pending[0]?.cents || 0) / 100, currency }, monthly });
});
module.exports = { createOrder, quoteOrder, getOrders, getOrdersByUser, getOrderById, updateOrderStatus, collectCash, deleteOrder, getStats };
