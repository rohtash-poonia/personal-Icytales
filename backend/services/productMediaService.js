const { httpError } = require("../utils/validation");

const HTTPS_URL = /^https:\/\//i;
const LOCAL_URL = /^\/(?!\/)/;
const PUBLIC_ID = /^[A-Za-z0-9_./-]{1,255}$/;

function normalizeImageRecord(value) {
  const input = typeof value === "string" ? { url: value } : value;
  if (!input || typeof input !== "object" || Array.isArray(input)) throw httpError(400, "Invalid product image");
  const url = typeof input.url === "string" ? input.url.trim() : "";
  if (!url || (!HTTPS_URL.test(url) && !LOCAL_URL.test(url))) throw httpError(400, "Images must use HTTPS URLs or local asset paths");
  const publicId = input.publicId == null || input.publicId === "" ? null : String(input.publicId).trim();
  if (publicId && !PUBLIC_ID.test(publicId)) throw httpError(400, "Invalid image public identifier");
  const alt = input.alt == null ? "" : String(input.alt).trim();
  if (alt.length > 200) throw httpError(400, "Image alt text must be at most 200 characters");
  return { url, publicId, alt };
}

function normalizeImageList(values) {
  if (!Array.isArray(values) || values.length > 10) throw httpError(400, "Products support at most 10 images");
  const unique = new Map();
  for (const value of values) {
    const image = normalizeImageRecord(value);
    const key = image.publicId || image.url;
    if (!unique.has(key)) unique.set(key, image);
  }
  return [...unique.values()];
}

function createProductMediaService({ Product, uploadImage, destroyImage }) {
  async function rollback(images) {
    await Promise.allSettled(images.filter((image) => image.publicId).map((image) => destroyImage(image.publicId)));
  }

  async function uploadFiles(files = [], altTexts = []) {
    const uploaded = [];
    try {
      for (const [index, file] of files.entries()) {
        const result = await uploadImage(file.path);
        uploaded.push(normalizeImageRecord({ url: result.secure_url, publicId: result.public_id, alt: altTexts[index] || "" }));
      }
      return uploaded;
    } catch (error) {
      await rollback(uploaded);
      throw error;
    }
  }

  async function cleanupUnreferenced(images) {
    const warnings = [];
    const candidates = new Map();
    for (const value of images || []) {
      const image = normalizeImageRecord(value);
      if (image.publicId && !candidates.has(image.publicId)) candidates.set(image.publicId, image);
    }
    for (const [publicId, image] of candidates) {
      const query = { $or: [
        { "images.publicId": publicId },
        { "images.url": image.url },
        { images: image.url },
      ] };
      // Saves/deletes finish before cleanup. Include every remaining document,
      // including a saved product retaining the same URL without its publicId.
      try {
        // If reference lookup fails, retain the asset and report cleanup as pending.
        if (await Product.exists(query)) continue;
        await destroyImage(publicId);
      }
      catch { warnings.push("One image could not be removed from storage."); }
    }
    return warnings;
  }

  return { uploadFiles, rollback, cleanupUnreferenced };
}

module.exports = { normalizeImageRecord, normalizeImageList, createProductMediaService };
