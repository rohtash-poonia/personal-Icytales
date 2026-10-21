"use client";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {useRef,useState} from "react";
import {useForm} from "react-hook-form";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import {useCart} from "@/components/context/CartContext";
import {useAuth} from "@/components/context/AuthContext";
import {createOrder,quoteOrder} from "@/lib/api";
import {checkoutPayload} from "@/lib/commerce.mjs";

const money=value=>`$${Number(value).toFixed(2)}`;
export default function Form() {
  const router=useRouter();
  const {cartItems,clearCart,subtotal,hydrated}=useCart();
  const {user,loading,sessionError}=useAuth();
  const [error,setError]=useState("");
  const [quote,setQuote]=useState(null);
  const quoteFingerprint=useRef("");
  const submission=useRef(null);
  const {register,handleSubmit,watch,formState:{errors,isSubmitting}}=useForm({defaultValues:{country:"India"}});
  // eslint-disable-next-line react-hooks/incompatible-library
  const values=watch();
  const fingerprint=JSON.stringify({user:user?.id,items:cartItems.map(item=>({id:item.id,qty:item.qty,variants:item.variants})),address:values});
  const quoteCurrent=quote && quoteFingerprint.current===fingerprint;
  const onSubmit=async data=>{
    setError("");
    if(!user){router.push("/login?returnTo=%2Fcheckout");return;}
    try {
      const payload=checkoutPayload(cartItems,data);
      if(!quoteCurrent) {
        const result=await quoteOrder(payload);
        quoteFingerprint.current=fingerprint;setQuote(result);
        return;
      }
      const signature=JSON.stringify({user:user.id,...payload});
      let saved=submission.current;
      if(!saved || saved.signature!==signature) {
        try {saved=JSON.parse(sessionStorage.getItem("icytales_checkout_attempt") || "null");} catch {}
        if(saved?.signature!==signature || !/^[a-zA-Z0-9_-]{8,128}$/.test(saved?.key || "")) {
          saved={signature,key:crypto.randomUUID()};
        }
        submission.current=saved;
        try {sessionStorage.setItem("icytales_checkout_attempt",JSON.stringify(saved));} catch {}
      }
      const order=await createOrder(payload,{idempotencyKey:saved.key});
      if(!order?._id)throw new Error("The server did not return an order confirmation. Your cart is saved; retry to check this order.");
      clearCart();
      submission.current=null;
      try {sessionStorage.removeItem("icytales_checkout_attempt");} catch {}
      router.push(`/orders/${encodeURIComponent(order._id)}?placed=1`);
    } catch(err) {
      setError(err.message || "Unable to place this order. Your cart is saved.");
      if(err.status===401)router.push("/login?returnTo=%2Fcheckout");
      if(err.status===409 || err.status===422){setQuote(null);quoteFingerprint.current="";}
    }
  };
  if(loading || !hydrated)return <p role="status" className="py-20 text-center">Loading checkout…</p>;
  if(!user)return <section className="container py-20 text-center"><h1 className="text-3xl font-bold">Sign in to checkout</h1>{sessionError && <p role="alert" className="mt-4">{sessionError}</p>}<Link className="inline-block mt-6 text-pink underline" href="/login?returnTo=%2Fcheckout">Sign in and return to checkout</Link></section>;
  if(!cartItems.length)return <section className="container py-20 text-center"><h1 className="text-3xl font-bold">Your cart is empty</h1><Link href="/shop" className="inline-block mt-6 text-pink underline">Browse products</Link></section>;
  return <div className="min-h-screen bg-gradient-to-br from-[#F8F6FB] via-[#FCF7FF] to-[#FFF0F9] py-10 px-4 sm:px-6 lg:px-8">
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 xl:flex-row">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full rounded-[32px] border border-[#F0E3F4] bg-white p-6 xl:p-10 shadow-sm">
        <h1 className="text-[34px] font-bold text-[#0F0200]">Complete your order</h1>
        <section className="mt-8 rounded-[32px] border border-[#E9DFEE] bg-[#FCF7FF] p-6">
          <h2 className="text-2xl font-bold mb-6">Shipping address</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <Input label="Full name" autoComplete="name" {...register("fullName",{required:"Full name is required",maxLength:{value:100,message:"Use at most 100 characters"},validate:value=>value.trim().length>0 || "Full name is required"})} error={errors.fullName?.message}/>
            <Input label="Phone (optional)" type="tel" autoComplete="tel" {...register("phone",{maxLength:{value:25,message:"Use at most 25 characters"}})} error={errors.phone?.message}/>
            <div className="md:col-span-2"><Input label="Street address" autoComplete="street-address" {...register("address",{required:"Street address is required",maxLength:{value:200,message:"Use at most 200 characters"},validate:value=>value.trim().length>0 || "Street address is required"})} error={errors.address?.message}/></div>
            <Input label="City" autoComplete="address-level2" {...register("city",{required:"City is required",maxLength:100,validate:value=>value.trim().length>0 || "City is required"})} error={errors.city?.message}/>
            <Input label="Postal code" autoComplete="postal-code" {...register("postalCode",{required:"Postal code is required",maxLength:20,validate:value=>value.trim().length>0 || "Postal code is required"})} error={errors.postalCode?.message}/>
            <Input label="Country" autoComplete="country-name" {...register("country",{required:"Country is required",maxLength:100,validate:value=>value.trim().length>0 || "Country is required"})} error={errors.country?.message}/>
          </div>
        </section>
        <section className="mt-8 rounded-[32px] border border-[#E9DFEE] bg-[#FCF7FF] p-6">
          <h2 className="text-2xl font-bold">Payment method</h2><p className="font-semibold mt-4">Cash on delivery</p><p className="text-sm text-gray-600 mt-2">Pay when your order arrives. Online payments are currently unavailable.</p>
        </section>
        {error && <p role="alert" className="text-red-700 mt-6">{error}</p>}
        {quoteCurrent && <p role="status" className="text-sm mt-6">Review the confirmed total, then place your order.</p>}
        <Button type="submit" theme="primary" width="w-full sm:w-[320px]" height="h-[62px]" className="mt-6" loading={isSubmitting} disabled={isSubmitting}>{isSubmitting ? "Processing…" : quoteCurrent ? "Place order — cash on delivery" : "Review order total"}</Button>
      </form>
      <aside className="w-full xl:max-w-[400px] rounded-[32px] bg-white p-6 shadow-sm xl:self-start">
        <h2 className="text-2xl font-bold">Order summary</h2>
        <div className="space-y-4 mt-6">{cartItems.map(item=><div key={item.key} className="rounded-[24px] border border-[#ECE4F0] bg-[#FFF5F9] p-5"><p className="font-semibold">{item.name} × {item.qty}</p><p className="text-sm text-gray-600">Estimated item total: {money(item.price*item.qty)}</p></div>)}</div>
        <dl className="mt-6 space-y-3">
          <div className="flex justify-between"><dt>{quoteCurrent ? "Items" : "Estimated items"}</dt><dd>{money(quoteCurrent ? quote.itemsPrice : subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Shipping</dt><dd>{quoteCurrent ? money(quote.shippingPrice) : "Calculated after address"}</dd></div>
          <div className="flex justify-between font-bold text-pink text-xl"><dt>Total</dt><dd>{quoteCurrent ? money(quote.totalPrice) : "Review to calculate"}</dd></div>
        </dl>
        <p className="text-sm text-gray-600 mt-6">Prices and availability are checked by the server. Your order is confirmed only after it is saved.</p>
        <Link href="/cart" className="inline-block text-pink underline mt-4">Edit cart</Link>
      </aside>
    </div>
  </div>;
}
