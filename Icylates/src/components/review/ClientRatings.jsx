"use client";

import { testimonialData } from "@/components/common/Helper";
import { RatingsStar } from "@/components/common/Icons";
import Image from "next/image";
import React from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import useCarouselAutoplay from "../common/useCarouselAutoplay";

const ClientRatings = () => {
  const autoplay=useCarouselAutoplay();
  return (
    <section className="container py-38.25 max-lg:py-28 max-md:py-16 max-sm:py-8">
      {/* Heading */}
      <div className="flex flex-col justify-center items-center">
        <h2 className="heading max-w-145 w-full text-center text-darkbrown">
          Hear From Our <span className="text-pink">Gelato</span> Enthusiasts
        </h2>
        <p className="text-lightbrown pt-5 leading-6.5 text-xl text-center  max-md:leading-4 max-lg:text-lg max-md:text-base max-sm:text-sm max-lg:pt-5 max-md:pt-5 max-sm:pt-3">
          Read testimonials from those who have enjoyed our artisan gelato.
        </p>
      </div>

      {/* Swiper */}

      <Swiper
        {...autoplay.props}
        className="py-15! px-3! max-lg:py-12! max-md:py-8! [&_.swiper-pagination]:bottom-1.5! [&_.swiper-pagination]:flex [&_.swiper-pagination]:justify-center [&_.swiper-pagination]:items-center [&_.swiper-pagination]:gap-2 [&_.swiper-pagination-bullet]:w-3 [&_.swiper-pagination-bullet]:h-3 [&_.swiper-pagination-bullet]:rounded-full [&_.swiper-pagination-bullet]:bg-gray-300 [&_.swiper-pagination-bullet]:opacity-100 [&_.swiper-pagination-bullet]:transition-all [&_.swiper-pagination-bullet]:duration-300 [&_.swiper-pagination-bullet-active]:!bg-[rgba(248,61,142,1)] [&_.swiper-pagination-bullet-active]:scale-125"
        modules={[Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        loop={true}
        pagination={{
          clickable: true,
        }}
        breakpoints={{
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {testimonialData.map((item) => (
          <SwiperSlide key={item.id}>
            <div
              className="bg-white rounded-[20px] p-[50px_32px_51px_35px] max-lg:p-[40px_26px_40px_25px] max-md:p-[30px_16px_30px_18px] relative shadow-[0px_2px_73px_2px_#0000000D] border-b-2 border-pink transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0px_20px_60px_rgba(236,72,153,0.35)]"
            >
              {/* Quote */}
              <Image
                src="/images/figma/original/d6798.png"
                height={28}
                width={41}
                alt="quote"
              />

              {/* Text */}
              <p className="text-lightbrown pt-5.75 leading-6 max-md:leading-4 max-md:text-sm max-sm:text-xs">
                {item.text}
              </p>

              {/* Bottom User */}
              <div className="flex gap-4.75 pt-7.5">
                {/* Image */}
                <div className="w-13.5 h-13.5 relative rounded-full overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="54px"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  {/* Stars */}
                  <div className="flex gap-1 text-yellow-400 pb-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <RatingsStar key={i} />
                    ))}
                  </div>

                  {/* Name */}
                  <h4 className="text-pink font-bold leading-6 text-lg">
                    {item.name}
                  </h4>

                  {/* Role */}
                  <p className="text-lightbrown leading-5 text-sm">
                    {item.role}
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default ClientRatings;
