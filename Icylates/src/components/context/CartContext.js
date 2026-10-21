"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { addCartItem, parseStoredCart } from "@/lib/commerce.mjs";
const CartContext = createContext(null);
const STORAGE_KEY = "icytales_cart";
export const CartProvider = ({children}) => {
  const [state,setState] = useState({items:[],hydrated:false});
  useEffect(() => {
    let items = [];
    try {items = parseStoredCart(localStorage.getItem(STORAGE_KEY));} catch {}
    // Hydrate before allowing persistence so a mount never overwrites a saved cart.
    queueMicrotask(() => setState({items,hydrated:true}));
  },[]);
  useEffect(() => {
    if (!state.hydrated) return;
    try {localStorage.setItem(STORAGE_KEY,JSON.stringify(state.items));} catch {}
  },[state]);
  const addItem = (product,quantity=1) => setState(current => ({...current,items:addCartItem(current.items,product,quantity)}));
  const matches = (item,key) => item.key === key || item.id === key;
  const removeItem = key => setState(current => ({...current,items:current.items.filter(item => !matches(item,key))}));
  const updateQty = (key,quantity) => {
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) return;
    setState(current => ({...current,items:current.items.map(item => matches(item,key) ? {...item,qty:Math.min(qty,item.stock ?? 999,999)} : item)}));
  };
  const clearCart = () => setState(current => ({...current,items:[]}));
  const subtotal = state.items.reduce((sum,item) => sum + item.price*item.qty,0);
  return <CartContext.Provider value={{cartItems:state.items,hydrated:state.hydrated,addItem,removeItem,updateQty,clearCart,subtotal}}>{children}</CartContext.Provider>;
};
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart requires CartProvider");
  return context;
};
