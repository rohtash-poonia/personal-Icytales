import Button from '@/components/common/Button';
import { RightArrow } from '@/components/common/Icons';
import Image from 'next/image';
import React from 'react';
import Link from 'next/link';

const Misson = () => {
  return (
    <section id="our-mission" className="relative flex justify-end max-w-480  w-full bg-darkpurple mx-auto">
      <div className="absolute top-53.75 left-42.5 max-2xl:opacity-40 ">
        <Image
          src="/images/figma/original/e62bc.png"
          height={52}
          width={47}
          alt="triangle"
        />
      </div>
      <div className="absolute left-33.75 bottom-63 max-2xl:opacity-20 ">
        <Image
          src="/images/figma/original/7df06.png"
          height={46}
          width={44}
          alt="triangle"
        />
      </div>

      {/* Container */}
      <div className="max-w-381.25  w-full relative flex items-center pl-3 justify-between max-lg:flex-col max-lg:py-30 max-md:py-16 max-sm:py-8 max-lg:px-3 gap-4 max-lg:gap-8 max-md:gap-6">
        {/* docorative image */}
        <div className="absolute left-125 max-2xl:opacity-40  bottom-33">
          <Image
            src="/images/figma/original/a7d9f.png"
            height={70}
            width={78}
            alt="triangle"
          />
        </div>

        <article className="max-w-130 w-full max-lg:items-center flex flex-col gap-10 max-lg:gap-8 max-md:gap-5 max-sm:gap-2 ">
          {/* Heading */}
          <h2 className="heading text-white  max-lg:text-center">
            Our Mission is to 
            Create Moments
          </h2>

          {/* Paragraph */}
          <p className="leading-8 text-xl  max-lg:leading-6 max-md:leading-5 max-sm:leading-4 max-lg:text-lg max-sm:text-sm max-md:text-base text-white max-lg:text-center ">
            We strive to foster a welcoming and joyful environment where
            customers of all ages can gather, celebrate, and make lasting
            memories. Our commitment extends beyond serving great ice cream.
          </p>

          {/* Button */}
          <Button as={Link} href="/contact"
            theme="primary"
            height="h-15.5 max-sm:h-8 max-lg:h-12 max-md:h-10 mt-2"
            width="w-[192px] max-lg:w-[175px] max-sm:w-[120px] max-md:w-[140px]"
            leading="leading-5"
            icons={<RightArrow />}
            className="uppercase tracking-wide"
            type="button"
          >
            Read More
          </Button>
        </article>

        <aside className="relative flex justify-center overflow-hidden ">
          {/* Image */}
          <div className="relative w-230.25 h-180.75 max-2xl:w-205 max-2xl:h-160 max-lg:w-180 max-lg:h-100  max-xl:w-160 max-xl:h-120 max-md:w-140 max-sm:w-77.5 max-sm:h-100 max-sm:rounded-full max-md:h-120 ">
            <Image
              src="/images/figma/original/22ec3.png"
              alt="Mission"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Misson
