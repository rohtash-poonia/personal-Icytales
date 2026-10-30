const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://personal-icytales.onrender.com"
    : "")
).replace(/\/$/, "");
import {
  getFallbackProduct,
  getFallbackProducts,
} from "@/data/fallbackProducts";
let csrfToken;
let csrfPromise;

export class ApiError extends Error {
  constructor(message, status, payload = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = payload.code;
    this.details = payload.errors;
  }
}

async function handleResponse(response) {
  const payload =
    response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok)
    throw new ApiError(
      payload?.message || "The request could not be completed.",
      response.status,
      payload || {},
    );
  if (payload === null && response.status !== 204)
    throw new ApiError(
      "The server returned an invalid response.",
      response.status,
    );
  return payload;
}

async function getCsrfToken() {
  if (csrfToken) return csrfToken;
  if (!csrfPromise) {
    csrfPromise = fetch(`${API_URL}/api/auth/csrf`, {
      credentials: "include",
      cache: "no-store",
    })
      .then(handleResponse)
      .then((data) => {
        if (!data?.csrfToken)
          throw new Error("Unable to initialize a secure session.");
        csrfToken = data.csrfToken;
        return csrfToken;
      })
      .finally(() => {
        csrfPromise = null;
      });
  }
  return csrfPromise;
}

export async function request(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const mutation = !["GET", "HEAD", "OPTIONS"].includes(method);
  const headers = new Headers(options.headers);
  const isForm =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  if (options.body && !isForm && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  const run = async () => {
    if (mutation) headers.set("X-CSRF-Token", await getCsrfToken());
    return handleResponse(
      await fetch(`${API_URL}${path}`, {
        ...options,
        method,
        headers,
        credentials: "include",
        cache: "no-store",
      }),
    );
  };
  try {
    return await run();
  } catch (error) {
    if (mutation && error.status === 403 && error.code === "CSRF_INVALID") {
      csrfToken = undefined;
      return run();
    }
    throw error;
  }
}
export async function requestWithProgress(
  path,
  { method = "POST", body, onProgress } = {},
) {
  const run = async () => {
    const token = await getCsrfToken();
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, `${API_URL}${path}`);
      xhr.withCredentials = true;
      xhr.setRequestHeader("X-CSRF-Token", token);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable)
          onProgress?.(Math.round((event.loaded / event.total) * 100));
      };
      xhr.onerror = () =>
        reject(new ApiError("The upload could not reach the server.", 0));
      xhr.onload = () => {
        let payload = null;
        try {
          payload = xhr.responseText ? JSON.parse(xhr.responseText) : null;
        } catch {}
        if (xhr.status >= 200 && xhr.status < 300) return resolve(payload);
        reject(
          new ApiError(
            payload?.message || "The request could not be completed.",
            xhr.status,
            payload || {},
          ),
        );
      };
      xhr.send(body);
    });
  };
  try {
    return await run();
  } catch (error) {
    if (error.status === 403 && error.code === "CSRF_INVALID") {
      csrfToken = undefined;
      return run();
    }
    throw error;
  }
}
export function productFormData(payload, files = []) {
  const body = new FormData();
  body.append("product", JSON.stringify(payload));
  files.forEach((file) => body.append("images", file));
  return body;
}
function queryPath(path, { signal, ...params } = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "all"
    )
      search.set(key, String(value));
  });
  return [`${path}${search.size ? `?${search}` : ""}`, { signal }];
}
const list = (path, filters) => request(...queryPath(path, filters));
const json = (path, method, payload, options = {}) =>
  request(path, {
    ...options,
    method,
    ...(payload !== undefined ? { body: JSON.stringify(payload) } : {}),
  });
const idPath = (path, id) => `${path}/${encodeURIComponent(id)}`;
export const registerUser = (payload) =>
  json("/api/auth/register", "POST", payload);
