"use client";

import CatalogSwiper from "@/components/common/CatalogSwiper";

export default function Discount() {
  return (
    <section className="container py-16 lg:py-28">
      <div className="flex flex-col items-center justify-center">
        <h2 className="heading text-darkbrown">Featured <span className="text-pink">Products</span></h2>
        <p className="pt-4.5 text-center text-xl leading-6.5 text-lightbrown max-lg:text-lg max-md:text-base max-sm:text-sm">Browse active products and current server prices.</p>
      </div>
      <div className="mt-10"><CatalogSwiper sort="rating" /></div>
    </section>
  );
}
