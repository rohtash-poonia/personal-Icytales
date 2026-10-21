"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useAuth} from "@/components/context/AuthContext";
import {getOrders} from "@/lib/api";
export default function OrdersPage(){
  const {user,loading}=useAuth();
  const [page,setPage]=useState(1);
  const [state,setState]=useState({items:[],pagination:{pages:0},loading:true,error:""});
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    if(!user)return;
    const controller=new AbortController();
    getOrders({page,limit:10,signal:controller.signal}).then(data=>setState({...data,loading:false,error:""})).catch(error=>{if(error.name!=="AbortError")setState(current=>({...current,loading:false,error:error.message}));});
    return ()=>controller.abort();
  },[user,page,attempt]);
  if(loading)return <p role="status" className="container py-16">Loading session…</p>;
  if(!user)return <div className="container py-16"><h1 className="text-3xl font-bold">Your orders</h1><Link href="/login?returnTo=%2Forders" className="text-pink underline">Sign in to view your orders</Link></div>;
  return <section className="container py-16"><h1 className="text-3xl font-bold mb-8">Your orders</h1>{state.loading ? <p role="status">Loading orders…</p> : state.error ? <div role="alert"><p>{state.error}</p><button onClick={()=>{setState(current=>({...current,loading:true}));setAttempt(value=>value+1);}} className="text-pink underline">Try again</button></div> : state.items.length===0 ? <p>No orders yet. <Link href="/shop" className="text-pink underline">Browse products</Link></p> : <div className="space-y-4">{state.items.map(order=><Link key={order._id} href={`/orders/${order._id}`} className="block rounded-2xl border border-gray-200 p-5"><p className="font-semibold break-all">Order {order._id}</p><p>{order.orderStatus} · Payment {order.paymentStatus}</p><p>${Number(order.totalPrice).toFixed(2)}</p><time dateTime={order.createdAt}>{new Date(order.createdAt).toLocaleDateString()}</time></Link>)}</div>}
    {state.pagination.pages>1 && <nav aria-label="Order pages" className="flex gap-5 mt-8"><button disabled={page===1} onClick={()=>{setState(current=>({...current,loading:true}));setPage(value=>value-1);}}>Previous</button><span>{page} / {state.pagination.pages}</span><button disabled={page>=state.pagination.pages} onClick={()=>{setState(current=>({...current,loading:true}));setPage(value=>value+1);}}>Next</button></nav>}
  </section>;
}
