"use client";
import {useEffect,useState,useSyncExternalStore} from "react";
const query="(prefers-reduced-motion: reduce)";
const subscribe=callback=>{const media=window.matchMedia(query);media.addEventListener("change",callback);return()=>media.removeEventListener("change",callback);};
export default function useCarouselAutoplay(delay=3000){
  const reduced=useSyncExternalStore(subscribe,()=>window.matchMedia(query).matches,()=>true);
  const [swiper,setSwiper]=useState(null);
  useEffect(()=>{if(!swiper || swiper.destroyed)return;if(reduced)swiper.autoplay?.stop();else swiper.autoplay?.start();},[swiper,reduced]);
  return {props:{onSwiper:setSwiper,speed:500,autoplay:{delay,disableOnInteraction:false,pauseOnMouseEnter:false}}};
}
