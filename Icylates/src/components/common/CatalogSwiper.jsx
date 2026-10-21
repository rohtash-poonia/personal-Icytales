"use client";
import {useEffect,useState} from "react";
import {Swiper,SwiperSlide} from "swiper/react";
import {Pagination,Navigation,A11y,Keyboard,Autoplay} from "swiper/modules";
import useCarouselAutoplay from "./useCarouselAutoplay";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import {getProducts} from "@/lib/api";
import ProductDetailsCard from "./ProductDetailsCard";

export default function CatalogSwiper({sort="newest",excludeId,category,featured=false,variant="classic",minimumItems=0}) {
  const autoplay=useCarouselAutoplay();
  const [state,setState]=useState({items:[],loading:true,error:""});
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    getProducts({sort,category,featured:featured || undefined,limit:8,signal:controller.signal})
      .then(async data=>{
        const items=data.items || [];
        // Keep featured products first; use existing products from their category
        // to leave room for the loop while displaying four cards on desktop.
        if(featured && items.length<minimumItems){
          try {
            const extra=await getProducts({sort,category:category || items[0]?.category,featured:false,limit:minimumItems,signal:controller.signal});
            for(const item of extra.items || []){
              if(items.length>=minimumItems)break;
              if(!items.some(existing=>existing._id===item._id))items.push(item);
            }
          } catch(error){if(error.name==="AbortError")throw error;}
        }
        if(!controller.signal.aborted)setState({items,loading:false,error:""});
      })
      .catch(error=>{if(error.name!=="AbortError")setState({items:[],loading:false,error:error.message});});
    return ()=>controller.abort();
  },[sort,category,featured,minimumItems,attempt]);
  const items=state.items.filter(item=>item._id!==excludeId && item.slug!==excludeId);
  if(state.loading)return <p role="status" className="py-8 text-center">Loading products…</p>;
  if(state.error)return <div role="alert" className="py-8 text-center"><p>{state.error}</p><button type="button" className="text-pink underline" onClick={()=>{setState(current=>({...current,loading:true}));setAttempt(value=>value+1);}}>Try again</button></div>;
  if(!items.length)return <p className="py-8 text-center">No products available yet.</p>;
  const visible=count=>Math.min(count,Math.max(1,items.length-1));
  return <Swiper {...autoplay.props} loop={items.length>1} modules={[Pagination,Navigation,A11y,Keyboard,Autoplay]} navigation keyboard={{enabled:true,onlyInViewport:true}} spaceBetween={20} pagination={{clickable:true}} breakpoints={{320:{slidesPerView:1},640:{slidesPerView:visible(2)},1024:{slidesPerView:visible(3)},1280:{slidesPerView:visible(variant==="vegan" ? 3 : 4)}}} className="pb-16! [--swiper-theme-color:#f83d8e] [--swiper-navigation-size:22px] [&_.swiper-wrapper]:items-stretch [&_.swiper-slide]:h-auto!">
    {items.map((item,index)=><SwiperSlide key={item._id}><ProductDetailsCard {...item} variant={variant} priority={index===0}/></SwiperSlide>)}
  </Swiper>;
}


