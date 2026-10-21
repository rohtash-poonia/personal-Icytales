import Button from "@/components/common/Button";
import { RightArrow } from "@/components/common/Icons";
import Image from "next/image";
import React from "react";
import Link from "next/link";

const Journey = () => {
  return (
    <section className="max-w-480 w-full mx-auto relative">
      <div aria-hidden="true" className="pointer-events-none absolute right-0 max-lg:hidden top-58 opacity-15">
        <Image
          src="/images/figma/original/b51ef.png"
          height={369}
          width={222}
          alt="icecream"
        />
      </div>
      <div className="relative z-10 max-w-7xl w-full mx-auto px-3 ">
        <div className="flex justify-between max-lg:gap-6 gap-4 max-lg:flex-col max-lg:justify-center max-lg:items-center max-lg:py-26 max-md:py-18 max-sm:py-8 py-37">
          <article>
            <Image
              src="/images/figma/original/59afb.png"
              height={590}
              width={590}
              className="aspect-square rounded-full object-cover"
              sizes="(max-width: 640px) 100vw, 590px"
              alt="couple"
            />
          </article>
          <aside className="max-w-138.25 w-full pt-8.75 pb-12.25 max-lg:py-7 max-sm:py-3">
            <div className="flex flex-col gap-10.5 max-lg:gap-7 max-md:gap-5.5 max-sm:gap-4">
              <h2 className="heading text-darkbrown">
                Our <span className="text-pink"> Journey</span> Began With a
                Simple Dream
              </h2>
              <div className="flex flex-col gap-7 max-lg:gap-5 max-md:gap-4 max-sm:gap-2">
                <p className="text-lightbrown text-xl max-lg:text-lg max-md:text-base max-md:leading-6 leading-8">
                  Our goal is to make the best ice cream using only the finest,
                  natural ingredients. From rich, creamy classics to adventurous
                  new creations, every flavor is meticulously crafted in-house
                  to ensure the highest quality and freshness.
                </p>
                <p className="text-lightbrown text-xl leading-8 max-lg:text-lg max-md:text-base max-md:leading-6">
                  We take pride in offering a diverse range of options,
                  including dairy-free, vegan, and gluten-free choices, so
                  everyone can find their perfect scoop.
                </p>
              </div>
              <Button as={Link} href="#our-mission"
                theme="primary"
                height="h-15.5 max-lg:h-12 max-md:h-10 max-sm:h-9"
                width="w-48 max-lg:w-40 max-md:w-34 max-sm:w-30"
                leading="leading-5"
                icons={<RightArrow />}
                className="uppercase tracking-wide"
                type="button"
              >
                Read More
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Journey;
