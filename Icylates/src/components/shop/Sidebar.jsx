"use client";
import Link from "next/link";
import SafeImage from "../common/SafeImage";
import {normalizeProduct} from "@/lib/commerce.mjs";
export default function Sidebar({categories=[],category,setCategory,setPage,minPrice,maxPrice,setMinPrice,setMaxPrice,search,setSearch,featured=[]}) {
  return <div className="px-6 w-full max-w-[280px] space-y-7">
    <label className="block text-sm">Search products<input type="search" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search" className="mt-2 w-full rounded-full border border-gray-300 px-4 py-2"/></label>
    <div><h3 className="text-[22px] berkshire mb-4">Categories</h3>
      {categories.map(cat=><label key={cat.name} className="flex gap-3 items-center mb-3 text-sm"><input type="radio" name="category" checked={category===cat.name} onChange={()=>{setCategory(cat.name);setPage(1);}}/>{cat.name}{Number.isInteger(cat.count) ? ` (${cat.count})` : ""}</label>)}
      <label className="block text-sm">Category name<input value={category==="all" ? "" : category} onChange={e=>{setCategory(e.target.value || "all");setPage(1);}} placeholder="Any category" className="mt-2 w-full rounded border border-gray-300 px-3 py-2"/></label>
    </div>
    <fieldset className="border-t border-gray-200 pt-5"><legend className="text-[22px] berkshire">Filter By Price</legend>
      <div className="flex items-center gap-3 mt-4">
        <label className="text-sm">Minimum<input type="number" min="0" step="0.01" value={minPrice} onChange={e=>{setMinPrice(e.target.value);setPage(1);}} className="w-full mt-2 rounded border border-gray-300 px-2 py-2"/></label>
        <label className="text-sm">Maximum<input type="number" min="0" step="0.01" value={maxPrice} onChange={e=>{setMaxPrice(e.target.value);setPage(1);}} className="w-full mt-2 rounded border border-gray-300 px-2 py-2"/></label>
      </div>
    </fieldset>
    {featured.length>0 && <div className="border-t border-gray-200 pt-5"><h3 className="text-[22px] berkshire mb-4">Products</h3>{featured.slice(0,4).map(input=>{const item=normalizeProduct(input);return item ? <Link href={`/products/${item.slug || item.id}`} key={item.id} className="flex items-center gap-3 mb-4"><SafeImage src={item.image} alt={item.name} width={50} height={50}/><span><span className="block text-sm font-semibold">{item.name}</span><span className="text-pink">${item.price.toFixed(2)}</span></span></Link> : null;})}</div>}
  </div>;
}
