const { httpError } = require("../utils/validation");
function isProduction(env = process.env) {
  return env.NODE_ENV === "production" || env.RENDER === "true";
}
function normalizeOrigin(origin) {
  try {
    const url = new URL(origin);
    if (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash
    )
      return url.origin;
  } catch {}
  return origin;
}
function getOrigins(env = process.env) {
  const production = isProduction(env);
  const value = env.CLIENT_ORIGINS || env.FRONTEND_URL || env.CLIENT_URL;
  const configuredOrigins = value
    ? value.split(",").map((origin) => origin.trim()).filter(Boolean)
    : production
      ? []
      : ["http://localhost:3000", "http://localhost:3001"];
  const origins = configuredOrigins
    .map(normalizeOrigin)
    .filter((origin) => {
      if (!production) return true;
      try {
        return new URL(origin).protocol !== "http:";
      } catch {
        return true;
      }
    });
  origins.push("https://personal-icytales.vercel.app");
  return [...new Set(origins)];
}
function validateEnv(env = process.env) {
  const errors = [];
  if (!env.MONGO_URI || !/^mongodb(\+srv)?:\/\//.test(env.MONGO_URI))
    errors.push("MONGO_URI must be a MongoDB connection string");
  if (
    !env.JWT_SECRET ||
    Buffer.byteLength(env.JWT_SECRET) < 32 ||
    /^(change|replace|your[-_ ]|secret|example|placeholder)/i.test(
      env.JWT_SECRET,
    )
  ) {
    errors.push(
      "JWT_SECRET must be a random signing secret of at least 32 bytes",
    );
  }
  const origins = getOrigins(env);
  if (!origins.length) errors.push("CLIENT_ORIGINS is required in production");
  for (const origin of origins) {
    try {
      const url = new URL(origin);
      if (
        url.origin !== origin ||
        !["http:", "https:"].includes(url.protocol) ||
        (isProduction(env) && url.protocol !== "https:")
      )
        throw new Error();
    } catch {
      errors.push(
        "CLIENT_ORIGINS must contain exact HTTP(S) origins (HTTPS in production)",
      );
      break;
    }
  }
  if (
    env.COOKIE_SAME_SITE &&
    !["lax", "strict", "none"].includes(env.COOKIE_SAME_SITE)
  )
    errors.push("COOKIE_SAME_SITE must be lax, strict or none");
  if (env.COOKIE_SAME_SITE === "none" && !isProduction(env))
    errors.push("SameSite=none requires HTTPS production cookies");
  if (
    env.PORT &&
    (!/^\d+$/.test(env.PORT) ||
      Number(env.PORT) < 1 ||
      Number(env.PORT) > 65535)
  )
    errors.push("PORT must be between 1 and 65535");
  if (env.TRUST_PROXY && !["0", "1"].includes(env.TRUST_PROXY))
    errors.push("TRUST_PROXY must be 0 or 1");
  if (env.STORE_CURRENCY && !/^[A-Z]{3}$/.test(env.STORE_CURRENCY))
    errors.push("STORE_CURRENCY must contain three uppercase letters");
  const cloudinary = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];
  if (
    cloudinary.some((key) => env[key]) &&
    !cloudinary.every((key) => env[key])
  )
    errors.push("Configure all three Cloudinary settings or omit all three");
  if (errors.length)
    throw httpError(500, "Invalid server configuration: " + errors.join("; "));
  return { origins, port: Number(env.PORT || 5000) };
}
function cookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction(process.env),
    sameSite:
      process.env.COOKIE_SAME_SITE ||
      (isProduction(process.env) ? "none" : "lax"),
    path: "/",
  };
}
module.exports = { getOrigins, validateEnv, cookieOptions };
