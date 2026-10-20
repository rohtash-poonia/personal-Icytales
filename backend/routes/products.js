const express = require("express");
const multer = require("multer");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { createProduct, uploadProductImage, getProducts, getProductById, getProductBySlug, updateProduct, deleteProduct } = require("../controllers/productController");
const { protect, optionalProtect, admin } = require("../middleware/authMiddleware");
const { httpError } = require("../utils/validation");
const router = express.Router();
const { listReviews, writeReview } = require("../controllers/reviewController");
router.get("/:id/reviews", optionalProtect, listReviews);
router.post("/:id/reviews", protect, writeReview("create"));
router.patch("/:id/reviews/me", protect, writeReview("update"));
router.delete("/:id/reviews/me", protect, writeReview("delete"));
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const directory = path.join(os.tmpdir(), "icytales-uploads");
    fs.mkdir(directory, { recursive: true }, (err) => cb(err, directory));
  },
  filename(req, file, cb) { cb(null, crypto.randomUUID()); },
});
function createUpload(limits) { return multer({ storage, limits,
  fileFilter(req, file, cb) {
    if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.mimetype)) return cb(httpError(400, "Upload a PNG, JPEG, WEBP or GIF image"));
    cb(null, true);
  },
}); }
const singleUpload = createUpload({ fileSize: 5 * 1024 * 1024, files: 1, fields: 0, parts: 1 });
const productUpload = createUpload({ fileSize: 5 * 1024 * 1024, files: 10, fields: 1, parts: 11 });
router.get("/", optionalProtect, getProducts);
router.get("/slug/:slug", optionalProtect, getProductBySlug);
router.get("/:id", optionalProtect, getProductById);
router.post("/", protect, admin, productUpload.array("images", 10), createProduct);
router.post("/upload", protect, admin, singleUpload.single("image"), uploadProductImage);
router.put("/:id", protect, admin, productUpload.array("images", 10), updateProduct);
router.patch("/:id", protect, admin, productUpload.array("images", 10), updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
module.exports = router;
