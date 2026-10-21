import Image from 'next/image';
import React from 'react'
import { AdminIcon, CalenderIcon, VirtualAssistantIcon } from '../common/Icons';
import Button from '../common/Button';
import Link from 'next/link';
import { NewProducts } from '../common/Helper';

const FourColumnCards = () => {
  return (
    <div className="container pt-32.5 pb-31 max-lg:py-26 max-md:py-16 max-sm:py-8">
      <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
        {NewProducts.map((items) => (
          <div
            key={items.id}
            className="max-w-67 max-sm:max-w-110 w-full max-md:mx-auto rounded-[20px] shadow-[0px_6px_41px_6px_rgba(0,0,0,0.05)]"
          >
            <div className="max-sm:flex max-sm:justify-center max-sm:pt-4">
              <Image
                src={items.productimage}
                height={181}
                width={268}
                alt="product image"
              />
            </div>
            <div className="border-b border-[rgba(0,0,0,0.15)]">
              <div className="p-[18px_16px_0px_10px]">
                <div className="flex items-center justify-between gap-2.5">
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
                <p className="text-lightbrown leading-5.5 py-4.5 ">
                  Curabitur pulvinar euismod ante, ac sagittis ante posuere ac.
                  Vivamus luctus commodo dolor porta feugiat.
                </p>
              </div>
            </div>
            <div className="p-2.5 flex justify-between gap-1">
              <div className="flex items-center gap-2">
                <span>
                  <CalenderIcon />
                </span>
                <span className="text-lightbrown text-sm leading-5">
                  Dec 20,2022
                </span>
              </div>
              <div>
                <Button as={Link} href="/blog"
                  theme="primary"
                  height="h-[34px]"
                  className="px-3 text-xs leading-6.5"
                  type="button"
                  disabled={false}
                >
                  Browse articles
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FourColumnCards
