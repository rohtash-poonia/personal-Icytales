"use client";
import {useState} from "react";
import Link from "next/link";
import SafeImage from "./SafeImage";
import {AddToCard,AddToWishlist,Star} from "./Icons";
import Button from "./Button";
import {useWishlist} from "../context/WishlistContext";
import {useCart} from "../context/CartContext";
import {normalizeProduct} from "@/lib/commerce.mjs";

export default function ProductDetailsCard(props) {
  const product = normalizeProduct(props);
  const imagePriority = Boolean(props.priority);
  const {wishlist,toggleWishlist,pending=[]} = useWishlist();
  const {addItem} = useCart();
  const [hovered,setHovered] = useState(false);
  const [added,setAdded] = useState(false);
  if (!product) return null;
  const liked=wishlist.some(item=>item.id===product.id);
  const href=`/products/${encodeURIComponent(product.slug || product.id)}`;
  const outOfStock=product.stock===0;
  const variant=props.variant || (product.category === "Vegan" ? "vegan" : product.category === "Gelato" ? "gelato" : "classic");
  if (variant !== "classic") return <article className="relative flex h-full flex-col text-center">
    <button type="button" disabled={pending.includes(product.id)} aria-label={`${liked ? "Remove" : "Save"} ${product.name} ${liked ? "from" : "to"} wishlist`} aria-pressed={liked} onClick={()=>toggleWishlist(product)} className="absolute top-3 left-3 z-10 rounded-full bg-white p-3 shadow-sm"><AddToWishlist liked={liked}/></button>
    <Link href={href} className={variant === "gelato" ? "mx-auto flex h-64 w-64 max-w-full items-center justify-center rounded-full bg-[#fff3f7]" : "block overflow-hidden rounded-2xl"}>
      <SafeImage src={product.image} alt={product.imageRecords[0]?.alt || product.name} width={350} height={350} className={variant === "gelato" ? "h-60 w-60 object-contain" : "h-80 w-full object-contain"}/>
    </Link>
    <h3 className="mt-6 min-h-14 text-xl font-bold line-clamp-2"><Link href={href}>{product.name}</Link></h3>
    <p className="mt-3 min-h-5 text-sm">{product.reviewCount ? `★ ${product.rating.toFixed(1)}/5 (${product.reviewCount})` : "No reviews yet"}</p>
    <p className="mb-4 mt-auto pt-4 text-xl font-bold text-pink">${product.price.toFixed(2)}</p>
    <Button theme="primary" className="mx-auto px-7 py-3" disabled={outOfStock} aria-label={`Add ${product.name} to cart`} onClick={()=>{addItem(product);setAdded(true);}}>Add to Cart</Button>
    <p role="status" className="mt-2 text-sm">{outOfStock ? "Out of stock" : added ? "Added to cart" : ""}</p>
  </article>;
  const cardBgColor = product.title.toLowerCase().includes("vanilla") ? "bg-[rgba(247,242,247,1)]" : product.title.toLowerCase().includes("chocolate") ? "bg-[rgba(255,238,238,1)]" : "bg-[rgba(255,250,244,1)]";
  return <article className="bg-white p-2.75 rounded-xl w-full h-full flex flex-col shadow-md mx-auto">
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} className={`${cardBgColor} relative rounded-[10px] p-4`}>
      <button type="button" disabled={pending.includes(product.id)} aria-label={`${liked ? "Remove" : "Save"} ${product.name} ${liked ? "from" : "to"} wishlist`} aria-pressed={liked} onClick={()=>toggleWishlist(product)} className="absolute top-2.5 left-2.5 z-10 bg-white rounded-full p-2.75"><AddToWishlist liked={liked}/></button>
      <Link href={href} className="flex h-60 items-center justify-center">
        <SafeImage src={product.images[hovered && product.images[1] ? 1 : 0]} alt={product.imageRecords[hovered && product.images[1] ? 1 : 0]?.alt || product.name} priority={imagePriority} width={300} height={300} className="h-full w-full object-contain"/>
      </Link>
    </div>
    <div className="mt-5.25 flex flex-1 flex-col">
      <div className="space-y-2">
        <h3 className="min-h-12 line-clamp-2 text-darkbrown text-xl font-bold leading-6"><Link href={href}>{product.name}</Link></h3>
        <p className="flex min-h-5 gap-1 items-center text-sm"><Star/>{product.reviewCount ? `${product.rating.toFixed(1)}/5 (${product.reviewCount})` : "No reviews yet"}</p>
      </div>
      <p className="mt-3.25 min-h-11 text-sm leading-5.5 text-gray-600 line-clamp-2">{product.description || product.category}</p>
      <div className="mt-auto pt-3 flex justify-between items-center">
        <p className="font-bold text-[22px] text-pink">${product.price.toFixed(2)}</p>
        <Button theme="secondary" height="h-[46px]" width="w-[46px]" icons={<AddToCard/>} aria-label={outOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`} disabled={outOfStock} onClick={()=>{addItem(product);setAdded(true);}} type="button"/>
      </div>
      <p className="text-sm mt-2" role="status">{outOfStock ? "Out of stock" : added ? "Added to cart" : ""}</p>
    </div>
  </article>;
}
