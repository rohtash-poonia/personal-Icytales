import Image from 'next/image'
import React from 'react'
import Button from '../common/Button';
import { RightArrow } from '../common/Icons';
import Link from 'next/link';

const Explore = () => {
  return (
    <section className="outer-container relative overflow-hidden py-14 md:py-20 lg:py-0">
      <div className="absolute right-63.25 top-75.5 max-2xl:opacity-15">
        <Image
          src="/images/figma/explore-right-accent.png"
          height={55}
          width={52}
          alt="trianglre"
        />
      </div>
      <div className="absolute bottom-51 left-61.75 max-2xl:opacity-15">
        <Image
          src="/images/figma/explore-left-accent.png"
          height={62}
          width={64}
          alt="triangle"
        />
      </div>
      <div className="absolute top-27.5 left-210.75 max-2xl:opacity-15">
        <Image
          src="/images/figma/explore-top-accent.png"
          height={23}
          width={84}
          alt="triangle"
        />
      </div>
      <div className="absolute bottom-0 right-8 max-2xl:opacity-15">
        <Image
          src="/images/figma/explore-bottom-right.png"
          height={92}
          width={224}
          alt="triangle"
        />
      </div>
      <div className="container ">
        <div className="flex items-center max-md:flex-col justify-between gap-8 lg:min-h-[732px]">
          <article className="relative w-full max-w-[619px] md:w-1/2 shrink-0">
            <Image src="/images/figma/relive-classics.png" height={724} width={619} alt="Customer enjoying a blue ice cream cone" className="h-auto w-full object-contain" />
          </article>
          <aside className="max-w-128.25 w-full flex flex-col gap-8 max-lg:gap-6 max-md:gap-4 max-sm:gap-2">
            <h2 className="heading">
              Relive the Sweet Memories of Classic
              <span className="text-pink"> Ice Creams</span>
            </h2>
            <p className="text-xl max-lg:text-lg max-md:text-base max-md:leading-5 text-lightbrown leading-7.5">
              From rich chocolate fudge to creamy vanilla sundaes, discover our
              menu of classic ice cream creations.
            </p>
              <Button as={Link} href="/shop"
                theme="primary"
                height="h-15.5 max-lg:h-12 max-md:h-10 max-sm:h-8"
                width="w-[238px] max-lg:w-[190px] max-md:w-[160px] max-sm:w-[135px]
          "
                icons={<RightArrow />}
                type="button"
              >
                Explore Our Menu
              </Button>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default Explore
