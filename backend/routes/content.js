const express = require("express");
const { rateLimit } = require("express-rate-limit");
const { admin, protect } = require("../middleware/authMiddleware");
const { getContactMessages, submitContact, subscribeNewsletter } = require("../controllers/contentController");

const router = express.Router();
const publicFormLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many form submissions. Try again later." },
});

router.post("/contact", publicFormLimit, submitContact);
router.post("/newsletter", publicFormLimit, subscribeNewsletter);
router.get("/messages", protect, admin, getContactMessages);

module.exports = router;
