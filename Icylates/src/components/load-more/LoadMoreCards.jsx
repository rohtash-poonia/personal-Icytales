"use client";
import React, {useState} from 'react'
import { MoreProducts, NewProducts } from '../common/Helper';
import { AdminIcon, CalenderIcon, VirtualAssistantIcon } from '../common/Icons';
import Link from 'next/link';
import Image from 'next/image';

const LoadMoreCards = () => {
  const [visible, setVisible] = useState(3);
  const cards = [...MoreProducts, ...NewProducts.filter(item => !MoreProducts.some(first => first.id === item.id))];
  return (
    <div className="max-w-285 w-full mx-auto px-3 pt-32.5 pb-25 max-lg:py-22 max-md:py-14 max-sm:py-8">
      <div className="grid grid-cols-3 gap-7.5 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {cards.slice(0, visible).map((items) => (
          <div
            key={items.id}
            className="max-w-87.5 max-sm:max-w-110 w-full max-lg:mx-auto rounded-[20px] shadow-[0px_6px_41px_6px_rgba(0,0,0,0.05)]"
          >
            <div className="max-sm:flex max-sm:justify-center max-sm:pt-4">
              <Image
                src={items.productimage}
                height={247}
                width={350}
                alt="product image"
              />
            </div>
            <div className="border-b border-[rgba(0,0,0,0.15)]">
              <div className="p-[20px_24px_0px_20px]">
                <div className="flex items-center justify-between max-md:gap-4 gap-6">
                  <div className="flex  items-center gap-1">
                    <span>
                      <AdminIcon />
                    </span>
                    <span className="text-lightbrown leading-5 tex-sm">
                      By : Admin
                    </span>
                  </div>
                  <div className="flex  items-center gap-1">
                    <span>
                      <VirtualAssistantIcon />
                    </span>
                    <span className="text-lightbrown leading-5 tex-sm">
                      Virtual Assistant
                    </span>
                  </div>
                </div>
                <p className="text-darkbrown  font-medium text-xl leading-7.5 pt-4.75 pb-6 ">
                  Why You Need Virtual Assistant for Your Company
                </p>
              </div>
            </div>
            <div className="px-5 py-4.5 flex justify-between gap-1">
              <div className="flex items-center gap-2">
                <span>
                  <CalenderIcon />
                </span>
                <span className="text-lightbrown text-sm leading-5">
                  Dec 20,2022
                </span>
              </div>
              <div>
                <Link href="/blog" className="inline-flex min-h-[39px] items-center justify-center rounded-full bg-pink px-3 text-xs font-semibold text-white">Browse articles</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      {visible < cards.length && <button type="button" onClick={() => setVisible(count => count + 3)} className="mx-auto mt-12 block rounded-full bg-pink px-8 py-4 font-semibold text-white">Load More</button>}
      <p role="status" className="mt-4 text-center text-sm text-lightbrown">Showing {Math.min(visible, cards.length)} of {cards.length} articles</p>
    </div>
  );
}

export default LoadMoreCards
