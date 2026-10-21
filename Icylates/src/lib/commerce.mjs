export const PLACEHOLDER_IMAGE = "/images/placeholder.svg";
const string = value => typeof value === "string" ? value.trim() : "";
export function normalizeProduct(product) {
  if (!product || typeof product !== "object") return null;
  const id = string(product._id) || string(product.id);
  const price = Number(product.price);
  if (!id || !Number.isFinite(price) || price < 0) return null;
  const title = string(product.name) || string(product.heading) || string(product.title);
  if (!title) return null;
  const imageRecords = (Array.isArray(product.images) ? product.images : Array.isArray(product.image) ? product.image : [product.image]).flatMap(image => {
    if (typeof image === "string" && image.trim()) return [{url:image.trim(),publicId:null,alt:""}];
    if (image && typeof image === "object" && typeof image.url === "string" && image.url.trim()) return [{url:image.url.trim(),publicId:typeof image.publicId === "string" ? image.publicId : null,alt:typeof image.alt === "string" ? image.alt : ""}];
    return [];
  });
  const images = imageRecords.map(image => image.url);
  const stock = Number.isInteger(product.stock) && product.stock >= 0 ? product.stock : null;
  const variants = {};
  if (product.variants && typeof product.variants === "object") Object.entries(product.variants).sort().forEach(([key,value]) => {
    if (typeof value === "string" && value.length <= 80 && ["size","color","flavor"].includes(key)) variants[key] = value;
  });
  return {id, _id:id, name:title, title, heading:title, slug:string(product.slug), description:string(product.description),
    category:string(product.category), flavor:string(product.flavor), imageRecords, images: images.length ? images : [PLACEHOLDER_IMAGE], image:images[0] || PLACEHOLDER_IMAGE,
    price, stock, status:string(product.status), rating:Number(product.rating ?? product.ratings) || 0, reviewCount:Number(product.reviewCount) || 0, variants};
}
export function cartKey(product) {
  return `${product.id}:${JSON.stringify(product.variants || {})}`;
}
export function parseStoredCart(raw) {
  try {
    const data = JSON.parse(raw || "[]");
    if (!Array.isArray(data)) return [];
    return data.slice(0,100).flatMap(entry => {
      const product = normalizeProduct(entry);
      const qty = Number(entry?.qty ?? entry?.quantity ?? 1);
      if (!product || !Number.isInteger(qty) || qty < 1 || qty > 999 || product.stock === 0) return [];
      return [{...product,qty:Math.min(qty,product.stock ?? 999),key:cartKey(product)}];
    });
  } catch {return [];}
}
export function addCartItem(cart, input, quantity = 1) {
  const product = normalizeProduct(input);
  if (!product || product.stock === 0 || !Number.isInteger(quantity) || quantity < 1) return cart;
  const key = cartKey(product);
  const existing = cart.find(item => (item.key || cartKey(item)) === key);
  const qty = Math.min((existing?.qty || 0)+quantity,product.stock ?? 999,999);
  const item = {...product,key,qty};
  return existing ? cart.map(value => (value.key || cartKey(value)) === key ? item : value) : [...cart,item];
}
export function checkoutPayload(cart, form) {
  if (!Array.isArray(cart) || !cart.length) throw new Error("Your cart is empty.");
  const items = cart.map(item => {
    const product = item._id || item.id;
    if (!/^[a-f0-9]{24}$/i.test(product || "") || !Number.isInteger(item.qty) || item.qty < 1 || item.qty > 999) throw new Error("Your cart contains an unavailable item. Remove it and select a current product.");
    return {product,quantity:item.qty};
  });
  const shippingAddress = {};
  for (const field of ["fullName","address","city","postalCode","country"]) {
    const value = string(form[field]);
    if (!value) throw new Error("Complete all required shipping details.");
    shippingAddress[field] = value;
  }
  if (string(form.phone)) shippingAddress.phone = string(form.phone);
  return {items,shippingAddress,paymentMethod:"cod"};
}
export function safeReturnTo(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\r\n]|%5c|%0[ad]/i.test(value)) return "/";
  const path = value.split(/[?#]/)[0];
  if (["/login","/register","/admin/login"].includes(path)) return "/";
  return value;
}
