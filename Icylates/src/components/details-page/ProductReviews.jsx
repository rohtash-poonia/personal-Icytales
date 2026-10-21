"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import Button from "../common/Button";
import { getReviews, createReview, updateReview, deleteReview } from "@/lib/api";

export default function ProductReviews({ productId, onSummary }) {
  const { user } = useAuth();
  const [loaded,setData]=useState(null);
  const owner=user?._id || user?.id || "";
  const data=loaded?.owner===owner && loaded?.productId===productId ? loaded : null;
  const [page,setPage]=useState(1);
  const [attempt,setAttempt]=useState(0);
  const [form,setForm]=useState({rating:5,text:""});
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [saving,setSaving]=useState(false);
  useEffect(()=>{
    const controller=new AbortController();
    getReviews(productId,{page,signal:controller.signal}).then(result=>{
      if(controller.signal.aborted)return;
      setData({...result,owner,productId});setForm(result.mine ? {rating:result.mine.rating,text:result.mine.text} : {rating:5,text:""});setError("");
    }).catch(err=>{if(!controller.signal.aborted)setError(err.message);});
    return ()=>controller.abort();
  },[productId,owner,page,attempt]);
  async function save(event,remove=false){
    event.preventDefault();setSaving(true);setError("");setNotice("");
    try{
      const result=await (remove ? deleteReview(productId) : data.mine ? updateReview(productId,form) : createReview(productId,form));
      onSummary?.(result);setNotice(remove ? "Your review was deleted." : "Your review was saved.");setAttempt(value=>value+1);
    }catch(err){setError(err.message);}finally{setSaving(false);}
  }
  return <section id="reviews" className="space-y-6">
    <h2 className="text-2xl font-bold text-darkbrown">Customer reviews</h2>
    {error && <div role="alert"><p>{error}</p><button type="button" className="text-pink underline" onClick={()=>setAttempt(value=>value+1)}>Retry reviews</button></div>}
    {notice && <p role="status">{notice}</p>}
    {!data && !error && <p role="status">Loading reviews…</p>}
    {data && <><p aria-label="Rating summary">{data.reviewCount ? `${data.rating.toFixed(1)} out of 5 · ${data.reviewCount} reviews` : "No reviews yet."}</p>
      <ul className="space-y-4">{data.items.map(review=><li key={review._id} className="rounded-2xl border border-pink/15 bg-white p-5"><p className="font-semibold">{review.name} · {review.rating}/5</p><p className="mt-2 whitespace-pre-wrap break-words">{review.text}</p></li>)}</ul>
      {data.pagination.pages>1 && <nav aria-label="Review pages" className="flex items-center gap-4"><Button variant="outline" disabled={page===1} onClick={()=>setPage(value=>value-1)} className="px-4 py-2">Previous</Button><span>Page {page} of {data.pagination.pages}</span><Button variant="outline" disabled={page>=data.pagination.pages} onClick={()=>setPage(value=>value+1)} className="px-4 py-2">Next</Button></nav>}
      {!user ? <Link href={`/login?returnTo=${encodeURIComponent(`/products/${productId}#reviews`)}`} className="text-pink underline">Sign in to check review eligibility</Link> : data.eligible || data.mine ? <form onSubmit={save} className="space-y-4 rounded-2xl bg-[#fff5f9] p-5"><h3 className="text-xl font-bold">{data.mine ? "Your review" : "Review your purchase"}</h3>
        {data.eligible && <><label className="block">Rating<select aria-label="Review rating" disabled={saving} value={form.rating} onChange={event=>setForm({...form,rating:Number(event.target.value)})} className="ml-3 rounded-lg border bg-white p-2">{[5,4,3,2,1].map(value=><option key={value} value={value}>{value} stars</option>)}</select></label><label className="block">Review<textarea aria-label="Your review" required maxLength={2000} disabled={saving} value={form.text} onChange={event=>setForm({...form,text:event.target.value})} className="mt-2 block min-h-28 w-full rounded-xl border bg-white p-3"/></label><Button type="submit" theme="primary" loading={saving} className="px-6 py-3">{data.mine ? "Update review" : "Submit review"}</Button></>}
        {data.mine && <Button variant="outline" disabled={saving} onClick={event=>save(event,true)} className="px-6 py-3">Delete my review</Button>}
      </form> : <p>You can review this product after your order is completed and payment is collected.</p>}
    </>}
  </section>;
}
