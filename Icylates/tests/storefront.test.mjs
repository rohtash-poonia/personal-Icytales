import test from "node:test";
import assert from "node:assert/strict";
import * as api from "../src/lib/api.js";
const model = await import("../src/lib/commerce.mjs").catch(() => ({}));
const product = { _id: "507f1f77bcf86cd799439011", title: "Vanilla", price: 4.5, images: ["/vanilla.png"], stock: 5 };
test("normalizes Mongo products and legacy cart data without splitting string images", () => {
  assert.equal(typeof model.normalizeProduct, "function");
  const p = model.normalizeProduct(product);
  assert.equal(p.id, product._id); assert.equal(p.name, "Vanilla"); assert.equal(p.image, "/vanilla.png");
  assert.equal(model.normalizeProduct({id: "old", name: "Old", image: "/a.png", price: 3}).image, "/a.png");
});
test("normalizes structured product image records for storefront display", () => {
  const p = model.normalizeProduct({
    ...product,
    images: [{url:"https://cdn.test/vanilla.png",publicId:"icytales/products/vanilla",alt:"Vanilla cone"}],
  });
  assert.deepEqual(p.images,["https://cdn.test/vanilla.png"]);
  assert.equal(p.image,"https://cdn.test/vanilla.png");
  assert.equal(p.imageRecords[0].alt,"Vanilla cone");
});
test("corrupt or invalid persisted cart entries are discarded", () => {
  assert.equal(typeof model.parseStoredCart, "function");
  assert.deepEqual(model.parseStoredCart("{bad"), []);
  assert.deepEqual(model.parseStoredCart('{"qty":2}'), []);
  assert.equal(model.parseStoredCart(JSON.stringify([{...product, qty:2}, {id:"x", price:-1,qty:3}, {id:"x", price:3,qty:"oops"}])).length, 1);
});
test("cart add merges matching products but preserves variants and clamps stock", () => {
  assert.equal(typeof model.addCartItem, "function");
  let cart = model.addCartItem([], product, 2);
  cart = model.addCartItem(cart, product, 10);
  assert.equal(cart.length, 1); assert.equal(cart[0].qty, 5);
  cart = model.addCartItem(cart, {...product, variants:{size:"large"}}, 1);
  assert.equal(cart.length, 2);
});
test("checkout sends only product references quantities and validated shipping fields", () => {
  assert.equal(typeof model.checkoutPayload, "function");
  const payload = model.checkoutPayload([{...product, id:product._id, qty:2}], {fullName:" Ada ",address:" 1 Road ",city:"Town",postalCode:"12345",country:"India",phone:""});
  assert.deepEqual(payload.items,[{product:product._id,quantity:2}]);
  assert.equal(payload.shippingAddress.fullName,"Ada"); assert.equal(payload.paymentMethod,"cod");
  assert.equal("totalPrice" in payload,false); assert.throws(()=>model.checkoutPayload([{id:"demo",qty:1}],{}));
});
test("return URLs allow local paths and reject external redirects", () => {
  assert.equal(typeof model.safeReturnTo, "function");
  assert.equal(model.safeReturnTo("/checkout"),"/checkout");
  for(const value of ["//evil.com","https://evil.com","/\\evil.com","/login","/register","/%5cevil.com"]) assert.equal(model.safeReturnTo(value),"/");
});
test("API mutations fetch CSRF and send cookies for JSON and uploads", async () => {
  const original = global.fetch; const calls=[];
  global.fetch = async (url, options={}) => {calls.push({url,options});return Response.json(url.endsWith("/csrf")?{csrfToken:"test-token"}:{ok:true});};
  try {
    await api.loginUser({email:"a@b.test",password:"test"});
    const mutation=calls.find(c=>c.url.endsWith("/login"));
    assert.ok(calls.some(c=>c.url.endsWith("/csrf"))); assert.equal(mutation.options.credentials,"include");
    assert.equal(new Headers(mutation.options.headers).get("X-CSRF-Token"),"test-token");
    await api.uploadProductImageApi(new FormData());
    const upload=calls.at(-1); assert.equal(upload.options.credentials,"include");
    assert.equal(new Headers(upload.options.headers).has("Content-Type"),false);
    assert.equal(new Headers(upload.options.headers).get("X-CSRF-Token"),"test-token");
  } finally {global.fetch=original;}
});
test("API errors preserve status and validation code without loopback fallback", async () => {
  const original=global.fetch;let requested;
  global.fetch=async url=>{requested=url;return Response.json({message:"Denied",code:"AUTH_REQUIRED"},{status:401});};
  try {
    await assert.rejects(api.getProducts(),e=>e.status===401&&e.code==="AUTH_REQUIRED");
    assert.equal(requested.startsWith("http://localhost"),false);
  } finally {global.fetch=original;}
});
test("API forwards pagination filters and cancellation", async () => {
  const original=global.fetch;let call;const controller=new AbortController();
  global.fetch=async (url,options)=>{call={url,options};return Response.json({items:[],pagination:{total:0}});};
  try {
    await api.getProducts({page:2,limit:6,sort:"price-asc",minPrice:0,maxPrice:10,signal:controller.signal});
    const params=new URL(call.url,"https://example.test").searchParams;
    assert.equal(params.get("page"),"2"); assert.equal(params.get("minPrice"),"0");
    assert.equal(call.options.signal,controller.signal);
  } finally {global.fetch=original;}
});
