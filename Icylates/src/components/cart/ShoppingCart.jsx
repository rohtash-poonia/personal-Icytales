"use client";
import Link from "next/link";
import { useCart } from "@/components/context/CartContext";
import SafeImage from "@/components/common/SafeImage";
import Button from "@/components/common/Button";

const money = amount => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

export default function ShoppingCart() {
  const { cartItems, updateQty, removeItem, subtotal, hydrated } = useCart();
  if (!hydrated) return <p role="status" className="container py-20">Loading your cart...</p>;
  return (
    <section className="container py-16">
      <h1 className="text-3xl font-bold">Shopping cart</h1>
      {cartItems.length === 0 ? (
        <div className="my-8 rounded-3xl bg-pink-50 p-8">
          <p>Your cart is empty.</p>
          <Link href="/shop" className="mt-4 inline-block text-pink font-semibold underline">Browse ice cream</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <ul className="space-y-4">
            {cartItems.map(item => (
              <li key={item.key || item.id} className="flex flex-wrap items-center gap-5 rounded-3xl border border-slate-200 p-5">
                <SafeImage src={item.image} alt={item.name || item.title} width={92} height={92} className="h-24 w-24 rounded-xl object-contain" />
                <div className="min-w-40 flex-1">
                  <Link href={`/products/${item.slug || item.id}`} className="font-semibold hover:text-pink">{item.name || item.title}</Link>
                  <p className="mt-2 text-sm text-slate-600">{money(item.price)} each</p>
                  {Object.values(item.variants || {}).length > 0 && <p className="text-sm text-slate-600">{Object.values(item.variants).join(" / ")}</p>}
                </div>
                <label className="flex flex-col gap-1 text-sm">Quantity
                  <input aria-label={`Quantity for ${item.name || item.title}`} type="number" min="1" max={Math.min(item.stock ?? 100, 100)} value={item.qty} onChange={event => updateQty(item.key || item.id, Number(event.target.value))} className="w-20 rounded-xl border border-slate-300 p-2" />
                </label>
                <span className="font-semibold">{money(item.price * item.qty)}</span>
                <button type="button" onClick={() => removeItem(item.key || item.id)} aria-label={`Remove ${item.name || item.title}`} className="rounded-full border border-red-300 px-3 py-2 text-red-700">Remove</button>
              </li>
            ))}
          </ul>
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold">Order summary</h2>
            <div className="mt-5 flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <p className="mt-4 text-sm text-slate-600">Shipping and the final total are confirmed at checkout using current product prices.</p>
            <Link href="/checkout" className="mt-6 block rounded-full bg-pink px-5 py-3 text-center font-semibold text-white">Proceed to checkout</Link>
          </aside>
        </div>
      )}
      <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
        <Button as={Link} href="/shop" className="font-semibold text-darkpurple underline">Continue shopping</Button>
        <Button as={Link} href="/wishlist" theme="primary" className="px-6 py-3">Check Wishlist</Button>
      </div>
    </section>
  );
}
