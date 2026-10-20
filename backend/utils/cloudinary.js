const cloudinary = require("cloudinary").v2;
const { httpError } = require("./validation");
async function uploadImage(filePath) {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) throw httpError(503, "Image storage is not configured");
  cloudinary.config({ cloud_name: CLOUDINARY_CLOUD_NAME, api_key: CLOUDINARY_API_KEY, api_secret: CLOUDINARY_API_SECRET, secure: true });
  return cloudinary.uploader.upload(filePath, { folder: "icytales/products", resource_type: "image", allowed_formats: ["png", "jpg", "jpeg", "webp", "gif"], timeout: 30000 });
}
async function destroyImage(publicId) {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) throw httpError(503, "Image storage is not configured");
  cloudinary.config({ cloud_name: CLOUDINARY_CLOUD_NAME, api_key: CLOUDINARY_API_KEY, api_secret: CLOUDINARY_API_SECRET, secure: true });
  return cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
}
module.exports = { uploadImage, destroyImage };
