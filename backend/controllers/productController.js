const asyncHandler = require("express-async-handler");
const fs = require("node:fs/promises");
const Product = require("../models/Product");
const { uploadImage, destroyImage } = require("../utils/cloudinary");
const { normalizeImageList, createProductMediaService } = require("../services/productMediaService");
const { allowFields, text, number, objectId, pagination, envelope, escapeRegex, httpError } = require("../utils/validation");
const FIELDS = ["title", "slug", "description", "price", "category", "flavor", "tags", "images", "stock", "status", "featured"];
const media = createProductMediaService({ Product, uploadImage, destroyImage });
async function removeTempFiles(files = []) {
  await Promise.allSettled(files.map((file) => fs.unlink(file.path)));
}

async function validateUploadedFiles(files = []) {
  for (const file of files) {
    const handle = await fs.open(file.path, "r");
    let header;
    try {
      header = Buffer.alloc(12);
      await handle.read(header, 0, 12, 0);
    } finally {
      await handle.close();
    }
    if (!validImageSignature(header, file.mimetype)) {
      throw httpError(400, "Uploaded file does not match its image type");
    }
  }
}

function requestBody(req) {
  if (!req.is("multipart/form-data")) return req.body;
  if (typeof req.body?.product !== "string") throw httpError(400, "Product data is required");
  try {
    const value = JSON.parse(req.body.product);
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value;
  } catch { throw httpError(400, "Product data must be valid JSON"); }
}

function multipartProduct(req, files) {
  const body = requestBody(req);
  if (!req.is("multipart/form-data")) return { body, altTexts: [] };
  const product = { ...body };
  const raw = product.newImageAlts;
  delete product.newImageAlts;
  if (raw === undefined) return { body: product, altTexts: files.map(() => "") };
  if (!Array.isArray(raw) || raw.length !== files.length) throw httpError(400, "New image alt text must match the selected files");
  const altTexts = raw.map((alt) => {
    if (typeof alt !== "string" || alt.trim().length > 200) throw httpError(400, "Image alt text must be at most 200 characters");
    return alt.trim();
  });
  return { body: product, altTexts };
}

