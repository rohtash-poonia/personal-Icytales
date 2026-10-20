const express = require("express");
const { rateLimit } = require("express-rate-limit");
const {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  loginAdmin,
  updateMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { issueCsrf } = require("../middleware/csrfMiddleware");
const router = express.Router();
const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: "Too many login attempts. Try again later." },
});
const registrationLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many registration attempts. Try again later." },
});
router.get("/csrf", issueCsrf);
router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);
router.post("/register", registrationLimit, registerUser);
router.post("/login", loginLimit, loginUser);
router.post("/admin/login", loginLimit, loginAdmin);
router.post("/logout", protect, logoutUser);
module.exports = router;
