const asyncHandler = require("express-async-handler");
const ContactMessage = require("../models/ContactMessage");
const NewsletterSubscription = require("../models/NewsletterSubscription");
const { allowFields, email, envelope, pagination, text, httpError } = require("../utils/validation");

const submitContact = asyncHandler(async (req, res) => {
  allowFields(req.body, ["firstName", "lastName", "email", "phone", "message"]);
  const data = {
    firstName: text(req.body.firstName, "First name", { max: 80 }),
    lastName: text(req.body.lastName, "Last name", { max: 80 }),
    email: email(req.body.email),
    message: text(req.body.message, "Message", { min: 10, max: 5000 }),
  };
  if (req.body.phone !== undefined && req.body.phone !== "") {
    const phone = text(req.body.phone, "Phone", { max: 40 });
    if (!/^[+\d()\s.-]+$/.test(phone)) throw httpError(400, "Phone contains unsupported characters");
    data.phone = phone;
  }
  const saved = await ContactMessage.create(data);
  res.status(201).json({ id: saved.id, message: "Your message has been received." });
});

const subscribeNewsletter = asyncHandler(async (req, res) => {
  allowFields(req.body, ["email", "consent"]);
  if (req.body.consent !== true) throw httpError(400, "Consent is required to subscribe");
  const normalized = email(req.body.email);
  let existing = await NewsletterSubscription.findOne({ email: normalized });
  if (existing) {
    if (!existing.active) {
      existing.active = true;
      existing.consentAt = new Date();
      await existing.save();
    }
    return res.status(200).json({ subscribed: true, message: "This email is already subscribed." });
  }
  try {
    await NewsletterSubscription.create({ email: normalized, consentAt: new Date(), active: true });
    res.status(201).json({ subscribed: true, message: "Subscription saved." });
  } catch (error) {
    if (error.code !== 11000) throw error;
    existing = await NewsletterSubscription.findOne({ email: normalized });
    if (!existing) throw error;
    res.status(200).json({ subscribed: true, message: "This email is already subscribed." });
  }
});

const getContactMessages = asyncHandler(async (req, res) => {
  allowFields(req.query, ["page", "limit", "status"]);
  const { page, limit, skip } = pagination(req.query);
  const filter = {};
  if (req.query.status !== undefined) {
    if (!["new", "read", "replied"].includes(req.query.status)) throw httpError(400, "Invalid message status");
    filter.status = req.query.status;
  }
  const [items, total] = await Promise.all([
    ContactMessage.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).lean(),
    ContactMessage.countDocuments(filter),
  ]);
  res.json(envelope(items, total, page, limit));
});

module.exports = { submitContact, subscribeNewsletter, getContactMessages };
