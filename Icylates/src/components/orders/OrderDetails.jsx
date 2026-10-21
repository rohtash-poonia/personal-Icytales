"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useAuth} from "@/components/context/AuthContext";
import {getOrderById} from "@/lib/api";
import ProductReviews from "@/components/details-page/ProductReviews";
export default function OrderDetails({id}){
  const {user,loading}=useAuth();
  const [state,setState]=useState({order:null,loading:true,error:""});
  const [attempt,setAttempt]=useState(0);
  const [reviewProduct,setReviewProduct]=useState("");
  useEffect(()=>{
    if(!user)return;
    const controller=new AbortController();
    getOrderById(id,{signal:controller.signal}).then(order=>setState({order,loading:false,error:""})).catch(error=>{if(error.name!=="AbortError")setState({order:null,loading:false,error:error.message});});
    return ()=>controller.abort();
  },[id,user,attempt]);
  if(loading)return <p role="status" className="container py-16">Loading session…</p>;
  if(!user)return <div className="container py-16"><h1 className="text-3xl font-bold">Order details</h1><Link href={`/login?returnTo=${encodeURIComponent("/orders/"+id)}`} className="text-pink underline">Sign in to view this order</Link></div>;
  if(state.loading)return <p role="status" className="container py-16">Loading order…</p>;
  if(state.error)return <div role="alert" className="container py-16"><p>{state.error}</p><button onClick={()=>{setState(current=>({...current,loading:true}));setAttempt(value=>value+1);}} className="text-pink underline">Try again</button></div>;
  const order=state.order;
  return <section className="container py-16"><h1 className="text-3xl font-bold">Order confirmation</h1><p className="mt-4 break-all">Order {order._id}</p><p className="mt-2">Status: {order.orderStatus} · Payment: {order.paymentStatus}</p><p>{order.paymentMethod==="cod" ? "Cash on delivery" : order.paymentMethod}</p>
    <h2 className="text-xl font-bold mt-8">Items</h2><ul className="mt-4 space-y-3">{order.items.map((item,index)=><li key={index} className="flex justify-between gap-4 border-b border-gray-200 py-3"><span>{item.name} × {item.quantity}</span><span>${(item.price*item.quantity).toFixed(2)}</span></li>)}</ul>
    <dl className="mt-5 space-y-2"><div className="flex justify-between"><dt>Items</dt><dd>${Number(order.itemsPrice).toFixed(2)}</dd></div><div className="flex justify-between"><dt>Shipping</dt><dd>${Number(order.shippingPrice).toFixed(2)}</dd></div><div className="flex justify-between font-bold"><dt>Total</dt><dd>${Number(order.totalPrice).toFixed(2)}</dd></div></dl>
    <h2 className="text-xl font-bold mt-8">Shipping address</h2><address className="not-italic mt-4">{order.shippingAddress.fullName}<br/>{order.shippingAddress.address}<br/>{order.shippingAddress.city}, {order.shippingAddress.postalCode}<br/>{order.shippingAddress.country}</address>
    {order.orderStatus==="completed" && order.paymentStatus==="paid" && <div className="mt-8"><h2 className="mb-4 text-xl font-bold">Review your purchases</h2><div className="flex flex-wrap gap-4">{order.items.map(item=><button key={item.product} type="button" className="rounded-full border border-pink px-5 py-3 text-pink" onClick={()=>setReviewProduct(String(item.product))}>Review {item.name}</button>)}</div>{reviewProduct && <div className="mt-6"><ProductReviews key={reviewProduct} productId={reviewProduct}/></div>}</div>}
    <Link href="/orders" className="inline-block mt-8 text-pink underline">All orders</Link>
  </section>;
}