export const loginUser = (payload) => json("/api/auth/login", "POST", payload);
export const loginAdmin = (payload) =>
  json("/api/auth/admin/login", "POST", payload);
export const updateProfile = (payload) =>
  json("/api/auth/me", "PATCH", payload);
export const logoutUser = () => json("/api/auth/logout", "POST");
export const getCurrentUser = (options) => request("/api/auth/me", options);
export const getProducts = (filters) =>
  API_URL
    ? list("/api/products", filters)
    : Promise.resolve(getFallbackProducts(filters));
export const getProductById = (id, options) =>
  API_URL
    ? request(idPath("/api/products", id), options)
    : Promise.resolve(getFallbackProduct(id));
export const getProductBySlug = (slug, options) =>
  API_URL
    ? request(idPath("/api/products/slug", slug), options)
    : Promise.resolve(getFallbackProduct(slug));
export const createOrder = (payload, { idempotencyKey, ...options } = {}) =>
  json("/api/orders", "POST", payload, {
    ...options,
    headers: { ...options.headers, "Idempotency-Key": idempotencyKey },
  });
export const getOrders = (filters) => list("/api/orders", filters);
export const getOrderById = (id, options) =>
  request(idPath("/api/orders", id), options);
export const getUsers = (filters) => list("/api/users", filters);
export const getAdminOrders = (filters) => getOrders(filters);
export const getDashboardStats = (options) =>
  request("/api/admin/stats", options);
export const updateOrderStatus = (id, status) =>
  json(`${idPath("/api/orders", id)}/status`, "PUT", { orderStatus: status });
export const deleteOrder = (id) => json(idPath("/api/orders", id), "DELETE");
export const getAdminProducts = (filters) =>
  list("/api/products", { ...filters, all: true });
export const createProduct = (payload, { files = [], onProgress } = {}) =>
  files.length
    ? requestWithProgress("/api/products", {
        method: "POST",
        body: productFormData(payload, files),
        onProgress,
      })
    : json("/api/products", "POST", payload);
export const updateProduct = (id, payload, { files = [], onProgress } = {}) =>
  files.length
    ? requestWithProgress(idPath("/api/products", id), {
        method: "PUT",
        body: productFormData(payload, files),
        onProgress,
      })
    : json(idPath("/api/products", id), "PUT", payload);
export const deleteProduct = (id) =>
  json(idPath("/api/products", id), "DELETE");
export const uploadProductImageApi = (formData) =>
  request("/api/products/upload", { method: "POST", body: formData });
export const deleteUser = (id) => json(idPath("/api/users", id), "DELETE");
export const blockUser = (id, isBlocked) =>
  json(`${idPath("/api/users", id)}/block`, "PATCH", { isBlocked });

export const quoteOrder = (payload) =>
  json("/api/orders/quote", "POST", payload);
export const collectCash = (id) =>
  json(`${idPath("/api/orders", id)}/collect-cash`, "POST", {
    confirmed: true,
  });

export const submitContact = (payload) =>
  json("/api/content/contact", "POST", payload);
export const subscribeNewsletter = (payload) =>
  json("/api/content/newsletter", "POST", payload);
export const getContactMessages = (filters) =>
  list("/api/content/messages", filters);
export const getWishlist = (options) => request("/api/wishlist", options);
export const saveWishlistProduct = (id) =>
  json(idPath("/api/wishlist", id), "PUT", {});
export const removeWishlistProduct = (id) =>
  json(idPath("/api/wishlist", id), "DELETE", {});
export const getReviews = (id, filters) =>
  list(`${idPath("/api/products", id)}/reviews`, filters);
export const createReview = (id, payload) =>
  json(`${idPath("/api/products", id)}/reviews`, "POST", payload);
export const updateReview = (id, payload) =>
  json(`${idPath("/api/products", id)}/reviews/me`, "PATCH", payload);
export const deleteReview = (id) =>
  json(`${idPath("/api/products", id)}/reviews/me`, "DELETE", {});
