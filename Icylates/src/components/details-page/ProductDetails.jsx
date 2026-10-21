"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import SafeImage from "../common/SafeImage";
import Button from "../common/Button";
import {AddToWishlist,RightArrow} from "../common/Icons";
import {useCart} from "../context/CartContext";
import {useWishlist} from "../context/WishlistContext";
import {getProductById,getProductBySlug} from "@/lib/api";
import {normalizeProduct} from "@/lib/commerce.mjs";
import ProductReviews from "./ProductReviews";

export default function ProductDetail({productId}) {
  const [state,setState]=useState({product:null,loading:true,error:""});
  const [mainImage,setMainImage]=useState("");
  const [qty,setQty]=useState(1);
  const [activeTab,setActiveTab]=useState("description");
  const [added,setAdded]=useState(false);
  const [attempt,setAttempt]=useState(0);
  const {addItem}=useCart();
  const {wishlist,toggleWishlist}=useWishlist();
  useEffect(()=>{
    const controller=new AbortController();
    const loader=/^[a-f0-9]{24}$/i.test(productId) ? getProductById : getProductBySlug;
    loader(productId,{signal:controller.signal}).then(data=>{
      const product=normalizeProduct(data);
      if(!product)throw new Error("Product data is unavailable.");
      setState({product,loading:false,error:""});setMainImage(product.image);setQty(1);
      if(window.location.hash==="#reviews")setActiveTab("reviews");
    }).catch(error=>{if(error.name!=="AbortError")setState({product:null,loading:false,error:error.status===404 ? "Product not found." : error.message});});
    return ()=>controller.abort();
  },[productId,attempt]);
  if(state.loading)return <p role="status" className="container py-16 text-center">Loading product…</p>;
  if(state.error)return <div className="container py-16 text-center" role="alert"><h1 className="text-2xl font-bold">{state.error}</h1><button className="underline text-pink mr-5 mt-4" onClick={()=>{setState(current=>({...current,loading:true}));setAttempt(value=>value+1);}}>Try again</button><Link href="/shop" className="text-pink underline">Browse products</Link></div>;
  const product=state.product;
  const liked=wishlist.some(item=>item.id===product.id);
  return <div>
    <section className="container mx-auto pt-24 max-md:pt-12">
      <div className="flex gap-16 max-lg:gap-8 max-md:flex-col">
        <div className={`flex gap-5 flex-1 min-w-0 ${product.category === "Vegan" ? "flex-col-reverse" : "max-sm:flex-col-reverse"}`}>
          <div className={`flex gap-3 overflow-auto ${product.category === "Vegan" ? "flex-row" : "flex-col max-sm:flex-row"}`}>{product.images.map((image,index)=><button key={`${image}-${index}`} type="button" aria-label={`View image ${index+1}`} aria-pressed={mainImage===image} onClick={()=>setMainImage(image)} className="shrink-0 rounded-lg border border-gray-200 p-2"><SafeImage src={image} alt="" width={70} height={70} className="h-[70px] w-[70px] object-contain"/></button>)}</div>
          <div className="flex-1 bg-[#FFF5F9] p-6 rounded-xl"><SafeImage src={mainImage || product.image} alt={product.name} width={400} height={400} className="w-full h-80 object-contain"/></div>
        </div>
        <div className="flex-1"><h1 className="heading text-darkbrown">{product.name}</h1><p className="my-3 text-sm">{product.reviewCount ? `${product.rating.toFixed(1)}/5 · ${product.reviewCount} reviews` : "No reviews yet"}</p><p className="text-pink font-bold text-3xl">${product.price.toFixed(2)}</p><p className="text-lightgray leading-7 mt-4">{product.description}</p><p className="mt-3">{product.stock===0 ? "Out of stock" : product.stock===null ? "Availability confirmed at checkout" : `${product.stock} in stock`}</p>
          {product.flavor && <p className="mt-4">Flavor: <strong>{product.flavor}</strong></p>}
          <div className="flex items-center gap-5 py-8 flex-wrap"><div className="flex items-center gap-4 border border-gray-200 rounded-full px-4 py-3">
            <button type="button" aria-label="Decrease quantity" disabled={qty<=1} onClick={()=>setQty(value=>Math.max(1,value-1))}>−</button>
            <output aria-label="Quantity">{qty}</output>
            <button type="button" aria-label="Increase quantity" disabled={qty>=Math.min(product.stock ?? 999,999)} onClick={()=>setQty(value=>Math.min(value+1,product.stock ?? 999,999))}>+</button>
          </div>
          <Button type="button" theme="primary" height="h-[52px]" width="w-[167px]" icons={<RightArrow/>} disabled={product.stock===0} onClick={()=>{addItem(product,qty);setAdded(true);}}>Add to Cart</Button></div>
          <p role="status" className="text-pink">{added ? "Added to cart." : ""} {added && <Link href="/cart" className="underline">View cart</Link>}</p>
          <button type="button" aria-pressed={liked} onClick={()=>toggleWishlist(product)} className="flex items-center gap-2 py-4"><AddToWishlist liked={liked}/>{liked ? "Remove from wishlist" : "Add to wishlist"}</button>
        </div>
      </div>
    </section>
    <section className="container pt-16 pb-8"><div role="tablist" aria-label="Product information" className="flex gap-8 border-b border-gray-200">{["description","info","reviews"].map(tab=><button key={tab} id={`tab-${tab}`} aria-controls={`panel-${tab}`} role="tab" aria-selected={activeTab===tab} onClick={()=>setActiveTab(tab)} className={`pb-4 capitalize ${activeTab===tab ? "text-pink border-b-2 border-pink" : ""}`}>{tab}</button>)}</div>
      <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`} className="pt-8 text-lightgray leading-7">
        {activeTab==="description" && <p>{product.description}</p>}
        {activeTab==="info" && <p>Category: {product.category || "Uncategorized"}<br/>Product: {product.name}</p>}
        {activeTab==="reviews" && <ProductReviews productId={product.id} onSummary={summary=>setState(current=>({...current,product:{...current.product,...summary}}))}/>}
      </div>
    </section>
  </div>;
}
