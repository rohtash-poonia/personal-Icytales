"use client";
import CatalogSwiper from "../common/CatalogSwiper";
export default function RelatedProducts({productId,category}) {
  return <section className="container pt-20 pb-24 max-md:py-10">
    <div className="text-center mb-8"><h2 className="heading text-darkbrown">Related <span className="text-pink">Products</span></h2><p className="text-lightbrown mt-4">Explore more treats from our catalog.</p></div>
    <CatalogSwiper excludeId={productId} category={category}/>
  </section>;
}
