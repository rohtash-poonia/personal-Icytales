"use client";

import React from "react";
import FavouritesSwiper from "../common/FvouritesSwiper";
import Image from "next/image";

const Favourite = () => {
  return (
    <div className=" relative bg-[linear-gradient(301.26deg,#EFD7EF_8%,#F5F9FC_43%,#F8EAE1_64%,#EAF8F9_87%)] ">
      <div className="absolute left-0 top-34">
        <Image
          src="/images/favouritesLeftImg.png"
          height={437}
          width={283}
          alt="ice-cream"
        />
      </div>
      <div className="max-w-283.5 w-full px-3 py-[142px] md:py-[162px] mx-auto ">
        <h2 className=" heading text-center relative z-2 ">
          Our <span className=" text-pink">Classic</span> Favorites
        </h2>
        <p className="text-lightbrown mt-[18px] z-2 relative text-center text-xl leading-6.5   ">
          Check out our top products that our customers love.
        </p>
        {/* swiper */}
        <div className="mt-12.5">
          <FavouritesSwiper />
        </div>
      </div>
      <div className="absolute right-0 bottom-34">
        <Image
          src="/images/favouriteRightImg.png"
          height={500}
          width={212}
          alt="ice-cream"
        />
      </div>
    </div>
  );
};

export default Favourite;
