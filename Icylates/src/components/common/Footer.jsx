import Link from "next/link";
import Image from "next/image";
import React from "react";
import {
  FacebookLink,
  FooterEmail,
  FooterLocation,
  FooterMobile,
  InstagramLink,
} from "./Icons";

const Footer = () => {
  return (
    <footer className="bg-darkpurple relative overflow-hidden">
      <Image src="/images/figma/footer-decoration.png" alt="" width={244} height={293} className="pointer-events-none absolute bottom-0 left-0 opacity-10" />
      <div className="max-w-293 relative z-5 w-full justify-center  md:flex gap-12.5 xl:gap-[109.09px] mx-auto px-4 lg:pt-25 pt-10">
        <div className="max-lg:flex-col flex gap-10 lg:gap-10 xl:gap-16.5">
          <div className="flex items-center gap-2">
            <Link href="/" aria-label="IcyTales home"><Image src="/images/figma/original/1136d.png" alt="IcyTales" width={130} height={108} className="h-auto w-[185px] object-contain" /></Link>
          </div>
          <div>
            <h3 className="text-[18px] sm:text-[22px] font-semibold text-white">
              Navigation
            </h3>
            <ul className="grid grid-cols-2 max-sm:grid-cols-3 max-md:grid-cols-6 gap-x-2 lg:gap-x-6.25 xl:gap-x-[47.68px] gap-y-4.5 text-[#CFB6E2] text-[12px] sm:text-[14px] font-light max-w-md  lg:mx-auto pt-6.25">
              <li className="flex items-center gap-1 md:gap-4">
                <span className="min-w-2 max-w-2 h-2 bg-pink-400 rounded-full"></span>
                <Link href="/">Home</Link>
              </li>

              <li className="flex items-center gap-1 md:gap-4">
                <span className="min-w-2 max-w-2 h-2 bg-pink-400 rounded-full"></span>
                <Link href="/shop">Products</Link>
              </li>

              <li className="flex items-center gap-1 md:gap-4 relative">
                <span className="min-w-2 max-w-2 h-2 bg-pink-400 rounded-full"></span>
                <Link href="/about-us" className="relative">
                  About
                </Link>
              </li>

              <li className="flex items-center gap-1 md:gap-4">
                <span className="min-w-2 max-w-2 h-2 bg-pink-400 rounded-full"></span>
                <Link href="/blog">Blog</Link>
              </li>

              <li className="flex items-center gap-1 md:gap-4">
                <span className="min-w-2 max-w-2 h-2 bg-pink-400 rounded-full"></span>
                <Link href="/shop">Shop</Link>
              </li>

              <li className="flex items-center gap-1 md:gap-4">
                <span className="min-w-2 max-w-2 h-2 bg-pink-400 rounded-full"></span>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-6.25 xl:gap-[69.38px] max-md:justify-between max-md:pt-10 max-lg:pt-32 ">
          <div className="flex flex-col gap-6 ">
            <div className="flex gap-2 sm:gap-5.5">
              <FooterLocation />
              <div>
                <h3 className="text-[14px] sm:text-[16px] font-semibold text-white">
                  Address:
                </h3>
                <p className="text-[10px] sm:text-[14px] text-[#CFB6E2] pt-2 w-30 sm:w-[206.62px]">
                  121 King Street Melbourne, 3000, Australia
                </p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-5.5">
              <FooterEmail />
              <div>
                <h3 className="text-[14px] sm:text-[16px] font-semibold text-white">
                  Email:
                </h3>
                <p className="text-[10px] sm:text-[14px] text-[#CFB6E2] pt-2.5">
                  <Link href="/contact" className="underline">Send us a message</Link>
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-7.5">
            <div className="flex gap-1 sm:gap-5.5">
              <div className="pt-2">
                <FooterMobile />
              </div>
              <div>
                <h3 className="text-[12px] sm:text-[16px] lg:text-[20px] font-bold text-white">
                  <Link href="/contact">Contact our team</Link>
                </h3>
                <p className="text-[8px] sm:text-[14px] text-[#CFB6E2] pt-1.5 ">
                  We’re happy to help.
                </p>
              </div>
            </div>
            <div className="flex gap-[15.36px]">
              <span aria-hidden="true"><FacebookLink /></span>
              <span aria-hidden="true"><InstagramLink /></span>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-285.5 border-[#FFFFFF26] border-t w-full mx-auto px-4 mt-22.5">
        <p className="text-[10px] sm:text-[12px] text-[#CFB6E2] text-center py-4.5">
           Copyright © {new Date().getFullYear()} BlackRise Themes Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
