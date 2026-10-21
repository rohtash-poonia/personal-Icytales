"use client";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, A11y, Keyboard } from "swiper/modules";
import { peopleReviews } from "../common/Helper";
import { RatingsStar } from "../common/Icons";
import "swiper/css";
import "swiper/css/pagination";
import useCarouselAutoplay from "../common/useCarouselAutoplay";

const portraits = [
  ["e7cf0", "left-[14%] top-[28%]", 106, 110],
  ["b26d8", "left-[11%] top-[65%]", 88, 97],
  ["966d2", "left-[22%] top-[53%]", 92, 91],
  ["25163", "left-[24%] top-[72%]", 109, 100],
  ["660f4", "right-[24%] top-[24%]", 102, 107],
  ["44ea2", "right-[11%] top-[42%]", 105, 104],
  ["53de6", "right-[21%] top-[58%]", 83, 77],
  ["2eff7", "right-[26%] top-[75%]", 106, 110],
];
export default function HappyCustomer() {
  const autoplay=useCarouselAutoplay();
  return <section className="relative overflow-hidden bg-[linear-gradient(140deg,#f5e5f5,#f5f9fc,#faf1ec,#eefafb)] py-20 lg:min-h-[958px] lg:py-[152px]">
    {portraits.map(([asset, position, width, height]) => <Image key={asset} src={`/images/figma/original/${asset}.png`} alt="" width={width} height={height} className={`pointer-events-none absolute opacity-15 lg:opacity-30 2xl:opacity-100 ${position}`} />)}
    <div className="container relative text-center">
      <h2 className="heading mx-auto max-w-[650px]">Hear from Our <span className="text-pink">Happy Ice Cream</span> Lovers</h2>
      <Image src="/images/figma/original/9e46d.png" alt="" width={221} height={205} className="pointer-events-none absolute left-1/2 top-48 -translate-x-1/2 opacity-[0.06]" />
      <Swiper {...autoplay.props} modules={[Pagination, Autoplay, A11y, Keyboard]} keyboard={{enabled:true}} slidesPerView={1} loop pagination={{clickable:true}} className="mx-auto mt-16 max-w-[700px] pb-16! lg:mt-32 [&_.swiper-pagination-bullet-active]:bg-pink!">
        {peopleReviews.map(item => <SwiperSlide key={item.id}>
          <blockquote className="px-6 text-lg leading-8 text-lightbrown lg:text-xl">{item.text}</blockquote>
          <p className="mt-8 font-bold text-pink">{item.name}</p>
          <p className="mt-2 text-sm text-lightbrown">{item.role}</p>
          <div aria-label="5 out of 5 stars" className="mt-4 flex justify-center gap-1 text-[#fbab2a]">{Array.from({length:5},(_,i)=><RatingsStar key={i}/>)}</div>
        </SwiperSlide>)}
      </Swiper>
    </div>
  </section>;
}