function presentProduct(value, warnings = []) {
  const product = value?.toObject ? value.toObject() : { ...value };
  delete product.reviewVersion;
  product.reviewCount = product.reviewCount || 0;
  if (!product.reviewCount) product.rating = 0;
  product.images = normalizeImageList(Array.isArray(product.images) ? product.images : []);
  if (warnings.length) product.warnings = [...new Set(warnings)];
  return product;
}
function productData(body, partial = false) {
  allowFields(body, FIELDS);
  const out = {};
  for (const [field, max] of [["title", 160], ["description", 10000], ["category", 100], ["slug", 180]]) {
    if (body[field] !== undefined || !partial) out[field] = text(body[field], field, { max });
  }
  if (body.flavor !== undefined) {
    if (typeof body.flavor !== "string" || body.flavor.trim().length > 100) throw httpError(400, "Invalid flavor");
    out.flavor = body.flavor.trim();
  }
  if (out.slug) {
    out.slug = out.slug.toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(out.slug)) throw httpError(400, "Slug must contain lowercase letters, numbers and hyphens");
  }
  if (body.price !== undefined || !partial) out.price = number(body.price, "Price", { min: 0.01 });
  if (out.price !== undefined && Math.abs(out.price * 100 - Math.round(out.price * 100)) > 0.00001) throw httpError(400, "Price supports at most two decimal places");
  if (body.stock !== undefined) out.stock = number(body.stock, "Stock", { integer: true });
  if (body.status !== undefined) {
    if (!["active", "draft", "archived"].includes(body.status)) throw httpError(400, "Invalid product status");
    out.status = body.status;
  }
  if (body.featured !== undefined) {
    if (typeof body.featured !== "boolean") throw httpError(400, "Featured must be a boolean");
    out.featured = body.featured;
  }
  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags) || body.tags.length > 20) throw httpError(400, "Invalid tags");
    out.tags = [...new Set(body.tags.map((value) => text(value, "tags", { max: 50 })))];
  }
  if (body.images !== undefined) out.images = normalizeImageList(body.images);
  if (partial && !Object.keys(out).length) throw httpError(400, "At least one product field is required");
  return out;
}
const createProduct = asyncHandler(async (req, res) => {
  const files = req.files || [];
  let uploaded = [];
  let saved = false;
  try {
    const { body, altTexts } = multipartProduct(req, files);
    const data = productData(body);
    await validateUploadedFiles(files);
    uploaded = await media.uploadFiles(files, altTexts);
    data.images = normalizeImageList([...(data.images || []), ...uploaded]);
    const product = await Product.create(data);
    saved = true;
    res.status(201).json(presentProduct(product));
  } catch (error) {
    if (!saved && uploaded.length) await media.rollback(uploaded);
    throw error;
  } finally { await removeTempFiles(files); }
});
function validImageSignature(buffer, mime) {
  if (mime === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mime === "image/jpeg") return buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
  if (mime === "image/gif") return ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString());
  if (mime === "image/webp") return buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP";
  return false;
}
const uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.file) throw httpError(400, "Image file is required");
  try {
    const handle = await fs.open(req.file.path, "r");
    let header;
    try { header = Buffer.alloc(12); await handle.read(header, 0, 12, 0); } finally { await handle.close(); }
    if (!validImageSignature(header, req.file.mimetype)) throw httpError(400, "Uploaded file does not match its image type");
    const result = await uploadImage(req.file.path);
    res.status(201).json({ url: result.secure_url, publicId: result.public_id, alt: "" });
  } finally { await fs.unlink(req.file.path).catch(() => {}); }
});
function visibility(req) {
  if (req.query.all !== undefined && !["true", "false"].includes(req.query.all)) throw httpError(400, "all must be true or false");
  if (req.query.all === "true") {
    if (req.user?.role !== "admin") throw httpError(403, "Admin access required");
    return {};
  }
  return { status: "active" };
}
const getProducts = asyncHandler(async (req, res) => {
  allowFields(req.query, ["category", "tag", "search", "all", "slug", "sort", "page", "limit", "minPrice", "maxPrice", "featured"]);
  const base = visibility(req);
  const filter = { ...base };
  for (const field of ["category", "slug"]) if (req.query[field] !== undefined) filter[field] = text(req.query[field], field, { max: 200 });
  if (req.query.tag !== undefined) filter.tags = text(req.query.tag, "tag", { max: 50 });
  if (req.query.search !== undefined) {
    const pattern = new RegExp(escapeRegex(text(req.query.search, "search", { max: 100 })), "i");
    filter.$or = [{ title: pattern }, { description: pattern }, { flavor: pattern }, { category: pattern }, { tags: pattern }];
  }
  for (const [key, operator] of [["minPrice", "$gte"], ["maxPrice", "$lte"]]) {
    if (req.query[key] === undefined) continue;
    if (typeof req.query[key] !== "string" || !/^\d+(?:\.\d{1,2})?$/.test(req.query[key])) throw httpError(400, "Invalid price filter");
    filter.price = { ...filter.price, [operator]: number(Number(req.query[key]), key) };
  }
  if (filter.price?.$gte > filter.price?.$lte) throw httpError(400, "Minimum price cannot exceed maximum price");
  if (req.query.featured !== undefined) {
    if (!["true", "false"].includes(req.query.featured)) throw httpError(400, "featured must be true or false");
    filter.featured = req.query.featured === "true";
  }
  const sorts = { newest: { createdAt: -1, _id: -1 }, "price-asc": { price: 1, _id: 1 }, "price-desc": { price: -1, _id: -1 }, title: { title: 1, _id: 1 }, rating: { rating: -1, _id: -1 } };
  const sort = req.query.sort === undefined ? sorts.newest : sorts[req.query.sort];
  if (!sort) throw httpError(400, "Invalid product sorting");
  const { page, limit, skip } = pagination(req.query, 12);
  const [items, total, categories] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
    Product.aggregate([{ $match: base }, { $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { _id: 1 } }, { $project: { _id: 0, name: "$_id", count: 1 } }]),
  ]);
  res.json(envelope(items.map((item) => presentProduct(item)), total, page, limit, { categories }));
});
const getProductById = asyncHandler(async (req, res) => {
  objectId(req.params.id, "Product identifier");
  const filter = { _id: req.params.id, ...(req.user?.role === "admin" ? {} : { status: "active" }) };
  const product = await Product.findOne(filter).lean();
  if (!product) throw httpError(404, "Product not found");
  res.json(presentProduct(product));
});
const getProductBySlug = asyncHandler(async (req, res) => {
  const slug = text(req.params.slug, "Slug", { max: 200 });
  const product = await Product.findOne({ slug, ...(req.user?.role === "admin" ? {} : { status: "active" }) }).lean();
  if (!product) throw httpError(404, "Product not found");
  res.json(presentProduct(product));
});
const updateProduct = asyncHandler(async (req, res) => {
  const files = req.files || [];
  let uploaded = [];
  let saved = false;
  try {
    objectId(req.params.id, "Product identifier");
    const existing = await Product.findById(req.params.id);
    if (!existing) throw httpError(404, "Product not found");
    const { body, altTexts } = multipartProduct(req, files);
    const data = productData(body, true);
    await validateUploadedFiles(files);
    uploaded = await media.uploadFiles(files, altTexts);
    const previous = normalizeImageList(existing.images || []);
    if (data.images !== undefined || uploaded.length) data.images = normalizeImageList([...(data.images || previous), ...uploaded]);
    const product = await Product.findByIdAndUpdate(req.params.id, { $set: data }, { new: true, runValidators: true });
    if (!product) throw httpError(404, "Product not found");
    saved = true;
    const retained = new Set(normalizeImageList(product.images || []).map((image) => image.publicId || image.url));
    const removed = previous.filter((image) => !retained.has(image.publicId || image.url));
    const warnings = await media.cleanupUnreferenced(removed, product._id);
    res.json(presentProduct(product, warnings));
  } catch (error) {
    if (!saved && uploaded.length) await media.rollback(uploaded);
    throw error;
  } finally { await removeTempFiles(files); }
});
const deleteProduct = asyncHandler(async (req, res) => {
  objectId(req.params.id, "Product identifier");
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw httpError(404, "Product not found");
  const warnings = await media.cleanupUnreferenced(product.images || [], product._id);
  res.json({ message: "Product removed", ...(warnings.length ? { warnings: [...new Set(warnings)] } : {}) });
});
module.exports = { createProduct, uploadProductImage, getProducts, getProductById, getProductBySlug, updateProduct, deleteProduct };

