import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ContactArrow } from "../common/Icons";
import Button from "../common/Button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden pb-24 pt-0 sm:pb-32">
      <Image
        src="/images/figma/original/06a60.png"
        alt=""
        width={244}
        height={393}
        className="pointer-events-none absolute left-0 top-0 hidden opacity-10 2xl:block"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[125px] bg-[url('/images/figma/original/d875a.png')] bg-bottom bg-repeat-x" />
      <div className="relative z-10 w-full max-w-300 mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left Content */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
          {/* Welcome Tag */}
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <span className="w-8 md:w-12 h-0.5 bg-darkbrown"></span>
            <p className="text-xl md:text-2xl lg:text-3xl xl:text-4xl text-[#0F0200] berkshire">
              Welcome to The
            </p>
          </div>

          {/* Main Heading */}
          <h1
            aria-label="Discover Sweet Delights!"
            className="mb-6 text-5xl font-normal leading-[1.05] sm:text-6xl md:text-7xl lg:text-[88px] xl:text-[104px] berkshire"
          >
            <span className="text-darkbrown">Discover </span>
            <span className="text-pink">Sweet</span>
            <br className="hidden sm:block" />
            <span className="text-darkbrown"> Delights!</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl xl:text-2xl leading-relaxed text-[#0F0200] max-w-[600px] mb-8 md:mb-12">
            Relish the timeless taste of handcrafted ice cream, made with
            passion and the finest ingredients.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center xl:justify-start w-full">
            <Button
              as={Link}
              theme="secondary"
              href="/shop"
              className="inline-flex items-center gap-3 lg:gap-4 px-8 md:px-10 py-4 md:py-5 bg-darkpurple text-white text-sm md:text-base lg:text-lg font-semibold rounded-[40px] hover:shadow-xl hover:shadow-darkpurple/30 transition-all duration-300"
            >
              Browse Our Classic Flavors
              <ContactArrow />
            </Button>
          </div>
        </div>

        {/* Right Image */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end mt-6 lg:mt-0">
          <div className="relative w-full max-w-[320px] sm:max-w-112.5 lg:max-w-137.5 xl:max-w-167.25">
            <Image
              src="/images/heroIceCream.png"
              alt="Colorful handcrafted ice cream cone"
              width={669}
              height={783}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
