"use client";
import {createContext,useContext,useEffect,useRef,useState} from "react";
import {normalizeProduct} from "@/lib/commerce.mjs";
import {getWishlist,saveWishlistProduct,removeWishlistProduct} from "@/lib/api";
import {useAuth} from "./AuthContext";
import Link from "next/link";
const WishlistContext = createContext(null);
export const WishlistProvider = ({children}) => {
  const {user,loading:authLoading}=useAuth();
  const userId=user?._id || user?.id || "";
  const [state,setState]=useState({owner:"",items:[],loading:true,error:""});
  const [attempt,setAttempt]=useState(0);
  const [message,setMessage]=useState("");
  const [pending,setPending]=useState([]);
  const locks=useRef(new Set());
  const generation=useRef(0);
  useEffect(()=>{
    const version=++generation.current;
    const controller=new AbortController();
    if(userId) getWishlist({signal:controller.signal}).then(data=>{
      if(version===generation.current)setState({owner:userId,items:data.items.map(normalizeProduct).filter(Boolean),loading:false,error:""});
    }).catch(error=>{if(!controller.signal.aborted)setState({owner:userId,items:[],loading:false,error:error.message});});
    return ()=>{controller.abort();generation.current=version+1;};
  },[userId,attempt]);
  const items=state.owner===userId && userId ? state.items : [];
  const toggleWishlist = async input => {
    const product = normalizeProduct(input);
    if (!product) return;
    if(!userId){setMessage("Sign in to save products to your wishlist.");return;}
    if(state.owner!==userId || state.loading || state.error){setMessage("Open your wishlist and retry loading before saving products.");return;}
    if(locks.current.has(product.id))return;
    const version=generation.current;
    const remove=items.some(item=>item.id===product.id);
    locks.current.add(product.id);setPending([...locks.current]);
    try {
      await (remove ? removeWishlistProduct : saveWishlistProduct)(product.id);
      if(version!==generation.current)return;
      setState(current=>({owner:userId,loading:false,error:"",items:remove ? current.items.filter(item=>item.id!==product.id) : [...current.items.filter(item=>item.id!==product.id),product]}));
      setMessage(remove ? "Removed from wishlist." : "Saved to wishlist.");
    }catch(error){if(version===generation.current){setMessage(error.message);if(error.status===401)setState({owner:userId,items:[],loading:false,error:"Your session expired. Sign in again."});}}
    finally{locks.current.delete(product.id);setPending([...locks.current]);}
  };
  const loading=authLoading || Boolean(userId && (state.owner!==userId || state.loading));
  return <WishlistContext.Provider value={{wishlist:items,toggleWishlist,hydrated:!loading,loading,error:state.owner===userId ? state.error : "",pending,retry:()=>setAttempt(value=>value+1)}}>
    {children}
    {message && <div role="status" className="fixed bottom-4 left-4 right-4 z-[100] mx-auto flex max-w-lg items-center justify-between gap-3 rounded-2xl border border-pink/20 bg-white p-4 text-sm shadow-lg"><span>{message} {!userId && <Link href="/login?returnTo=/wishlist" className="text-pink underline">Sign in</Link>}</span><button type="button" aria-label="Dismiss wishlist notification" onClick={()=>setMessage("")}>×</button></div>}
  </WishlistContext.Provider>;
};
export const useWishlist = () => {
  const context=useContext(WishlistContext);
  if (!context) throw new Error("useWishlist requires WishlistProvider");
  return context;
};
