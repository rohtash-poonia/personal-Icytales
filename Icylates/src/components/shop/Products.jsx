"use client";
import {useEffect,useState} from "react";
import {useSearchParams} from "next/navigation";
import Link from "next/link";
import ProductDetailsCard from "../common/ProductDetailsCard";
import Sidebar from "./Sidebar";
import SafeImage from "../common/SafeImage";
import {GridIcon,ListIcon,Star} from "../common/Icons";
import {getProducts} from "@/lib/api";
import {normalizeProduct} from "@/lib/commerce.mjs";

export default function Products() {
  const searchParams=useSearchParams();
  const [search,setSearch]=useState(searchParams.get("search") || "");
  const [minPrice,setMinPrice]=useState("");
  const [maxPrice,setMaxPrice]=useState("");
  const [view,setView]=useState("grid");
  const [category,setCategory]=useState(searchParams.get("category") || "all");
  const [sort,setSort]=useState("newest");
  const [page,setPage]=useState(1);
  const [isSidebarOpen,setIsSidebarOpen]=useState(false);
  const [attempt,setAttempt]=useState(0);
  const [state,setState]=useState({items:[],categories:[],pagination:{total:0,pages:0},loading:true,error:""});
  const perPage=6;
  useEffect(()=>{queueMicrotask(()=>{setSearch(searchParams.get("search") || "");setCategory(searchParams.get("category") || "all");setPage(1);});},[searchParams]);
  useEffect(()=>{
    const controller=new AbortController();
    const timer=setTimeout(()=>{
      setState(current=>({...current,loading:true,error:""}));
      getProducts({search:search.trim(),category,sort,page,limit:perPage,minPrice,maxPrice,signal:controller.signal})
        .then(data=>setState({items:data.items || [],categories:data.categories || [],pagination:data.pagination || {total:0,pages:0},loading:false,error:""}))
        .catch(error=>{if(error.name!=="AbortError")setState(current=>({...current,items:[],loading:false,error:error.message}));});
    },200);
    return ()=>{clearTimeout(timer);controller.abort();};
  },[search,category,sort,page,minPrice,maxPrice,attempt]);
  useEffect(()=>{
    if(!isSidebarOpen)return;
    const close=event=>{if(event.key==="Escape")setIsSidebarOpen(false);};
    document.addEventListener("keydown",close);
    return ()=>document.removeEventListener("keydown",close);
  },[isSidebarOpen]);
  const categories=[{name:"all"},...state.categories];
  const sidebarProps={categories,category,setCategory,setPage,minPrice,maxPrice,setMinPrice,setMaxPrice,search,setSearch,featured:state.items};
  return <div className="min-h-screen flex relative py-20">
    <div className="flex max-w-[1164px] w-full px-3 mx-auto flex-col lg:flex-row gap-8">
      {isSidebarOpen && <button type="button" aria-label="Close filters" className="fixed inset-0 bg-black/40 z-40 xl:hidden" onClick={()=>setIsSidebarOpen(false)}/>}
      {isSidebarOpen && <div role="dialog" aria-modal="true" aria-label="Product filters" className="fixed top-0 left-0 h-full overflow-y-auto w-[280px] bg-white z-50 xl:hidden">
        <div className="p-4 flex justify-between items-center mb-4 border-b border-gray-200"><h3 className="font-semibold">Filters</h3><button autoFocus aria-label="Close filters" onClick={()=>setIsSidebarOpen(false)}>✕</button></div><Sidebar {...sidebarProps}/>
      </div>}
      <div className="hidden xl:block w-[260px] shrink-0"><Sidebar {...sidebarProps}/></div>
      <div className="flex-1 min-w-0">
        <button onClick={()=>setIsSidebarOpen(true)} className="xl:hidden mb-4 bg-pink text-white px-5 py-2 rounded-full">Filters</button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <button type="button" aria-label="Grid view" aria-pressed={view==="grid"} onClick={()=>setView("grid")} className={`w-10 h-10 rounded-md flex items-center justify-center ${view==="grid" ? "bg-pink text-white" : "bg-gray-100"}`}><GridIcon/></button>
            <button type="button" aria-label="List view" aria-pressed={view==="list"} onClick={()=>setView("list")} className={`w-10 h-10 rounded-md flex items-center justify-center ${view==="list" ? "bg-pink text-white" : "bg-gray-100"}`}><ListIcon/></button>
            <p className="text-sm text-gray-500" aria-live="polite">{state.pagination.total ? `Showing ${(page-1)*perPage+1}–${Math.min(page*perPage,state.pagination.total)} of ${state.pagination.total} results` : "0 results"}</p>
          </div>
          <select aria-label="Sort products" value={sort} onChange={e=>{setSort(e.target.value);setPage(1);}} className="border border-gray-200 rounded-full px-5 py-2 text-sm">
            <option value="newest">Default Sorting</option><option value="price-asc">Price Low to High</option><option value="price-desc">Price High to Low</option><option value="rating">Highest rated</option>
          </select>
        </div>
        {state.loading ? <p role="status" className="py-12 text-center">Loading products…</p> : state.error ? <div role="alert" className="py-12 text-center"><p>{state.error}</p><button className="underline text-pink mt-3" onClick={()=>setAttempt(value=>value+1)}>Try again</button></div> : !state.items.length ? <p className="py-12 text-center">No products match these filters.</p> :
          <div className={view==="grid" ? "grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-6" : "flex flex-col gap-6"}>
            {state.items.map((input,index)=>{const item=normalizeProduct(input);if(!item)return null;return view==="grid" ? <ProductDetailsCard key={item.id} {...item} priority={index===0}/> : <article key={item.id} className="flex flex-wrap gap-6 bg-white p-4 rounded-lg shadow-md">
              <Link href={`/products/${item.slug || item.id}`}><SafeImage src={item.image} alt={item.name} width={160} height={160} className="w-40 h-40 object-contain"/></Link>
              <div className="flex-1 min-w-40"><h3 className="font-semibold text-lg"><Link href={`/products/${item.slug || item.id}`}>{item.name}</Link></h3><p className="text-gray-500">{item.description}</p><p className="text-pink font-bold mt-2">${item.price.toFixed(2)}</p><p className="flex items-center gap-1"><Star/>{item.rating}/5</p><Link href={`/products/${item.slug || item.id}`} className="text-pink underline">View product</Link></div>
            </article>;})}
          </div>}
        {state.pagination.pages>1 && <nav aria-label="Product pages" className="flex justify-center items-center mt-11 gap-3">
          <button disabled={page===1 || state.loading} onClick={()=>setPage(value=>value-1)} className="px-4 py-2 rounded-full bg-white shadow disabled:opacity-40">Previous</button>
          <span>{page} / {state.pagination.pages}</span>
          <button disabled={page>=state.pagination.pages || state.loading} onClick={()=>setPage(value=>value+1)} className="px-4 py-2 rounded-full bg-white shadow disabled:opacity-40">Next</button>
        </nav>}
      </div>
    </div>
  </div>;
}
