"use client";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { teamData } from "@/components/common/Helper";
import {
  Facebookicon,
  Instaicon,
  OurTeamNext,
  OurTeamPrev,
  Youtubeicon,
} from "@/components/common/Icons";

import Image from "next/image";
import React from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, A11y, Keyboard, Pagination } from "swiper/modules";
import useCarouselAutoplay from "../common/useCarouselAutoplay";

const Team = () => {
  const autoplay=useCarouselAutoplay();
  return (
    <section className="w-full py-35.5 max-lg:py-26 max-md:py-16 max-sm:py-8 bg-[linear-gradient(299.54deg,#EFD7EF_8%,#F5F9FC_43%,#F8EAE1_64%,#EAF8F9_87%)]">
      <div className="max-w-6xl mx-auto px-6 text-center relative">
        {/* Heading */}
        <h2 className="heading text-darkbrown">
          Our <span className="text-pink">Team</span> Members
        </h2>

        {/* Subtitle */}
        <p className="pt-4.5 text-lightbrown leading-6.5 text-xl text-center  max-md:leading-4 max-lg:text-lg max-md:text-base max-sm:text-sm max-lg:pt-5 max-md:pt-5 max-sm:pt-3">
          Get to know the friendly faces behind your favorite flavors.
        </p>

        {/* ===== Navigation Buttons (OUTSIDE SWIPER) ===== */}

        {/* Prev */}
        <button type="button" aria-label="Previous team members" className="team-prev absolute m-5 left-0 top-[60%] -translate-y-1/2 z-10 cursor-pointer">
          <OurTeamPrev />
        </button>

        {/* Next */}
        <button type="button" aria-label="Next team members" className="team-next absolute right-0 top-[60%] m-5 -translate-y-1/2 z-10 cursor-pointer">
          <OurTeamNext />
        </button>

        {/* ===== Swiper ===== */}
        <div className="pt-12.5 max-lg:pt-9 max-md:pt-6 max-sm:pt-4 px-8">
          {/* px diya taaki buttons overlap na kare */}

          <Swiper
            {...autoplay.props}
            modules={[Navigation, Autoplay, A11y, Keyboard, Pagination]}
            pagination={{clickable:true}}
            className="pb-12! [--swiper-theme-color:#f83d8e]"
            keyboard={{enabled:true,onlyInViewport:true}}
            spaceBetween={30}
            slidesPerView={1}
            loop={true}
            navigation={{
              prevEl: ".team-prev",
              nextEl: ".team-next",
            }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 20 },
              // 768: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3 },
            }}
          >
            {teamData.map((member) => (
              <SwiperSlide key={member.id}>
                <div className="flex flex-col items-center">
                  {/* Image */}
                  <div className="relative w-52 h-52 rounded-full overflow-hidden shadow-[0px_12px_105px_12px_#00000008]">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="208px"
                      className="object-cover"
                    />
                  </div>

                  {/* Name */}
                  <h3 className="pt-8 max-lg:pt-6 max-md:pt-4 text-[22px] max-md:text-lg max-sm:text-base font-bold leading-5.5 text-darkbrown">
                    {member.name}
                  </h3>

                  {/* Role */}
                  <p className="text-lightbrown leading-6 max-md:leading-4 max-md:text-sm max-sm:text-xs pt-1.75">
                    {member.role}
                  </p>

                  {/* Social */}
                    <div aria-hidden="true" className="flex gap-2.5 pt-5 max-md:pt-3 max-sm:pt-2">
                      <div className="w-11.25 h-11.25 rounded-full bg-pink flex items-center justify-center text-white">
                      <Facebookicon />
                    </div>
                      <div className="w-11.25 h-11.25 rounded-full bg-pink flex items-center justify-center text-white">
                      <Instaicon />
                    </div>
                      <div className="w-11.25 h-11.25 rounded-full bg-pink flex items-center justify-center text-white">
                      <Youtubeicon />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Team;
