/** @format */
"use client";
import React from "react";
import Button from "../common/Button";
import Image from "next/image";
import Link from "next/link";

const SummerSpecial = () => {
  return (
    <section className="relative w-full overflow-hidden bg-[linear-gradient(105deg,#582686_0%,#582686_55%,#f53b90_55%,#f53b90_100%)] py-16 md:py-24">
      <div className="container relative z-10 grid items-center gap-10 lg:grid-cols-2">
        <article className="w-full text-center lg:text-left">
          <h2 className="berkshire text-6xl leading-none text-white sm:text-7xl lg:text-[92px]">
            Summer Special!
          </h2>
          <p className="mt-6 text-xl text-white sm:text-2xl lg:text-[30px]">
            Find your favorite sundae this summer.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <Button as={Link} href="/shop?category=Sundaes"
                theme="primary"
                height="h-12"
                width="w-44"
                leading="leading-5"
                className="  flex gap-[17.65px]"
                type="button"
              >
                Browse Sundaes
                {/* <ArrowIcon /> */}
              </Button>
            <p className="text-white">Fresh flavors for sunny days.</p>
          </div>
        </article>
        <aside className="relative flex min-h-[340px] items-center justify-center">
          <Image
            src="/images/figma/summer-sundae.png"
            alt="Chocolate sundae summer special"
            width={563}
            height={538}
            className="h-auto w-full max-w-[563px] object-contain"
          />
        </aside>
      </div>
      <Image
        src="/images/figma/summer-special.png"
        alt=""
        width={222}
        height={369}
        className="absolute right-0 top-1/2 hidden -translate-y-1/2 opacity-60 xl:block"
      />
      <Image
        src="/images/figma/summer-accent.png"
        alt=""
        width={265}
        height={133}
        className="absolute right-[38%] top-6 hidden opacity-70 lg:block"
      />
    </section>
  );
};

export default SummerSpecial;
