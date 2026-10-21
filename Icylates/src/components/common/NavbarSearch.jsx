"use client";
import {useEffect,useRef,useState,useId} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {Search, X} from 'lucide-react';
import {getProducts} from '@/lib/api';

export default function NavbarSearch() {
  const [open,setOpen]=useState(false);
  const [query,setQuery]=useState('');
  const [state,setState]=useState({items:[],loading:false,error:'',query:''});
  const root=useRef(null);
  const input=useRef(null);
  const router=useRouter();
  const id=useId();
  const term=query.trim();
  useEffect(()=>{
    if(!open)return;
    input.current?.focus();
    const close=event=>{if(!root.current?.contains(event.target))setOpen(false);};
    document.addEventListener('pointerdown',close);
    return ()=>document.removeEventListener('pointerdown',close);
  },[open]);
  useEffect(()=>{
    if(!open || !term)return;
    const controller=new AbortController();
    const timer=setTimeout(()=>{
      setState({items:[],loading:true,error:'',query:term});
      getProducts({search:term,limit:5,signal:controller.signal}).then(data=>{
        if(!controller.signal.aborted)setState({items:data.items || [],loading:false,error:'',query:term});
      }).catch(error=>{
        if(!controller.signal.aborted)setState({items:[],loading:false,error:error.message || 'Search is unavailable. Try again.',query:term});
      });
    },300);
    return ()=>{clearTimeout(timer);controller.abort();};
  },[open,term]);
  const waiting=!!term && (state.query!==term || state.loading);
  return <div ref={root} className="relative" onKeyDown={event=>{if(event.key==='Escape'){setOpen(false);root.current?.querySelector('button')?.focus();}}}>
    <button type="button" aria-label="Search products" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(value=>!value)} className="flex h-10 w-10 items-center justify-center rounded-full text-darkbrown hover:bg-pink/10 hover:text-pink"><Search size={21}/></button>
    {open && <div id={id} className="fixed left-3 right-3 top-20 z-50 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96">
      <form role="search" onSubmit={event=>{event.preventDefault();if(term){router.push(`/products?search=${encodeURIComponent(term)}`);setOpen(false);}}}>
        <div className="flex items-center gap-2 rounded-full border border-gray-300 px-3">
          <input ref={input} type="search" aria-label="Search products" placeholder="Search flavors, products…" value={query} maxLength={100} onChange={event=>setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent py-3 outline-none"/>
          {query && <button type="button" aria-label="Clear search" onClick={()=>{setQuery('');input.current?.focus();}} className="p-2"><X size={18}/></button>}
          <button type="submit" aria-label="Submit search" disabled={!term} className="p-2 text-pink disabled:opacity-40"><Search size={18}/></button>
        </div>
      </form>
      {!term ? <p className="mt-3 text-sm text-lightbrown">Search by product, flavor or category.</p> : waiting ? <p role="status" className="mt-3 text-sm">Searching…</p> : state.error ? <p role="alert" className="mt-3 text-sm text-red-700">{state.error}</p> : state.items.length ? <ul className="mt-3 max-h-80 overflow-auto">
        {state.items.map(item=><li key={item._id}><Link href={`/products/${encodeURIComponent(item.slug || item._id)}`} onClick={()=>setOpen(false)} className="flex justify-between gap-3 rounded-lg p-3 hover:bg-pink/5 focus:bg-pink/5"><span>{item.title}</span><span className="text-pink">${Number(item.price).toFixed(2)}</span></Link></li>)}
        <li><Link href={`/products?search=${encodeURIComponent(term)}`} onClick={()=>setOpen(false)} className="block p-3 text-sm font-semibold text-pink">View all results →</Link></li>
      </ul> : <p role="status" className="mt-3 text-sm">No products found for “{term}”. Try another flavor.</p>}
    </div>}
  </div>;
}
